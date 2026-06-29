import axiosInstance from '@/lib/axios/axios-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  session_id?: string;
}

export interface ChatResponse {
  reply: string;
}

export const sendChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  console.log('[AI DEBUG] chatApi REQUEST_BODY', {
    message: data.message,
    historyCount: data.history.length,
  });

  try {
    const response = await axiosInstance.post<ChatResponse>('/v1/ai/chat', data);
    console.log('[AI DEBUG] chatApi RESPONSE_SUCCESS', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error: unknown) {
    const axiosErr = error as {
      message?: string;
      isAxiosError?: boolean;
      response?: { status?: number; data?: unknown; headers?: unknown };
    };
    console.error('[AI DEBUG] chatApi CATCH_ERROR', {
      message: axiosErr?.message,
      isAxiosError: axiosErr?.isAxiosError,
      responseStatus: axiosErr?.response?.status,
      responseData: axiosErr?.response?.data,
    });
    throw error;
  }
};
