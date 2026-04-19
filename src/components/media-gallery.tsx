"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";

import { MediaItem } from "@/lib/types";

type MediaGalleryProps = {
  media: MediaItem[];
  productName: string;
};

export function MediaGallery({ media, productName }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMedia = useMemo(() => media[activeIndex] ?? media[0], [activeIndex, media]);

  if (!activeMedia) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-amber-100 bg-white">
        {activeMedia.type === "video" ? (
          <video
            controls
            poster={activeMedia.thumbnail}
            className="h-full w-full object-cover"
            preload="metadata"
          >
            <source src={activeMedia.url} />
          </video>
        ) : (
          <div className="group relative h-full w-full">
            <Image
              src={activeMedia.url}
              alt={activeMedia.alt || `${productName} view`}
              fill
              className="object-cover transition duration-500 group-hover:scale-125"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {media.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square overflow-hidden rounded-xl border bg-white transition ${
              activeIndex === index ? "border-brand-500" : "border-amber-100"
            }`}
            aria-label={`View media ${index + 1}`}
          >
            {item.type === "video" ? (
              <>
                <Image
                  src={item.thumbnail || item.url}
                  alt={item.alt || `${productName} video`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                  <PlayCircle size={20} />
                </span>
              </>
            ) : (
              <Image
                src={item.url}
                alt={item.alt || `${productName} image`}
                fill
                className="object-cover"
                sizes="100px"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
