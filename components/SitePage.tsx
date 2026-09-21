import HomeClassic from "@/components/home/HomeClassic";
import type { Listing, SiteContent } from "@/content/site";

/* This client uses the "classic" homepage design (locked by new-client). */

export default function SitePage({
  content,
  liveListings,
}: {
  content: SiteContent;
  liveListings?: Listing[] | null;
}) {
  return <HomeClassic content={content} liveListings={liveListings} />;
}
