import axios from 'axios';

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

export const generateKeywords = async () => {
  // GPT-3.5를 사용하여 키워드를 생성하는 로직을 추가합니다.
};

export default openaiClient; 