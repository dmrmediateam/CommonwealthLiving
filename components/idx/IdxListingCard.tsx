import type { ListingSummary } from "@/lib/idx/types";
import { formatPrice, formatSqFt } from "@/lib/idx/display";

const STATUS_LABEL: Record<string, string> = {
  active: "For Sale",
  pending: "Pending",
  sold: "Sold",
  comingSoon: "Coming Soon",
};

/** MLS listing card: same anatomy as the static ListingsGrid card */
export default function IdxListingCard({
  listing,
  priority = false,
}: {
  listing: ListingSummary;
  /** Set on the first row so it paints with the page */
  priority?: boolean;
}) {
  return (
    <a className="listing-card" href={listing.detailUrl}>
      <div className="listing-card__media">
        {listing.primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.primaryPhoto.url}
            alt={listing.address.full}
            /* The first row is above the fold on most screens: lazy-loading it
               left the grid visibly filling in after paint. */
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            width={640}
            height={427}
          />
        ) : (
          <div className="listing-card__nophoto">Photo Coming Soon</div>
        )}
        <div className="listing-card__badges">
          <span>{STATUS_LABEL[listing.status] ?? "For Sale"}</span>
          {listing.mlsNumber && <span>MLS&reg; {listing.mlsNumber}</span>}
        </div>
      </div>
      <div className="listing-card__body">
        <span className="listing-card__price">{formatPrice(listing.price)}</span>
        <span className="listing-card__address">{listing.address.full}</span>
        <span className="listing-card__meta">
          {[
            listing.beds ? `${listing.beds} Beds` : null,
            listing.baths ? `${listing.baths} Baths` : null,
            listing.sqFt ? `${formatSqFt(listing.sqFt)} Sq.Ft.` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </a>
  );
}
