import { NextResponse } from "next/server";
import { CORE_MARKET_CITIES, idxConfigured } from "@/lib/idx/config";
import { searchListings, warmListingPool } from "@/lib/idx/search";

/* ==========================================================================
   Pre-builds the cached MLS feeds so visitors never pay for a cold fetch.

   Two caches, warmed here:
     · the broad browse pool behind /listings (revalidates hourly)
     · the per-town search each "search a town" click runs (15 minutes)

   IDX answers an uncached query in 8-15s, so without this the first visitor
   after each window waits that long. /listings gives the pool a short budget
   and falls back to the core towns, so a cold pool also means a thinner feed.

   Vercel cron calls this every 15 minutes (vercel.json). Protect it with
   CRON_SECRET in the project: Vercel sends it as `Authorization: Bearer
   <CRON_SECRET>`. Without a secret the route still runs; it only warms a
   cache and exposes no data.
   ========================================================================== */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Leave headroom under maxDuration so the response is never cut off. */
const WARM_BUDGET_MS = 200_000;
const CITY_CONCURRENCY = 3;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!idxConfigured()) {
    return NextResponse.json({ ok: false, error: "IDX_API_KEY not set" }, { status: 503 });
  }

  const started = Date.now();
  const outOfBudget = () => Date.now() - started > WARM_BUDGET_MS;

  try {
    const listings = await warmListingPool();

    // Then the per-town searches, most-important towns first, in small
    // batches. On a short function limit (Vercel Hobby caps at 60s) the
    // budget check simply stops early and the rest warm on the next run.
    const cities = [...CORE_MARKET_CITIES];
    const warmed: string[] = [];
    for (let i = 0; i < cities.length && !outOfBudget(); i += CITY_CONCURRENCY) {
      const batch = cities.slice(i, i + CITY_CONCURRENCY);
      await Promise.all(
        batch.map((city) =>
          searchListings({ city })
            .then(() => {
              warmed.push(city);
            })
            .catch(() => undefined),
        ),
      );
    }

    const ms = Date.now() - started;
    console.log(`[idx] warmed ${listings} listings + ${warmed.length} town searches in ${ms}ms`);
    return NextResponse.json({ ok: true, listings, towns: warmed, ms });
  } catch (error) {
    const ms = Date.now() - started;
    console.log(`[idx] warm failed after ${ms}ms`, error);
    return NextResponse.json(
      { ok: false, ms, error: error instanceof Error ? error.message : "unknown" },
      { status: 502 },
    );
  }
}
