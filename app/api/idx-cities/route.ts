import { NextResponse } from "next/server";

export const revalidate = 86400;

/** Resolved from the account's approved MLS, so no per-client edit is needed. */
async function resolveIdxId(headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch("https://api.idxbroker.com/mls/approvedmls", {
      headers,
      next: { revalidate: 604800 },
    });
    if (!res.ok) return null;
    const list = (await res.json()) as Array<{ id?: string }>;
    return Array.isArray(list) && list[0]?.id ? String(list[0].id) : null;
  } catch {
    return null;
  }
}

function idxHeaders(): Record<string, string> | null {
  const accesskey = process.env.IDX_API_KEY;
  if (!accesskey) return null;
  const headers: Record<string, string> = { accesskey, outputtype: "json" };
  if (process.env.IDX_ANCILLARY_KEY) headers.ancillarykey = process.env.IDX_ANCILLARY_KEY;
  return headers;
}

/**
 * Search index for the site's autocomplete: MLS cities and neighborhoods
 * (subdivisions). Both are location lists, not listing data, so they come
 * through the API fine even though listing search itself is blocked.
 */
export async function GET() {
  const headers = idxHeaders();
  if (!headers) return NextResponse.json({ cities: [], neighborhoods: [] });

  const get = async <T,>(path: string): Promise<T | null> => {
    try {
      const res = await fetch(`https://api.idxbroker.com/${path}`, {
        headers,
        next: { revalidate: 86400 },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const idxId = await resolveIdxId(headers);
  const [rawCities, rawSubdivisions] = await Promise.all([
    get<Array<{ id?: string | number; name?: string }>>("clients/cities/combinedActiveMLS"),
    idxId
      ? get<string[]>(`mls/searchfieldvalues/${idxId}?mlsPtID=1&name=subdivision`)
      : Promise.resolve(null),
  ]);

  const cities = (Array.isArray(rawCities) ? rawCities : [])
    .filter((c) => c.id && c.name)
    .map((c) => ({ id: String(c.id), name: String(c.name) }));

  /**
   * Some MLSs take "subdivision" as free text, so the list arrives full of
   * sentences ("2 Cul-de-sacs, 11 beautiful homes, just over a mile to town").
   * Only entries that read like a place name are worth suggesting.
   */
  const looksLikeAPlace = (value: string) =>
    value.length >= 3 &&
    value.length <= 26 &&
    value.split(/\s+/).length <= 3 &&
    !/[0-9,;:!?/()"]/.test(value);

  // Neighborhood names come back SHOUTED; title-case them for display.
  const neighborhoods = (Array.isArray(rawSubdivisions) ? rawSubdivisions : [])
    .filter((s): s is string => typeof s === "string" && looksLikeAPlace(s))
    .map((s) => ({
      value: s,
      label: s.replace(/\b[A-Z][A-Z'&.-]*\b/g, (w) => w.charAt(0) + w.slice(1).toLowerCase()),
    }));

  return NextResponse.json(
    { cities, neighborhoods },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
