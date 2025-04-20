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
          당신은 자연스러운 글을 쓰는 블로그 작가입니다. 아래 키워드를 바탕으로 하나의 트렌드 분석 블로그 글을 작성해주세요.

          요구사항:
          - **전체 분량은 최소 1500자 이상**이어야 합니다.
          - **자연스러운 문단 구성**과 **적절한 소제목**을 포함해주세요.
          - 소제목은 "트렌드 변화의 배경", "요즘 사람들이 반응하는 이유", "앞으로의 전망" 등처럼 **사람이 실제로 쓸만한 표현**을 사용해주세요.
          - 모든 내용은 **한국어**로 작성되며, 영어는 사용하지 않습니다.
          - 내용은 마치 사람이 작성한 블로그 글처럼 부드럽고 자연스럽게 이어지도록 구성해주세요.
          - 독자가 실제로 흥미를 가질만한 흐름으로 써주세요.

          아래 형식의 JSON으로만 응답해주세요:

          {
            "title": "사람들이 공감할 만한 자연스러운 제목 (한국어)",
            "content": "(문단 구분과 소제목이 포함된 마크다운 형식 콘텐츠)",
            "hashtags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
            "imageQuery": "이미지 검색용 영어 키워드"
          }

          키워드: ${keyword}
          `;

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
          console.log(`[${keyword}] GPT 원본 응답:`, raw);

          // JSON 형식 검증
          if (!raw.includes('{') || !raw.includes('}')) {
            console.error(`[${keyword}] JSON 형식이 아닌 응답:`, raw);
            throw new Error('응답이 JSON 형식이 아닙니다.');
          }

          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error(`[${keyword}] JSON 추출 실패:`, raw);
            throw new Error('JSON 형식을 찾을 수 없습니다.');
          }

          const jsonStr = jsonMatch[0];
          console.log(`[${keyword}] 추출된 JSON 문자열:`, jsonStr);

          parsedResponse = JSON.parse(jsonStr);
          console.log(`[${keyword}] JSON 파싱 성공:`, parsedResponse);

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
          console.error(`[${keyword}] GPT 응답 파싱 실패:`, {
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            fullError: error,
            response: gptResponse?.choices?.[0]?.message?.content
          });
          throw new Error(`GPT 응답 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
