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
당신은 '트렌드스캐너'라는 실시간 트렌드 블로그의 **전문 칼럼니스트**입니다.

아래 키워드는 사람들이 검색하는 '실시간 트렌드'입니다. 당신의 역할은 단순 요약이 아니라, **이 트렌드를 독자에게 쉽고 흥미롭게 분석해서 설명하는 것**입니다.

---

✍️ 반드시 지켜야 할 구성:
1. 전체 글자 수: **최소 1500자 이상**
2. 소제목은 3개 이상, 문장형 제목 사용 (ex. "왜 지금 이 트렌드가 중요한가?")
3. 각 소제목의 구조:
   - (1) 트렌드 배경 설명
   - (2) 실제 사례 또는 데이터
   - (3) 전문가 견해 또는 인사이트
   - (4) 독자와 연결되는 마무리 문장
4. 마지막에는 독자 유도형 마무리 문단 작성 (ex. “여러분은 어떻게 생각하시나요?”)

---

📚 참고 스타일 예시 (따라 써야 함):

## 왜 지금 무인카페가 Z세대에게 인기일까?

무인카페는 최근 몇 년 사이 Z세대 사이에서 빠르게 확산되고 있다. 주문부터 결제까지 모든 과정이 셀프로 이루어지며, 인간과의 접촉을 최소화한 시스템은 팬데믹 이후 새로운 표준으로 자리 잡았다...

## 편리함만 있을까? 무인카페의 숨겨진 단점

하지만 무인카페는 완벽하지 않다. 특히 고령층이나 디지털 기기에 익숙하지 않은 사용자에게는 장벽이 될 수 있다. 실제로 한국소비자원이 발표한 조사에 따르면...

---

출력은 아래 형식으로 주세요:

{
  "title": "블로그 제목",
  "content": "## 소제목1\\n\\n내용...\\n\\n## 소제목2\\n\\n내용...\\n\\n## 소제목3\\n\\n내용...\\n\\n## 마무리\\n\\n내용...",
  "hashtags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "imageQuery": "영어 이미지 검색 키워드"
}

🔑 키워드: ${keyword}
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
