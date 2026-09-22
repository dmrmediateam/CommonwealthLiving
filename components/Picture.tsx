/* eslint-disable @next/next/no-img-element */

/**
 * An <img> that offers WebP first.
 *
 * PageSpeed's largest remaining saving was image delivery: full-width JPEGs
 * downloaded for slots a few hundred pixels wide. `npm run images` writes a
 * -800.webp and -1600.webp beside every JPEG in public/, and this picks
 * whichever fits the slot on the visitor's screen and pixel density.
 *
 * Non-local or non-JPEG sources (IDX listing photos, logos) fall straight
 * through to a plain <img>: there is no variant to offer and a srcset entry
 * that 404s can leave a broken image.
 */
export default function Picture({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  /** What width this image occupies, so the browser can pick a variant. */
  sizes?: string;
  /** Set on the one image that paints first. Never set it on more than one. */
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  const isLocalJpeg = /^\/[^?#]+\.jpe?g$/i.test(src);
  const loadingAttr = loading ?? (priority ? "eager" : "lazy");

  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loadingAttr}
      decoding={priority ? "async" : "async"}
      fetchPriority={priority ? "high" : undefined}
    />
  );

  if (!isLocalJpeg) return img;

  const base = src.replace(/\.jpe?g$/i, "");
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${base}-800.webp 800w, ${base}-1600.webp 1600w`}
        sizes={sizes}
      />
      {img}
    </picture>
  );
}
