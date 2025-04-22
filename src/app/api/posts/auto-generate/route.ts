import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';
import Post from '@/models/Post';
import OpenAI from 'openai';
import { createApi } from 'unsplash-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^ㄱ-힝a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { keywordCount } = await request.json();
    if (!keywordCount || keywordCount < 1 || keywordCount > 5) {
      return NextResponse.json(
        { error: '키워드 개수는 1~5개 사이여야 합니다.' },
        { status: 400 }
      );
    }

    const unusedKeywords = await KeywordCache.find({ used: false });
    if (unusedKeywords.length < keywordCount) {
      return NextResponse.json(
        { error: '사용 가능한 키워드가 부족합니다.' },
        { status: 400 }
      );
    }

    const selectedKeywords = unusedKeywords.sort(() => 0.5 - Math.random()).slice(0, keywordCount);
    const createdPosts = [];

    for (const { keyword, _id } of selectedKeywords) {
      try {
        const prompt = `
당신은 '트렌드스캐너'라는 블로그의 칼럼니스트입니다.  
당신의 임무는 지금 이 순간 **많은 사람이 검색하고 있는 실시간 트렌드 키워드**를 중심으로,  
1500자 이상의 블로그 포스트를 작성하는 것입니다.

---

🧾 작성 규칙:
1. **글자 수**: 최소 1500자 이상 (내용이 부족하면 실패로 간주)
2. **글의 톤**: 블로그 스타일이지만, 단순한 뉴스 요약이 아닌 **분석 + 인사이트 중심**
3. **문체**: 친절하고 자연스럽게, 어렵지 않게 설명 (하지만 어휘는 너무 가볍지 않게)
4. **구성**:

- **제목**: 독자의 관심을 끌 수 있는 매력적인 문장형 제목 (클릭 유도형)
- **소제목**: 문장형으로 3개 이상, 각 소제목은 최소 3~5문단 분량
  - 예시: "왜 지금 이 뉴스가 주목받고 있는가?", "Z세대는 이 현상을 어떻게 받아들이는가?"
- **각 소제목의 내용 흐름**:
  ① 트렌드의 배경 설명  
  ② 통계, 사례, 사회 반응 등 구체적 정보  
  ③ 전문가 인용이나 관련 인터뷰, 혹은 GPT가 상상한 인사이트  
  ④ 글쓴이(당신)의 해석과 전망  
- **마무리**: 독자에게 질문을 던지며 글을 마무리 (예: "여러분은 어떻게 생각하시나요?")

---

💡 예시 스타일 참고:

## 왜 지금 'AI 저작권'이 논란이 되는가?

최근 여러 온라인 커뮤니티와 뉴스 매체에서 AI가 만든 이미지의 저작권 문제가 뜨거운 감자가 되고 있다. 특히 작가나 디자이너들 사이에서는...

(이후 실제 사례, 반응, 전문가 입장 → 인사이트 → 독자 유도형 질문)

---

📦 출력 형식은 반드시 JSON 형태로 작성해주세요:

{
  "title": "블로그 제목",
  "content": "## 소제목1\\n\\n내용...\\n\\n## 소제목2\\n\\n내용...\\n\\n## 소제목3\\n\\n내용...\\n\\n## 마무리\\n\\n내용...",
  "hashtags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "imageQuery": "영어로 작성된 이미지 검색용 키워드"
}

✏️ 키워드: ${keyword}
`

        const gptResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
        });

        if (!gptResponse?.choices?.[0]?.message?.content) {
          throw new Error('GPT 응답이 유효하지 않습니다.');
        }

        let parsedResponse;
        try {
          const raw = gptResponse.choices[0].message.content;
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("GPT 응답이 유효한 JSON 형식이 아닙니다.");
          }

          parsedResponse = JSON.parse(jsonMatch[0]);

          if (!parsedResponse.title || !parsedResponse.content) {
            throw new Error('필수 필드가 누락되었습니다.');
          }

          parsedResponse.content = parsedResponse.content
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/https?:\/\/[\S]+\.(jpg|jpeg|png|gif|webp)/gi, '')
            .trim();

          if (!Array.isArray(parsedResponse.hashtags) || parsedResponse.hashtags.length === 0) {
            parsedResponse.hashtags = [keyword];
          }

        } catch (error) {
          throw new Error(`GPT 응답 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }

        let imageUrl = '';
        try {
          const query = parsedResponse.imageQuery || parsedResponse.title || keyword;
          const imageResponse = await unsplash.photos.getRandom({ query, count: 1 });

          if (Array.isArray(imageResponse.response)) {
            imageUrl = imageResponse.response[0]?.urls?.regular || '';
          } else if (imageResponse.response?.urls?.regular) {
            imageUrl = imageResponse.response.urls.regular;
          }
        } catch (_) {
          // 이미지 가져오기 실패 시 무시
        }

        const post = await Post.create({
          title: parsedResponse.title || keyword,
          slug: generateSlug(parsedResponse.title || keyword),
          content: parsedResponse.content,
          imageUrl,
          tags: parsedResponse.hashtags || [keyword],
          metadata: {
            autoGenerated: true,
            keywords: [keyword],
          },
        });

        await KeywordCache.findByIdAndUpdate(_id, { used: true });

        createdPosts.push({
          _id: post._id,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          tags: post.tags,
          createdAt: post.createdAt,
        });
      } catch (_) {
        continue;
      }
    }

    if (createdPosts.length === 0) {
      return NextResponse.json(
        { error: '포스트 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '포스트가 성공적으로 생성되었습니다.',
      count: createdPosts.length,
      posts: createdPosts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
