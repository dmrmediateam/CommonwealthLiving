import type { Listing } from "@/content/site";
import { site } from "@/content/site";
import { searchListings } from "@/lib/idx/search";
import { formatPrice } from "@/lib/idx/display";

/* ==========================================================================
   IDX Broker Partners API: the client's own active listings.

   Set IDX_API_KEY in the deployment's env vars (never in the repo) and the
   featured/listings sections render live data; without it they fall back to
   the config's manual `featured.listings`, or hide when neither exists.
   Docs: https://middleware.idxbroker.com/docs/api/methods/index.html
   ========================================================================== */

interface IdxFeaturedItem {
  address?: string;
  cityName?: string;
  state?: string;
  listingPrice?: string;
  price?: string;
  bedrooms?: number | string;
  totalBaths?: number | string;
  sqFt?: string | number;
  listingID?: string;
  idxID?: string;
  propStatus?: string;
  idxStatus?: string;
  fullDetailsURL?: string;
  image?: Record<string, { url?: string } | number | string>;
}

function firstImage(image: IdxFeaturedItem["image"]): string | undefined {
  if (!image) return undefined;
  for (const [key, value] of Object.entries(image)) {
    if (key === "totalCount") continue;
    if (typeof value === "object" && value?.url) return value.url;
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return undefined;
}

export async function getFeaturedListings(): Promise<Listing[] | null> {
  const accesskey = process.env.IDX_API_KEY;
  if (!accesskey) return null;
  try {
    const res = await fetch("https://api.idxbroker.com/clients/featured", {
      headers: { accesskey, outputtype: "json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: IdxFeaturedItem[] = Array.isArray(data)
      ? data
      : Object.values(data ?? {});
    const listings = items
      .filter((item) => item && typeof item === "object" && item.address)
      .map((item): Listing => {
        const image = firstImage(item.image);
        const cityState = [item.cityName, item.state].filter(Boolean).join(", ");
        return {
          price: item.listingPrice ?? item.price ?? "",
          address: cityState ? `${item.address}, ${cityState}` : String(item.address),
          beds: item.bedrooms ? String(item.bedrooms) : undefined,
          baths: item.totalBaths ? String(item.totalBaths) : undefined,
          sqft: item.sqFt ? String(item.sqFt) : undefined,
          status: item.propStatus ?? item.idxStatus ?? "For Sale",
          mls: item.listingID,
          image: image ?? "",
          href: item.fullDetailsURL ?? "#",
        };
      })
      .filter((listing) => listing.price && listing.image);
    if (listings.length > 0) return listings;
    return teamListings();
  } catch {
    return teamListings();
  }
}

/**
 * The team's own listings, straight from the MLS feed.
 *
 * IDX's "featured" list is whatever the client ticks inside IDX Broker, and a
 * new account has nothing ticked. When `idx.agentIds` names the team's MLS
 * agent ids we can find their listings ourselves: active first, then pending,
 * then sold, so the band shows their work rather than placeholders.
 */
async function teamListings(): Promise<Listing[] | null> {
  const agentIds = (site.idx?.agentIds ?? []).map((id) => id.toLowerCase());
  if (agentIds.length === 0) return null;

  const statuses = ["active", "pending", "sold"] as const;
  const found: Listing[] = [];

  for (const status of statuses) {
    if (found.length >= 3) break;
    try {
      const response = await searchListings({ status, pageSize: 250 });
      for (const listing of response.listings) {
        if (!listing.listingAgentId) continue;
        if (!agentIds.includes(listing.listingAgentId.toLowerCase())) continue;
        found.push({
          price: formatPrice(listing.price),
          address: listing.address.full,
          beds: listing.beds ? String(listing.beds) : undefined,
          baths: listing.baths ? String(listing.baths) : undefined,
          sqft: listing.sqFt ? String(listing.sqFt) : undefined,
          status: status === "active" ? "For Sale" : status === "pending" ? "Pending" : "Sold",
          mls: listing.mlsNumber,
          image: listing.primaryPhoto?.url ?? "",
          href: listing.detailUrl,
        });
        if (found.length >= 6) break;
      }
    } catch {
      // A failed status should not cost the ones that worked
    }
  }

  return found.length > 0 ? found : null;
}
