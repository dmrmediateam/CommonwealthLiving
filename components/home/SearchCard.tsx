"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/content/site";

/* ==========================================================================
   Homepage search with autocomplete across:
     · the client's own featured properties
     · their community/specialty pages (passed in from the config)
     · MLS neighborhoods (subdivisions) and cities
     · anything else -> MLS address search
   The MLS location index loads on first focus from /api/idx-cities.
   ========================================================================== */

interface Suggestion {
  label: string;
  kind: string;
  href: string;
}

const addressSearchUrl = (term: string) =>
  `/listings?address=${encodeURIComponent(term)}`;

export default function SearchCard({
  placeholder,
  ctaLabel,
  listings = [],
  pages = [],
}: {
  placeholder: string;
  ctaLabel: string;
  /** Kept for config compatibility; the button now runs the search. */
  ctaHref?: string;
  /** The client's own listings, so their properties autocomplete by address */
  listings?: Listing[];
  /** Site pages worth suggesting: towns, specialties, guides */
  pages?: Suggestion[];
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [neighborhoods, setNeighborhoods] = useState<Array<{ value: string; label: string }>>([]);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetched = useRef(false);
  const loadIndexRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadIndexRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIndex = () => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/api/idx-cities")
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities ?? []);
        setNeighborhoods(data.neighborhoods ?? []);
      })
      .catch(() => {});
  };

  loadIndexRef.current = loadIndex;

  const ownProperties = useMemo<Suggestion[]>(
    () =>
      listings
        .filter((listing) => listing.address)
        .map((listing) => ({
          label: listing.address,
          kind: listing.status === "Sold" ? "Sold" : "Our Listing",
          href: listing.href,
        })),
    [listings],
  );


  /** This is a property search, so a town goes to results, not to its page. */
  const asSearch = (entry: Suggestion): Suggestion => {
    const city = cities.find((c) => c.name.toLowerCase() === entry.label.toLowerCase());
    return city
      ? { ...entry, href: `/listings?city=${encodeURIComponent(city.name)}` }
      : entry;
  };

  const suggestions = useMemo<Suggestion[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pages.map(asSearch);

    const matches = (text: string) => text.toLowerCase().includes(term);
    const startsWith = (text: string) => text.toLowerCase().startsWith(term);

    const pageMatches = pages
      .filter((p) => matches(p.label))
      .sort((a, b) => Number(startsWith(b.label)) - Number(startsWith(a.label)) || a.label.length - b.label.length)
      .map(asSearch);

    const out: Suggestion[] = [
      ...ownProperties.filter((p) => matches(p.label)),
      ...pageMatches,
    ];

    // Rank: names that start with the term first, then shortest (the
    // canonical "Pelican Bay" ahead of "Pelican Bay Woods").
    const rank = (a: string, b: string) =>
      Number(startsWith(b)) - Number(startsWith(a)) || a.length - b.length;

    const hoods = neighborhoods.filter((n) => matches(n.label));
    hoods.sort((a, b) => rank(a.label, b.label));
    for (const hood of hoods.slice(0, 4)) {
      out.push({
        label: hood.label,
        kind: "Neighborhood",
        href: `/listings?subdivision=${encodeURIComponent(hood.label)}`,
      });
    }

    const matchedCities = cities.filter((c) => matches(c.name));
    matchedCities.sort((a, b) => rank(a.name, b.name));
    for (const city of matchedCities.slice(0, 3)) {
      out.push({
        label: city.name,
        kind: "City",
        href: `/listings?city=${encodeURIComponent(city.name)}`,
      });
    }

    // One entry per destination: a town can arrive as both a community page
    // and an MLS city.
    const seen = new Set<string>();
    return out
      .filter((entry) => {
        const key = `${entry.href}|${entry.label.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }, [query, cities, neighborhoods, ownProperties, pages]);

  const submit = (event?: { preventDefault(): void }) => {
    event?.preventDefault();
    const term = query.trim();
    if (!term) return;
    /* A town typed into a property search means "show me homes there", so an
       MLS city wins over the town's own page. Anything else exact (a
       neighborhood, a listing, a guide) goes where it points. */
    const city = cities.find((c) => c.name.toLowerCase() === term.toLowerCase());
    if (city) {
      window.location.href = `/listings?city=${encodeURIComponent(city.name)}`;
      return;
    }
    const exact = suggestions.find((s) => s.label.toLowerCase() === term.toLowerCase());
    if (exact) {
      window.location.href = exact.href;
      return;
    }
    /* Nothing picked (often because the location index is still loading):
       a term with digits reads as a street address, plain words as a place. */
    window.location.href = /\d/.test(term)
      ? addressSearchUrl(term)
      : `/listings?city=${encodeURIComponent(term)}`;
  };

  return (
    <div className="search-bar">
      <form className="search-input-container" onSubmit={submit} role="search">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
            loadIndex();
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          aria-label="Search properties, neighborhoods, and cities"
        />
        {focused && (suggestions.length > 0 || query.trim()) && (
          <ul className="search-suggest" role="listbox">
            {suggestions.map((s) => (
              <li key={`${s.kind}-${s.href}-${s.label}`}>
                <a href={s.href}>
                  <span>{s.label}</span>
                  <span className="search-suggest__kind">{s.kind}</span>
                </a>
              </li>
            ))}
            {query.trim() && (
              <li>
                <a href={addressSearchUrl(query.trim())}>
                  <span>Search addresses for &ldquo;{query.trim()}&rdquo;</span>
                  <span className="search-suggest__kind">MLS Search</span>
                </a>
              </li>
            )}
          </ul>
        )}
      </form>
      {/* The control beside a search field should run the search; contact
          lives in the nav, the floating button and the closing CTA. */}
      {/* aria-label because the label inside is hidden on small screens, which
          left the button with no name for a screen reader */}
      <button type="button" className="contact-section" aria-label="Search listings" onClick={() => submit()}>
        <span className="link-label">{ctaLabel}</span>
        <span className="icon-style" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12h15" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
