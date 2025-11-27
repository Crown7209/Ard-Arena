"use client";

import ColorMatchGame from "@/components/game/colormatch/ColorMatchGame";
import Script from "next/script";

export default function ColorMatchPage() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.6.1/randomColor.min.js"
        integrity="sha512-vPeZ7JCboHcfpqSx5ZD+/jpEhS4JpXxfz9orSvAPPj0EKUVShU2tgy7XkU+oujBJKnWmu4hU7r9MMQNWPfXsYw=="
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onLoad={() => {
          // Make randomColor available globally
          if (typeof window !== "undefined" && (window as any).randomColor) {
            // Already available via script tag
          }
        }}
      />
      <ColorMatchGame />
    </>
  );
}
