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
export const maxDuration = 60; // 60초로 수정 (Vercel Hobby 플랜 제한)

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
    console.log('자동 포스트 생성 시작');
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
        console.log(`\n[${keyword}] 포스트 생성 시작`);

        const prompt = `
          당신은 트렌드를 분석해주는 블로그 작가입니다. 다음 키워드를 주제로 한국어 블로그 글을 작성해주세요.

          - 자연스러운 블로그 스타일
          - 소제목은 3개 이상
          - 소제목은 현실적인 이름 (예: 요즘 왜 인기일까?, 사용자 반응은?, 향후 전망 등)
          - 본문은 각 문단 400자 이상, 전체 1500자 이상
          - 반드시 마크다운 형식으로
          - JSON 외 다른 텍스트는 금지

          {
            "title": "자연스러운 한국어 제목 (20자 이내)",
            "content": "## 소제목\\n\\n본문\\n\\n## 소제목2\\n\\n본문\\n\\n## 소제목3\\n\\n본문",
            "hashtags": ["트렌드", "키워드", "분석", "블로그", "자동포스팅"],
            "imageQuery": "영어 이미지 검색어"
          }

          키워드: ${keyword}
          `


        console.log(`[${keyword}] GPT API 호출 시작`);
        let gptResponse;
        try {
          gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
          });
          console.log(`[${keyword}] GPT API 응답 성공:`, JSON.stringify(gptResponse, null, 2));
        } catch (error) {
          console.error(`[${keyword}] GPT API 호출 실패:`, {
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            fullError: error
          });
          throw new Error(`GPT API 호출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }

        if (!gptResponse?.choices?.[0]?.message?.content) {
          console.error(`[${keyword}] GPT 응답이 비어있거나 유효하지 않음:`, {
            response: gptResponse,
            choices: gptResponse?.choices,
            message: gptResponse?.choices?.[0]?.message
          });
          throw new Error('GPT 응답이 유효하지 않습니다.');
        }

        let parsedResponse;
        try {
          const raw = gptResponse.choices[0].message.content;
          console.error(`[${keyword}] GPT 응답 원본:`, raw);

          // JSON 형식 검증 및 추출
          let jsonStr = raw;
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
            console.log(`[${keyword}] 추출된 JSON:`, jsonStr);
          } else {
            console.error(`[${keyword}] JSON 응답 아님:`, raw);
            throw new Error("GPT 응답이 유효한 JSON 형식이 아닙니다.");
          }

          try {
            parsedResponse = JSON.parse(jsonStr);
            console.log(`[${keyword}] JSON 파싱 성공:`, parsedResponse);
          } catch (e) {
            console.error(`[${keyword}] JSON 파싱 오류:`, {
              error: e,
              jsonStr: jsonStr
            });
            throw new Error("GPT 응답 JSON 파싱 실패");
          }

          // 필수 필드 검증
          if (!parsedResponse.title) {
            console.error(`[${keyword}] 제목 필드 누락:`, parsedResponse);
            throw new Error('제목이 누락되었습니다.');
          }
          if (!parsedResponse.content) {
            console.error(`[${keyword}] 내용 필드 누락:`, parsedResponse);
            throw new Error('내용이 누락되었습니다.');
          }

          // 내용 길이 검증
          if (parsedResponse.content.length < 1500) {
            console.error(`[${keyword}] 내용이 너무 짧음:`, {
              length: parsedResponse.content.length,
              content: parsedResponse.content
            });
            throw new Error('내용이 1500자 미만입니다.');
          }

          // 이미지 관련 내용 제거
          const originalContent = parsedResponse.content;
          parsedResponse.content = parsedResponse.content
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/https?:\/\/[\S]+\.(jpg|jpeg|png|gif|webp)/gi, '')
            .trim();

          if (originalContent !== parsedResponse.content) {
            console.log(`[${keyword}] 이미지 관련 내용 제거됨:`, {
              before: originalContent,
              after: parsedResponse.content
            });
          }

          // 해시태그 검증
          if (!Array.isArray(parsedResponse.hashtags) || parsedResponse.hashtags.length === 0) {
            console.warn(`[${keyword}] 해시태그 누락 또는 비어있음:`, parsedResponse.hashtags);
            parsedResponse.hashtags = [keyword];
          }

        } catch (error) {
          console.error(`[${keyword}] GPT 응답 처리 실패:`, {
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            fullError: error,
            response: gptResponse?.choices?.[0]?.message?.content
          });
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
        } catch (error) {
          console.warn(`[${keyword}] Unsplash 이미지 가져오기 실패:`, error);
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
      } catch (error) {
        console.error(`[${keyword}] 포스트 생성 실패:`, error);
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
    console.error('자동 포스트 생성 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
