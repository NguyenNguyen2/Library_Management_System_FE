import axiosInstance from './axiosInstance';

export interface AiAssistantRecommendation {
  book_id: number;
  title: string;
  author: string;
  category: string;
  reason: string;
}

export interface AiAssistantChatResponse {
  reply: string;
  waiting_for: string | null;
  conversation_id: string;
  reader: { id: number; name: string } | null;
  recommendations: AiAssistantRecommendation[];
}

export const aiAssistantApi = {
  chat: async (payload: { message: string; conversation_id: string }): Promise<AiAssistantChatResponse> => {
    const res = await axiosInstance.post('/private/v1/ai-assistant/chat', payload);
    return res.data;
  },
};
