import SitePage from "@/components/SitePage";
import { site } from "@/content/site";
import { getFeaturedListings } from "@/lib/idxbroker";

export default async function Home() {
  // The team's own live listings when the feed has them; otherwise the
  // hand-entered recent sales in the config. Never invented inventory.
  const liveListings = await getFeaturedListings();
  return <SitePage content={site} liveListings={liveListings} />;
}
