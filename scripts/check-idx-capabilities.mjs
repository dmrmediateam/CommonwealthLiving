#!/usr/bin/env node
/**
 * IDX Broker capability probe.
 *
 * Whether the native (custom-coded) MLS search works is decided PER MLS:
 * some boards let IDX serve raw search results through the API
 * (Stellar d003, Wisconsin b082, ...) and some do not (SWFL Naples f005
 * returns 405 "Searching by Query String is disallowed by the MLS rules").
 *
 * Run this on day one for every new client, BEFORE promising native search:
 *   node scripts/check-idx-capabilities.mjs            (reads .env.local)
 *   IDX_API_KEY=... node scripts/check-idx-capabilities.mjs
 */
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {}
}
loadEnvLocal();

const KEY = process.env.IDX_API_KEY;
const ANCILLARY = process.env.IDX_ANCILLARY_KEY;
if (!KEY) {
  console.error("IDX_API_KEY not set (env or .env.local)");
  process.exit(1);
}

const headers = { accesskey: KEY, outputtype: "json" };
if (ANCILLARY) headers.ancillarykey = ANCILLARY;

async function probe(path) {
  try {
    const res = await fetch(`https://api.idxbroker.com/${path}`, { headers, signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 300) };
  } catch (err) {
    return { status: 0, body: String(err) };
  }
}

const ok = (s) => (s === 200 ? "YES" : s === 204 ? "yes (empty)" : `NO (${s})`);

const account = await probe("clients/accountinfo");
let mls = "?", name = "?";
try {
  const parsed = JSON.parse(account.body.length >= 300 ? (await probe("clients/accountinfo")).body : account.body);
  name = parsed.clientName ?? "?";
} catch {}
// accountinfo can exceed the preview slice; fetch fully for the MLS map
try {
  const res = await fetch("https://api.idxbroker.com/clients/accountinfo", { headers, signal: AbortSignal.timeout(20000) });
  const parsed = await res.json();
  name = parsed.clientName ?? name;
  mls = Object.entries(parsed.mlsMembership ?? {})
    .map(([id, v]) => `${id} (approved: ${v.paperworkApproved ?? "?"})`)
    .join(", ") || "none";
} catch {}

const search = await probe("clients/searchquery?srt=newest");
const featured = await probe("clients/featured?limit=1");
const sold = await probe("clients/soldpending?limit=1");
const savedlinks = await probe("clients/savedlinks");

console.log(`\nIDX capability report — ${name}`);
console.log(`MLS membership: ${mls}\n`);
console.log(`  API search (searchquery):  ${ok(search.status)}${search.status === 405 ? "  <- MLS blocks raw API search" : ""}`);
console.log(`  Own active listings:       ${ok(featured.status)}`);
console.log(`  Sold/pending listings:     ${ok(sold.status)}`);
console.log(`  Saved links:               ${ok(savedlinks.status)}`);

if (search.status === 200) {
  console.log(`\nVERDICT: full native search works — custom pages can query the API directly.`);
} else if (search.status === 405) {
  console.log(`\nVERDICT: this MLS disallows API search results.`);
  console.log(`Native options: own listings + solds + detail pages + saved-link counts.`);
  console.log(`Full search needs: IDX/MLS permission flip, hosted pages, or a direct RESO feed.`);
} else {
  console.log(`\nVERDICT: unexpected response — check the key. Body: ${search.body.slice(0, 120)}`);
}
