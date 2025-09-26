import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { Message } from '../types';
import DateChip from './DateChip';

interface ConversationViewProps {
  messages: Message[];
  nextBefore: string | null;
  onLoadMore: () => void;
  isPaginating: boolean;
  searchInfo: {
    maskedPhone: string;
    userId: string;
    count: number;
    lastTs: string;
  };
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.text.split(urlRegex);

    return (
        <div className="flex mb-2">
            <div className="max-w-[80%] rounded-[12px] rounded-tl-[6px] bg-white shadow-sm px-3 py-2">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
                 {parts.map((part, index) =>
                    urlRegex.test(part) ? (
                    <a key={index} href={part} className="text-blue-600 underline">
                        {part}
                    </a>
                    ) : (
                    part
                    )
                )}
                </p>
                <div className="text-[10px] text-[#667085] mt-1 text-right">{message.time}</div>
            </div>
        </div>
    );
};

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  nextBefore,
  onLoadMore,
  isPaginating,
  searchInfo,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const shouldScrollToBottomRef = useRef(true);

  useEffect(() => {
    shouldScrollToBottomRef.current = true;
  }, [searchInfo.userId]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (shouldScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
    } else if (prevScrollHeightRef.current !== null) {
      const scrollHeightBeforePagination = prevScrollHeightRef.current;
      container.scrollTop = container.scrollHeight - scrollHeightBeforePagination;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  const handleLoadMoreClick = () => {
    if (scrollContainerRef.current) {
      prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
    }
    onLoadMore();
  };

  let lastDate: string | null = null;

  return (
    <div className="h-full flex flex-col bg-[#EDEEF2] relative">
       {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none z-20"></div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {nextBefore && (
          <div className="text-center sticky top-2 z-10">
            <button
              onClick={handleLoadMoreClick}
              disabled={isPaginating}
              className="bg-white/80 backdrop-blur-sm text-blue-500 hover:text-blue-700 disabled:opacity-50 text-sm py-1 px-4 rounded-full shadow-sm"
              aria-label="Load older messages"
            >
              {isPaginating ? '読み込み中...' : 'さらに表示'}
            </button>
          </div>
        )}
        {messages.map((msg) => {
          const showDateSeparator = msg.date !== lastDate;
          lastDate = msg.date;
          return (
            <React.Fragment key={msg.ts}>
              {showDateSeparator && <DateChip date={msg.date} />}
              <MessageBubble message={msg} />
            </React.Fragment>
          );
        })}
      </div>
      <div className="bg-white/80 backdrop-blur-sm p-2 border-t border-gray-200 text-[10px] text-gray-600 text-center shrink-0">
        <p>
          検索番号: {searchInfo.maskedPhone} / userId: {searchInfo.userId} / 件数: {messages.length} / 最終: {searchInfo.lastTs}
        </p>
      </div>
    </div>
  );
};

export default ConversationView;