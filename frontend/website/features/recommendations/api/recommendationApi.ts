import axiosInstance from '@/lib/axios/axios-client';

export interface IRecommendation {
  book_id: number;
  title: string;
  author_name: string | null;
  cover_image: string | null;
  avg_rating: number;
  available_copies: number;
  score: number;
}

export interface IRecommendationResponse {
  data: IRecommendation[];
}

export const recommendationApi = {
  get: async (): Promise<IRecommendationResponse> => {
    const response = await axiosInstance.get('/v1/me/recommendations');
    return response.data;
  },
};

export const collaborativeApi = {
  get: async (): Promise<IRecommendationResponse> => {
    const response = await axiosInstance.get('/v1/me/recommendations/collaborative');
    return response.data;
  },
};
