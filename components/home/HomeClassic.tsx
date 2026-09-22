import type { CSSProperties } from "react";
import AboutFlow from "@/components/AboutFlow";
import SiteChrome from "@/components/SiteChrome";
import ListingsGrid from "@/components/ListingsGrid";
import HeroMedia from "@/components/home/HeroMedia";
import Picture from "@/components/Picture";
import type { GalleryCard, Listing, SiteContent } from "@/content/site";

/* ==========================================================================
   Home variant "classic": the original LP-derived design. Centered serif
   hero, floating search card, editorial cards, stats band, overlay areas,
   circular about portrait, fixed-background CTA.
   ========================================================================== */

export default function HomeClassic({
  content,
  liveListings,
}: {
  content: SiteContent;
  /** Listings fetched from IDX Broker at request time; overrides config fallback */
  liveListings?: Listing[] | null;
}) {
  const featuredListings = liveListings ?? content.featured?.listings ?? [];
  return (
    <SiteChrome content={content} animateIn>
      {/* ============ HERO (fullscreen video or image) ============ */}
      <section className="video-section">
        <div className="video-wrapper">
          <HeroMedia image={content.hero.image} video={content.hero.video} />
        </div>
        <div className="overlay-component"></div>
        <div className="middle-content-wrapper">
          <div className="text-section">
            <h5 className="pre-title">{content.hero.preTitle}</h5>
            <h1 className="lp-h1">{content.hero.title}</h1>
          </div>
        </div>
      </section>

      {/* ============ STICKY SEARCH BAR ============ */}
      <section className="search-bar-section" id="search-bar">
        <div className="search-bar">
          <div className="search-input-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input type="text" placeholder={content.searchBar.placeholder} className="search-input" />
          </div>
          <a href={content.searchBar.ctaHref} className="contact-section">
            <span className="link-label">{content.searchBar.ctaLabel}</span>
            <span className="icon-style" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
            </span>
          </a>
        </div>
      </section>

      {/* ============ SERVICES GALLERY ============ */}
      <GallerySection cards={content.services} columns={3} />

      {/* ============ ABOUT — circular portrait, directly under the services ============ */}
      <AboutFlow content={content} cta={{ label: "Work With Tom", href: content.cta.buttonHref }} />

      {/* ============ STATS BAND — proof points straight after the founder story ============ */}
      {content.stats && (
        <section className="solid-section">
          <div className="stats-band lp-container reveal">
            {content.stats.map((stat) => (
              <div className="stats-band__item" key={stat.label}>
                <span className="stats-band__value">{stat.value}</span>
                <span className="stats-band__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ FEATURED PROPERTIES (client's own listings) ============ */}
      {content.featured && featuredListings.length > 0 && (
        <section className="solid-section">
          <div className="featured-band lp-vertical-paddings">
            <div className="lp-container">
              <div className="featured-band__head reveal">
                {content.featured.subtitle && <span className="featured-band__kicker">{content.featured.subtitle}</span>}
                <h2 className="lp-h2">{content.featured.title}</h2>
              </div>
              <ListingsGrid listings={featuredListings.slice(0, 3)} />
            </div>
          </div>
        </section>
      )}

      {/* ============ AREAS GALLERY + intro tile filling the sixth cell ============ */}
      <section className="solid-section">
        <div className="gallery-component">
          <div className="lp-container">
            <div className="gallery-row cols-2">
              {content.areas.map((card, i) => (
                <div className="gallery-col reveal" key={card.title} data-delay={i % 2 === 0 ? undefined : 100}>
                  <a className="gallery-card gallery-card--overlay gallery-card--short" href={card.href}>
                    <div className="gallery-card__preview">
                      <Picture src={card.image} alt="" sizes="(max-width: 760px) 92vw, 45vw" />
                    </div>
                    <div className="gallery-card__veil"></div>
                    <div className="gallery-card__panel">
                      <h3 className="gallery-card__panel-title">{card.title}</h3>
                      {card.description && <p className="gallery-card__panel-desc">{card.description}</p>}
                    </div>
                  </a>
                </div>
              ))}
              <div className="gallery-col reveal" data-delay="100">
                <div className="intro-tile">
                  <h2 className="intro-tile__title">{content.intro.title}</h2>
                  <div className="intro-tile__body">
                    {content.intro.paragraphs.map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                  </div>
                  <a href={content.intro.ctaHref} className="lp-btn intro-tile__btn">{content.intro.ctaLabel}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA (parallax) ============ */}
      <section
        className="image-section parallax-enabled"
        id="cta-parallax"
        style={{
          "--sectionBackground": `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${content.cta.image}')`,
        } as CSSProperties}
      >
        <div className="work-with-us">
          <div className="container">
            <h2 className="reveal">{content.cta.title}</h2>
            <div className="description reveal" data-delay="100">{content.cta.description}</div>
            <div className="btn-container reveal" data-delay="200">
              <a href={content.cta.buttonHref} className="btn btn--primary-light">{content.cta.buttonLabel}</a>
            </div>
          </div>
        </div>
      </section>

    </SiteChrome>
  );
}

function GallerySection({
  cards,
  columns,
  variant = "editorial",
}: {
  cards: GalleryCard[];
  columns: 2 | 3;
  variant?: "editorial" | "overlay";
}) {
  return (
    <section className="solid-section">
      <div className="gallery-component">
        <div className="lp-container">
          <div className={`gallery-row cols-${columns}`}>
            {cards.map((card, i) => (
              <div className="gallery-col reveal" key={card.title} data-delay={i % columns === 0 ? undefined : (i % columns) * 100}>
                {variant === "overlay" ? (
                  <a className="gallery-card gallery-card--overlay gallery-card--short" href={card.href}>
                    <div className="gallery-card__preview">
                      <Picture src={card.image} alt="" sizes="(max-width: 760px) 92vw, 45vw" />
                    </div>
                    <div className="gallery-card__veil"></div>
                    <div className="gallery-card__panel">
                      <h3 className="gallery-card__panel-title">{card.title}</h3>
                      {card.description && <p className="gallery-card__panel-desc">{card.description}</p>}
                    </div>
                  </a>
                ) : (
                  <a className={`gallery-card${columns === 2 ? " gallery-card--short" : ""}`} href={card.href}>
                    <div className="gallery-card__preview">
                      <Picture src={card.image} alt="" sizes="(max-width: 760px) 92vw, 45vw" />
                    </div>
                    <div className="gallery-card__label">
                      <div className="gallery-card__text">
                        {card.preTitle && <span className="gallery-card__pre">{card.preTitle}</span>}
                        <h3 className="gallery-card__title">{card.title}</h3>
                        {card.cta && <span className="gallery-card__cta">{card.cta}</span>}
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

