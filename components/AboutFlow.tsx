import Picture from "@/components/Picture";
import type { SiteContent } from "@/content/site";

/**
 * The agent's story: circular portrait over the bio blocks.
 *
 * Shared by the homepage and the About page so the two can never drift apart.
 * It was inline in HomeClassic; featuring it on /about by copying the markup
 * would have created a second copy to keep in sync.
 */
export default function AboutFlow({
  content,
  showHeading = true,
  cta,
}: {
  content: SiteContent;
  /** Drop the h2 where the page's own h1 already says the same thing */
  showHeading?: boolean;
  /** Optional button under the bio (the homepage uses it to route to contact) */
  cta?: { label: string; href: string };
}) {
  return (
    <section className="solid-section">
      <div className="about-flow lp-vertical-paddings">
        <div className="lp-container">
          <div className="about-flow__body reveal">
            <Picture
              src={content.about.image}
              alt={content.about.title}
              sizes="(max-width: 760px) 60vw, 320px"
              className={
                content.about.imageStyle === "photo"
                  ? "about-flow__photo"
                  : "about-flow__portrait"
              }
            />
            {showHeading && <h2 className="lp-h2">{content.about.title}</h2>}
            <div className="lp-text--subtitle">
              <h5>{content.about.subtitle}</h5>
              {content.about.blocks.map((block, i) => (
                <div key={i}>
                  {block.heading && <p><strong>{block.heading}</strong></p>}
                  <p>{block.text}</p>
                </div>
              ))}
              {cta && (
                <div className="about-flow__cta">
                  <a href={cta.href} className="lp-btn lp-btn--outline">{cta.label}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
