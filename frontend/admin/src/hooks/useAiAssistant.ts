import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { aiAssistantApi, AiAssistantChatResponse } from '../api/aiAssistantApi';

export const aiAssistantHooks = {
  useChat: () => {
    return useMutation<AiAssistantChatResponse, AxiosError, { message: string; conversation_id: string }>({
      mutationFn: aiAssistantApi.chat,
    });
  },
};
