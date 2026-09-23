import type { Listing } from "@/content/site";

/** Listing cards: photo with status/MLS badges, price, address, beds·baths·sqft */
export default function ListingsGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="listings-grid">
      {listings.map((listing, i) => (
        <a
          className="listing-card reveal"
          href={listing.href}
          key={listing.mls ?? listing.address}
          data-delay={i % 3 === 0 ? undefined : (i % 3) * 100}
        >
          {/* A sold record the MLS will not give us a photo for still earns a
              card: the sale itself is the content. */}
          <div className={`listing-card__media${listing.image ? "" : " listing-card__media--plain"}`}>
            {listing.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.image} alt={listing.address} loading="lazy" />
            ) : (
              <span className="listing-card__mark" aria-hidden="true">
                {listing.status ?? "Sold"}
              </span>
            )}
            <div className="listing-card__badges">
              {listing.image && listing.status && <span>{listing.status}</span>}
              {listing.mls && <span>MLS&reg; {listing.mls}</span>}
            </div>
          </div>
          <div className="listing-card__body">
            <span className="listing-card__price">{listing.price}</span>
            <span className="listing-card__address">{listing.address}</span>
            <span className="listing-card__meta">
              {[
                listing.beds && `${listing.beds} Beds`,
                listing.baths && `${listing.baths} Baths`,
                listing.sqft && `${listing.sqft} Sq.Ft.`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
