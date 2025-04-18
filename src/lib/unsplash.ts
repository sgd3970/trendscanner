import axios from 'axios';

const unsplashClient = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}`,
  },
});

export const searchImages = async (query: string) => {
  const response = await unsplashClient.get('/search/photos', {
    params: { query, per_page: 10 },
  });
  return response.data;
};

export default unsplashClient; 