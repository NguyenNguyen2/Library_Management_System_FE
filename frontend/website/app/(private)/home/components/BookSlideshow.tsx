"use client";

import { useEffect, useState } from "react";
import { BookOutlined, HeartFilled, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { IHomeBook } from "@/features/books/api/bookApi";
import { toCoverImageUrl } from "@/lib/utils/image";

const AUTOPLAY_INTERVAL_MS = 2000;
const MOBILE_BREAKPOINT_PX = 640;

export function BookSlideshow({
  books,
  onBookClick,
}: {
  books: IHomeBook[];
  onBookClick: (bookId: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const count = books.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, count]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="flex items-center gap-2 text-xl text-white font-semibold mb-4 drop-shadow">
        <HeartFilled className="text-rose-300" />
        Có thể bạn sẽ thích
      </h2>

      <div
        className="relative h-[21rem] sm:h-[19rem] md:h-[22rem] lg:h-[25rem] overflow-hidden [--item-w:10rem] [--step1:9rem] [--step2:7.5rem] sm:[--item-w:8rem] sm:[--step1:9rem] sm:[--step2:7.5rem] md:[--item-w:10rem] md:[--step1:11.15rem] md:[--step2:9.25rem] lg:[--item-w:12rem] lg:[--step1:13.25rem] lg:[--step2:11rem]"
      >
        {books.map((book, i) => {
          let diff = i - index;
          if (diff > count / 2) diff -= count;
          if (diff < -count / 2) diff += count;

          const isCenter = diff === 0;
          const isSide = Math.abs(diff) === 1;
          const isOuter = Math.abs(diff) === 2;
          const hiddenOnMobile = isMobile && !isCenter;

          const scale = isCenter ? 1.2 : isSide ? 0.92 : isOuter ? 0.83 : 0.7;
          const opacity = hiddenOnMobile ? 0 : isCenter ? 1 : isSide ? 0.8 : isOuter ? 0.6 : 0;
          const blur = isCenter ? 0 : isSide ? 0.5 : isOuter ? 1.5 : 0;
          const brightness = isCenter ? 1 : isSide ? 0.9 : 0.8;
          const clickable = !hiddenOnMobile && Math.abs(diff) <= 2;

          const absDiff = Math.abs(diff);
          const sign = diff === 0 ? 0 : diff > 0 ? 1 : -1;
          const left =
            absDiff === 0
              ? "50%"
              : `calc(50% + ${sign} * (var(--step1) + ${absDiff - 1} * var(--step2)))`;

          return (
            <div
              key={book.book_id}
              onClick={() => clickable && onBookClick(book.book_id)}
              className="absolute top-1/2 w-[var(--item-w)] transition-all duration-500 ease-out"
              style={{
                left,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                zIndex: isCenter ? 40 : isSide ? 25 : isOuter ? 15 : 5,
                pointerEvents: clickable ? "auto" : "none",
                filter: `blur(${blur}px) brightness(${brightness})`,
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <div
                className={`bg-white rounded-xl overflow-hidden border transition-shadow ${
                  isCenter ? "border-blue-300 shadow-2xl" : "border-gray-200 shadow-md"
                }`}
              >
                <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {book.cover_image ? (
                    <img
                      src={toCoverImageUrl(book.cover_image) ?? undefined}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOutlined style={{ fontSize: 36 }} className="text-gray-300" />
                  )}
                  <span
                    className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                      book.available_copies > 0 ? "bg-emerald-500" : "bg-orange-400"
                    }`}
                  >
                    {book.available_copies > 0 ? "Có sẵn" : "Đặt trước"}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {book.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Sách trước"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-50 w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-white/60 backdrop-blur-md shadow-2xl border-2 border-white flex items-center justify-center text-xl text-gray-700 hover:bg-white/90 hover:scale-110 hover:text-blue-600 transition-all duration-300"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={goNext}
              aria-label="Sách tiếp theo"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-50 w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-white/60 backdrop-blur-md shadow-2xl border-2 border-white flex items-center justify-center text-xl text-gray-700 hover:bg-white/90 hover:scale-110 hover:text-blue-600 transition-all duration-300"
            >
              <RightOutlined />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
