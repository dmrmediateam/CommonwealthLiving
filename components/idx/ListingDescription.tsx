"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MLS remarks run long and uneven: a few lines for one home, fifteen for the
 * next. This shows a fixed opening, fades the cut off, and expands on request,
 * so a listing page keeps its shape whatever the agent wrote.
 *
 * The full text is always in the markup, so search engines and screen readers
 * get the whole description regardless of the visual clamp.
 */
export default function ListingDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [clampable, setClampable] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only offer "Read more" when there is something hidden to read.
    const check = () => setClampable(el.scrollHeight - el.clientHeight > 12);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  return (
    <div className={`listing-desc${expanded ? " is-open" : ""}`}>
      <p ref={ref} className="listing-detail__description listing-desc__text">
        {text}
      </p>
      {clampable && !expanded && <span className="listing-desc__fade" aria-hidden="true" />}
      {clampable && (
        <button
          type="button"
          className="listing-desc__toggle"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? "Read less" : "Read more"}
          <span className="listing-desc__chevron" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
