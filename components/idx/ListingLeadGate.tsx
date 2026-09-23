"use client";

import { useEffect, useState } from "react";
import Honeypot from "@/components/leads/Honeypot";
import { site } from "@/content/site";
import { useLeadSubmit } from "@/lib/leads/useLeadSubmit";

const VIEWS_KEY = "clg_listing_views";
const CAPTURED_KEY = "clg_lead_captured";
// Crawlers are never gated: the listing stays fully indexable, and a gate shown
// to Googlebot would read as cloaked content.
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|lighthouse|adsbot|mediapartners/i;

/**
 * Registration gate on listing detail pages. The page is server-rendered in
 * full underneath; this only overlays it for human visitors who have not given
 * their details yet, after `site.listingGate.freeViews` listing pages.
 */
export default function ListingLeadGate({
  address,
  listingId,
  photo,
}: {
  address: string;
  listingId: string;
  photo?: string;
}) {
  const gate = site.listingGate;
  const [open, setOpen] = useState(false);
  const { status, submit } = useLeadSubmit("listing-registration");

  useEffect(() => {
    if (!gate?.enabled) return;
    if (BOT.test(navigator.userAgent)) return;
    // Two independent memories of a past signup: a cookie (if the lead API
    // ever sets one) and a localStorage flag.
    let captured = /(?:^|;\s*)clg_lead=/.test(document.cookie);
    let views = gate.freeViews + 1;
    try {
      captured = captured || !!window.localStorage.getItem(CAPTURED_KEY);
      views = Number(window.localStorage.getItem(VIEWS_KEY) || "0") + 1;
      window.localStorage.setItem(VIEWS_KEY, String(views));
    } catch {
      // Storage blocked: views keeps its default past the free allowance, so
      // the gate still shows unless the cookie already says they registered
    }
    if (!captured && views > gate.freeViews) setOpen(true);
  }, [gate]);

  // Lock page scroll while the gate is up, and announce it so other fixed
  // layers (the floating contact button) can step aside.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.leadGate = "open";
    window.dispatchEvent(new Event("clg:lead-gate"));
    return () => {
      document.body.style.overflow = prev;
      delete document.documentElement.dataset.leadGate;
      window.dispatchEvent(new Event("clg:lead-gate"));
    };
  }, [open]);

  // Close shortly after a successful registration so the thank-you is seen
  useEffect(() => {
    if (status !== "done") return;
    try {
      window.localStorage.setItem(CAPTURED_KEY, "1");
    } catch {
      // Storage blocked: they will see the gate again on a later visit
    }
    const t = window.setTimeout(() => setOpen(false), 1400);
    return () => window.clearTimeout(t);
  }, [status]);

  if (!gate?.enabled || !open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address,
      mlsNumber: listingId,
      company: String(data.get("company") ?? ""),
      website: String(data.get("website") ?? ""),
    });
  }

  return (
    <div className="lead-gate" role="dialog" aria-modal="true" aria-labelledby="lead-gate-title">
      <div className="lead-gate__backdrop" />
      <div className="lead-gate__panel">
        {photo && (
          <div className="lead-gate__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" />
            <span className="lead-gate__address">{address}</span>
          </div>
        )}
        <div className="lead-gate__body">
          {status === "done" ? (
            <div className="lead-gate__done">
              <h2 id="lead-gate-title">Thank you</h2>
              <p>You now have full access to every listing.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} data-clarity-mask="true">
              <Honeypot idSuffix="gate" />
              <span className="lead-gate__kicker">{site.footer.agentName}</span>
              <h2 id="lead-gate-title">{gate.heading ?? "View Full Property Details"}</h2>
              {gate.subheading && <p className="lead-gate__sub">{gate.subheading}</p>}
              <div className="lead-gate__fields">
                <input type="text" name="name" placeholder="Full Name" autoComplete="name" required />
                <input type="email" name="email" placeholder="Email" autoComplete="email" required />
                <input type="tel" name="phone" placeholder="Phone" autoComplete="tel" required />
              </div>
              <label className="lead-gate__consent">
                <input type="checkbox" name="termsAccepted" required />
                <span>{site.footer.newsletter.consent}</span>
              </label>
              <button type="submit" className="lead-gate__submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "View Property"}
              </button>
              {status === "error" && <p className="lead-gate__error">Something went wrong. Please try again.</p>}
              {gate.dismissible && (
                <button type="button" className="lead-gate__skip" onClick={() => setOpen(false)}>
                  Not now
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
