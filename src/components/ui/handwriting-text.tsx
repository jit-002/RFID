import React, { useEffect, useRef, useState } from "react";

/**
 * Text that writes itself, then inks in.
 * Uses opentype.js via CDN for raw TTF glyph path extraction.
 * Degrades gracefully to plain text if network/font fails.
 */

const OPENTYPE_CDN = "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";

const DEFAULT_FONT_URL =
  "https://cdn.21st.dev/assets/mirror/13/1347863151acdc00fa281daaba1a3543dbce5870b55f9cf7479a15bb84007681.ttf";

export interface HandwritingTextProps {
  /** A single phrase to write. Ignored when `words` is given. */
  text?: string;
  /** Cycle through these, rewriting on each change. */
  words?: string[];
  /** Milliseconds each word is held before the next one starts. */
  interval?: number;
  /** URL of a .ttf or .otf. Must be CORS-readable. */
  fontUrl?: string;
  /** Seconds for the pen to cross the whole word. */
  duration?: number;
  /** Seconds before the pen starts. */
  delay?: number;
  /** Stroke weight, in units of a 100px em. */
  strokeWidth?: number;
  /** Ink the letters in once drawn. Set false to leave them as outlines. */
  fill?: boolean;
  /** CSS height of the rendered word; width follows the glyphs. */
  height?: string;
  className?: string;
}

type Geometry = {
  full: string;
  contours: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadOpentype(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (window as any).opentype;
  if (existing) return Promise.resolve(existing);
  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = OPENTYPE_CDN;
      script.async = true;
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lib = (window as any).opentype;
        if (lib) resolve(lib);
        else reject(new Error("opentype.js loaded but exposed nothing"));
      };
      script.onerror = () => reject(new Error("opentype.js failed to load"));
      document.head.appendChild(script);
    });
  }
  return libPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fontCache = new Map<string, Promise<any>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadFont(url: string): Promise<any> {
  let pending = fontCache.get(url);
  if (!pending) {
    pending = Promise.all([
      loadOpentype(),
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Font request failed: ${res.status}`);
        return res.arrayBuffer();
      }),
    ]).then(([lib, buffer]) => lib.parse(buffer));
    fontCache.set(url, pending);
  }
  return pending;
}

const EM = 100;

export const HandwritingText: React.FC<HandwritingTextProps> = ({
  text,
  words,
  interval = 3200,
  fontUrl = DEFAULT_FONT_URL,
  duration = 1.5,
  delay = 0.05,
  strokeWidth = 1.6,
  fill = true,
  height = "1.15em",
  className,
}) => {
  const cycle = Boolean(words && words.length > 0);
  const [index, setIndex] = useState(0);
  const current = cycle ? words![index % words!.length] : text ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [font, setFont] = useState<any>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [lengths, setLengths] = useState<number[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!cycle) return undefined;
    const id = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [cycle, interval]);

  useEffect(() => {
    let cancelled = false;
    loadFont(fontUrl)
      .then((f) => {
        if (!cancelled) setFont(f);
      })
      .catch(() => {
        /* degrades to plain text */
      });
    return () => {
      cancelled = true;
    };
  }, [fontUrl]);

  useEffect(() => {
    if (!font || !current) return;
    try {
      const path = font.getPath(current, 0, EM, EM);
      const box = path.getBoundingBox();
      const pad = EM * 0.12;
      const full = path.toPathData(2);
      setGeom({
        full,
        contours: full.split(/(?=M)/).filter((d: string) => d.trim().length > 1),
        x: box.x1 - pad,
        y: box.y1 - pad,
        w: box.x2 - box.x1 + pad * 2,
        h: box.y2 - box.y1 + pad * 2,
      });
      setDrawn(false);
      setLengths([]);
    } catch {
      setGeom(null);
    }
  }, [font, current]);

  useEffect(() => {
    if (!geom) return undefined;
    setLengths(
      pathRefs.current
        .slice(0, geom.contours.length)
        .map((el) => (el ? el.getTotalLength() : 0))
    );
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setDrawn(true))
    );
    return () => cancelAnimationFrame(id);
  }, [geom]);

  if (!geom) {
    return <span className={className}>{current}</span>;
  }

  const count = Math.max(1, geom.contours.length);

  return (
    <svg
      key={current}
      viewBox={`${geom.x} ${geom.y} ${geom.w} ${geom.h}`}
      role="img"
      aria-label={current}
      className={["inline-block", className].filter(Boolean).join(" ")}
      style={{
        height,
        width: `calc(${height} * ${(geom.w / geom.h).toFixed(4)})`,
        overflow: "visible",
      }}
    >
      {fill && (
        <path
          d={geom.full}
          fill="currentColor"
          stroke="none"
          style={{
            opacity: drawn ? 1 : 0,
            transition: drawn
              ? `opacity 0.45s ease-out ${(delay + duration * 0.72).toFixed(3)}s`
              : "none",
          }}
        />
      )}
      {geom.contours.map((d, i) => {
        const length = lengths[i] || 0;
        const each = (duration / count) * 2.4;
        const start = delay + (i / count) * duration;
        return (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: length || 1,
              strokeDashoffset: drawn ? 0 : length || 1,
              transition: drawn
                ? `stroke-dashoffset ${each.toFixed(3)}s ease-out ${start.toFixed(3)}s`
                : "none",
            }}
          />
        );
      })}
    </svg>
  );
};

export default HandwritingText;
