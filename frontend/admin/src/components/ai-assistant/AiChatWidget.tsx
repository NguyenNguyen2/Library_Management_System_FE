import { Button, Card, Input } from 'antd';
import { CloseOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
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

/**
 * Chatbox AI gợi ý sách dạng widget nổi, cố định góc dưới bên phải — nhúng vào
 * DefaultLayout/LibrarianLayout nên luôn có mặt trên mọi màn hình sau đăng nhập,
 * không còn là 1 trang riêng phải điều hướng tới (route /ai-assistant cũ đã gỡ).
 * Hội thoại + conversation_id giữ nguyên trong suốt phiên làm việc vì widget chỉ
 * mount 1 lần ở layout, không unmount khi chuyển trang.
 */
const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const conversationIdRef = useRef<string>(crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = aiAssistantHooks.useChat();

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending, open]);

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
    <>
      {open && (
        <Card
          className="!fixed !bottom-24 !right-6 !z-[1000] !rounded-2xl !shadow-2xl border border-gray-200 flex flex-col"
          style={{ width: 380, height: 560 }}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">🤖</span>
              <span className="font-semibold text-navyDark text-sm">AI Gợi Ý Sách</span>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
              className="!rounded-full"
            />
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
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
          <div className="border-t border-gray-200 p-2.5 flex items-end gap-2 shrink-0">
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Nhập câu hỏi, ví dụ: "Gợi ý sách cho độc giả Nguyễn Văn A"'
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="!rounded-lg"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={chatMutation.isPending}
              disabled={input.trim() === ''}
              className="!rounded-lg shrink-0"
            />
          </div>
        </Card>
      )}

      {/* Floating toggle button — luôn hiện ở mọi màn hình */}
      <Button
        type="primary"
        shape="circle"
        onClick={() => setOpen((prev) => !prev)}
        className="!fixed !bottom-6 !right-6 !z-[1000] !shadow-2xl !flex !items-center !justify-center"
        style={{ width: 56, height: 56 }}
        icon={open ? <CloseOutlined style={{ fontSize: 20 }} /> : <MessageOutlined style={{ fontSize: 22 }} />}
      />
    </>
  );
};

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span className="text-xl leading-none shrink-0">{isUser ? '👤' : '🤖'}</span>
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
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
                <div className="flex gap-2.5">
                  {rec.cover_image ? (
                    <img
                      src={rec.cover_image}
                      alt={rec.title}
                      className="w-10 h-14 object-cover rounded shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-400 text-base">
                      📖
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-navyDark text-xs">
                      {idx + 1}. {rec.title}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {rec.author} · {rec.category}
                    </div>
                    <div className="text-xs mt-1.5 flex gap-1.5">
                      <span className="shrink-0">🤖</span>
                      <span>{rec.reason}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChatWidget;
