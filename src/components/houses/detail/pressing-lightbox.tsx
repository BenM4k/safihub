"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PressingLightboxProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  title: string;
}

export function PressingLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  title,
}: PressingLightboxProps) {
  const t = useTranslations("customerHouses");
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation & focus trapping
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || photos.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galerie photos"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      ref={modalRef}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        aria-label={t("closeGallery")}
      >
        <X className="size-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-50 px-3 py-1 rounded-full bg-black/60 text-white/90 text-xs font-bold">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main photo container */}
      <div
        className="relative w-full max-w-4xl h-[70vh] sm:h-[80vh] flex items-center justify-center select-none"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const deltaX = e.changedTouches[0].clientX - touchStartX.current;
          if (deltaX > 50) handlePrev();
          else if (deltaX < -50) handleNext();
          touchStartX.current = null;
        }}
      >
        <Image
          src={photos[currentIndex]}
          alt={`${title} - photo ${currentIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Photo suivante"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}
