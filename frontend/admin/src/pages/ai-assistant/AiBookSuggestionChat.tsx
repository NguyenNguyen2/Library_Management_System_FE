import { Button, Card, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { aiAssistantHooks } from '../../hooks/useAiAssistant';
import { AiAssistantRecommendation } from '../../api/aiAssistantApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: AiAssistantRecommendation[];
  isError?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Xin chào! Tôi là AI Gợi Ý Sách. Bạn có thể hỏi tôi, ví dụ:\n' +
    '"Gợi ý sách cho độc giả Nguyễn Văn A"',
};

const AiBookSuggestionChat = () => {
  const conversationIdRef = useRef<string>(crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = aiAssistantHooks.useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSend = () => {
    const message = input.trim();
    if (message === '' || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: message }]);
    setInput('');

    chatMutation.mutate(
      { message, conversation_id: conversationIdRef.current },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              text: data.reply,
              recommendations: data.recommendations,
            },
          ]);
        },
        onError: (error: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              text: error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.',
              isError: true,
            },
          ]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-[900px] mx-auto">
      <div className="mb-4">
        <h1 className="text-[26px] font-bold text-navyDark m-0">🤖 AI Gợi Ý Sách</h1>
        <p className="text-gray-500 m-0 mt-1">
          Hỏi AI để tìm sách phù hợp cho độc giả dựa trên lịch sử mượn và sở thích đọc.
        </p>
      </div>

      <Card
        className="!rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden"
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start gap-2.5">
              <span className="text-xl leading-none">🤖</span>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-500 italic">
                AI đang phân tích...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="border-t border-gray-200 p-3 flex items-end gap-2 shrink-0">
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Nhập câu hỏi, ví dụ: "Gợi ý sách cho độc giả Nguyễn Văn A"'
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="!rounded-lg"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={chatMutation.isPending}
            disabled={input.trim() === ''}
            className="!rounded-lg shrink-0"
          >
            Gửi
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span className="text-xl leading-none shrink-0">{isUser ? '👤' : '🤖'}</span>
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : message.isError
                ? 'bg-red-50 text-red-600 rounded-tl-sm'
                : 'bg-gray-100 text-navyDark rounded-tl-sm'
          }`}
        >
          {message.text}
        </div>

        {message.recommendations && message.recommendations.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.recommendations.map((rec, idx) => (
              <Card key={rec.book_id} size="small" className="!rounded-xl w-full">
                <div className="font-semibold text-navyDark">
                  {idx + 1}. {rec.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Tác giả: {rec.author} · Thể loại: {rec.category}
                </div>
                <div className="text-sm mt-2 flex gap-1.5">
                  <span className="shrink-0">🤖</span>
                  <span>{rec.reason}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiBookSuggestionChat;
