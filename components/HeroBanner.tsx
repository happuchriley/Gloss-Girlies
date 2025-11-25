"use client";

import { useState, useEffect, useRef } from "react";

interface BannerItem {
  id: number;
  type: "image" | "video";
  image?: string;
  video?: string;
  poster?: string;
  alt: string;
}

const banners: BannerItem[] = [
  {
    id: 1,
    type: "image",
    image: "/images/Gloss Girlies.jpg",
    alt: "Gloss Girlies",
  },
  {
    id: 2,
    type: "image",
    image:
      "https://media6.ppl-media.com/tr:w-720,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1763624428_dermdoc__salicylic_facewash_1476x1028.jpeg",
    alt: "Salicylic Facewash",
  },
  {
    id: 3,
    type: "image",
    image:
      "https://media6.ppl-media.com/tr:w-720,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1763543058_lorealparis_hydratedhair_aditi_copy_1_1476x1028.jpeg",
    alt: "Hydrated Hair",
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay auto-slide significantly to ensure LCP image loads completely first
    let intervalId: NodeJS.Timeout | null = null;

    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
    }, 8000); // Wait 8 seconds to ensure LCP image is fully loaded and rendered

    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Intersection Observer for video optimization
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle video play/pause based on visibility
  useEffect(() => {
    banners.forEach((banner, index) => {
      const video = videoRefs.current[banner.id];
      if (video && banner.type === "video") {
        if (index === currentIndex && isIntersecting) {
          video.play().catch(() => {
            // Autoplay was prevented, which is fine
          });
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isIntersecting]);

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-100"
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {banner.type === "video" && banner.video ? (
            <video
              ref={(el) => {
                videoRefs.current[banner.id] = el;
              }}
              src={banner.video}
              poster={banner.poster || banner.image}
              className="w-full h-full object-cover"
              playsInline
              muted
              loop
              preload={index === 0 ? "auto" : "metadata"}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onLoadedData={(e) => {
                // Optimize video loading
                const video = e.currentTarget;
                if (index === currentIndex && isIntersecting) {
                  video.play().catch(() => {
                    // Autoplay prevention is handled
                  });
                }
              }}
              aria-label={banner.alt}
            />
          ) : (
            <div className="w-full h-full overflow-hidden relative">
              <img
                src={banner.image}
                alt={banner.alt}
                className={
                  banner.id === 1 && index === 0
                    ? "hero-banner-image"
                    : "w-full h-full object-cover"
                }
                loading={index === 0 ? "eager" : "lazy"}
                decoding={index === 0 ? "sync" : "async"}
                fetchPriority={index === 0 && banner.id === 1 ? "high" : "auto"}
                width={index === 0 && banner.id === 1 ? 1920 : undefined}
                height={index === 0 && banner.id === 1 ? 1080 : undefined}
                // Critical: Preload first image
                {...(index === 0 && banner.id === 1
                  ? {
                      onLoad: () => {
                        // Image loaded - can trigger any post-load actions
                      },
                    }
                  : {})}
              />
            </div>
          )}
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSlideChange(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
