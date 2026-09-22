/* ==========================================================================
   Site content — everything rendered on the page lives here.
   Swap this file's values per client; no component edits needed.
   ========================================================================== */

export interface NavLink {
  label: string;
  href: string;
  /** Sub-links rendered as a collapsible group in the side menu */
  children?: NavLink[];
}

export interface GalleryCard {
  /** Small letterspaced line above the title (omit to hide) */
  preTitle?: string;
  title: string;
  /** Underlined line below the title (omit to hide) */
  cta?: string;
  /** Longer text revealed on hover (overlay-style cards, e.g. areas) */
  description?: string;
  href: string;
  image: string;
}

export interface Listing {
  price: string;
  address: string;
  /** Matches the search filter values: single-family, condominium, townhouse, land */
  propertyType?: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  /** e.g. "For Sale", "Pending", "Sold" */
  status?: string;
  mls?: string;
  image: string;
  href: string;
}

export interface TeamMember {
  name: string;
  /** e.g. "Founder & Lead Agent", "Buyer Specialist" */
  role: string;
  image: string;
  phone?: string;
  email?: string;
  license?: string;
  /** 1-2 sentence bio shown on the roster card */
  bio?: string;
  /** Optional link to a fuller profile (a standard SubPage works well) */
  href?: string;
}

export interface SubPage {
  /** URL segment, e.g. "buy" */
  slug: string;
  /** "standard" = editorial; "search" = IDX search; "connect" = contact; "listings" = listing grid; "team" = roster */
  type?: "standard" | "search" | "connect" | "listings" | "team";
  title: string;
  preTitle?: string;
  heroImage: string;
  intro?: string[];
  /** Alternating image/text split sections */
  sections?: { heading: string; text: string; image?: string }[];
  cta?: { label: string; href: string };
  /** Append the client's listings grid to a standard page (e.g. buy) */
  showListings?: boolean;
  /** Render the working property search (filters + results) on this page */
  search?: boolean;
  /**
   * Live MLS search scoped to one town, for area pages: "Homes for Sale in
   * Canton", filterable, refreshed from the feed rather than hand-listed.
   * The name must match the town as the MLS spells it.
   */
  marketSearch?: { city: string; heading?: string };
  /** Prepend the 3-step "What's your property worth?" wizard (e.g. sell) */
  valuation?: boolean;
  /** Full-bleed background for the valuation wizard (defaults to heroImage) */
  valuationImage?: string;
}

export interface SiteContent {
  /**
   * Which homepage design this client uses. Interior pages are shared;
   * the homepage carries the visual identity.
   * "classic" - light, centered serif hero, floating search card (default)
   * "noir"    - dark cinematic gallery: Ken Burns hero, listings rail
   * "estate"  - bright architectural split hero, marquee, hover showcase
   */
  homeVariant?: "classic" | "noir" | "estate";
  /** Brand palette — injected as CSS variables, overrides the defaults in globals.css */
  theme: {
    /** Primary brand color: headings, buttons, accents (original: #004F71) */
    primary: string;
    /** Secondary/muted color: body text, hero overlay tint (original: #88786A) */
    secondary: string;
    /** Page background (original: #FBF9F7) */
    background: string;
  };
  brand: {
    /** Wordmark text in the header and footer (used when no logo images) */
    name: string;
    tagline: string;
    /**
     * Optional logo images. `light` shows over the transparent hero nav,
     * `dark` shows on the scrolled white nav and can be reused in the footer.
     */
    logo?: { light: string; dark: string };
    /**
     * Optional large, faint brand mark (e.g. a ring/seal logo, light version)
     * that settles into the side menu's lower-right corner when it opens.
     */
    decal?: string;
    /** Where the header logo links. Defaults to "/"; set per client scope. */
    homeHref?: string;
  };
  meta: {
    title: string;
    description: string;
    /** Production origin, no trailing slash (canonicals, sitemap, JSON-LD) */
    siteUrl?: string;
  };
  /**
   * Ad + analytics wiring. The Google Ads conversion id and labels are NOT
   * secrets (they ship in the page source of every site that uses them), so
   * they live here rather than in env and tracking works on deploy.
   * NEXT_PUBLIC_GTM_ID / _GA4_ID / _GOOGLE_ADS_ID still override.
   */
  analytics?: {
    /** Google Ads conversion id, e.g. "AW-17640808645" */
    googleAdsId?: string;
    /** GA4 measurement id, e.g. "G-XXXXXXXXXX" */
    ga4Id?: string;
    /** Maps our semantic events to Google Ads conversion labels */
    conversions?: Partial<Record<string, string>>;
  };
  hero: {
    preTitle: string;
    title: string;
    /** Optional background video; the image is used as poster/fallback */
    video?: { webm?: string; mp4?: string };
    image: string;
  };
  searchBar: {
    placeholder: string;
    ctaLabel: string;
    ctaHref: string;
  };
  nav: {
    left: NavLink[];
    right: NavLink[];
    /** Hamburger side-menu links */
    menu: NavLink[];
  };
  /**
   * "Featured Properties" band on the homepage highlighting the client's own
   * active listings. Live data comes from IDX Broker when IDX_API_KEY is set
   * in the deployment env; `listings` here is the manual fallback. Hidden when
   * neither yields listings.
   */
  featured?: { title: string; subtitle?: string; listings?: Listing[] };
  /** Interior pages, rendered at /<slug> (or /<client>/<slug>) */
  pages: SubPage[];
  /**
   * IDX Broker hookup. Set the client's IDX subdomain (e.g. "eaganluxury" for
   * eaganluxury.idxbroker.com) and the search page embeds their hosted search.
   * Omit to show a "search coming soon" panel instead.
   */
  idx?: {
    subdomain?: string;
    searchPath?: string;
    /**
     * Hides anything below this price from the browse feed and from searches
     * that set no minimum. A visitor who picks a lower Min Price still sees
     * everything; this only stops a luxury site from opening on starter homes.
     */
    minPrice?: number;
    /** Towns to offer in the homepage autocomplete (the client's markets) */
    markets?: string[];
    /**
     * Property-type menu for the on-page search. Values must match what the
     * client's MLS actually returns (MLS PIN, for instance, has no subtypes:
     * everything is Residential / Residential Income / Land). Omit to use the
     * generic Single Family / Condominium / Townhouse / Land menu.
     */
    propertyTypes?: { value: string; label: string }[];
  };
  /** Contact details for the connect page and footer */
  contact?: { phone?: string; email?: string };
  /**
   * Team roster, rendered by a page with type: "team". Individual agents
   * simply omit this. Team sites keep `about` as the founder/lead spotlight
   * (the pattern every reference team site uses) and link here for the
   * full roster.
   */
  team?: {
    /** Small line above the grid, e.g. "Nine specialists. One standard." */
    tagline?: string;
    members: TeamMember[];
  };
  /**
   * Regulatory/compliance values. Boilerplate legal pages (privacy, terms,
   * accessibility, fair housing) and the footer compliance accordion render
   * from these. MLS disclaimer text should be the client's MLS-required
   * paragraph; a generic "deemed reliable" fallback ships by default.
   */
  legal?: {
    licenseNumber?: string;
    licenseState?: string;
    mlsName?: string;
    mlsDisclaimer?: string;
    governingLaw?: string;
    stateCivilRightsAgency?: string;
    lastUpdated?: string;
  };
  /** Optional proof-point band rendered after the intro (e.g. "40+ / Years") */
  stats?: { value: string; label: string }[];
  services: GalleryCard[];
  intro: {
    title: string;
    paragraphs: string[];
    ctaLabel: string;
    ctaHref: string;
  };
  areas: GalleryCard[];
  about: {
    title: string;
    subtitle: string;
    image: string;
    /** "portrait" (default) = circular headshot; "photo" = wide team photo */
    imageStyle?: "portrait" | "photo";
    /** Alternate plain paragraphs and bolded lead-ins */
    blocks: { heading?: string; text: string }[];
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
    image: string;
  };
  footer: {
    agentName: string;
    brokerage: string;
    links: NavLink[];
    socials: { platform: "instagram" | "facebook" | "linkedin"; href: string }[];
    addressLines: string[];
    newsletter: {
      heading: string;
      tagline: string;
      consent: string;
    };
    copyright: string;
    /** Optional compliance row: Equal Housing logo + license/brokerage line */
    compliance?: { image: string; text: string };
  };
}

/* --------------------------------------------------------------------------
   CLIENT: Commonwealth Living Group (commonwealth-living) - homepage variant "classic"
   Tom Tomasian, Team Lead · Real Broker MA, LLC · commonwealthliving.com
   Sources: DMR onboarding Typeform (Sep 2026), Zillow profile ttomasian,
   RealTrends Verified 2026 team profile, Google Business Profile, Instagram.
   -------------------------------------------------------------------------- */

const PHOTO = "/photos";

export const site: SiteContent = {
  homeVariant: "classic",
  theme: {
    // Near-black + a deepened take on the logo gold (#B69151), tuned to stay
    // legible on the light canvas and the dark hero/CTA overlays
    primary: "#141414",
    secondary: "#9A7638",
    background: "#FAF8F4",
  },
  brand: {
    name: "Commonwealth Living Group",
    tagline: "Beyond the Finish Line",
    logo: { light: "/brand/clg-mark-light.png", dark: "/brand/clg-mark-dark.png" },
    decal: "/brand/clg-ring-light.png",
  },
  meta: {
    siteUrl: "https://commonwealthliving.com",
    title: "Greater Boston Luxury Homes | Commonwealth Living Group",
    description:
      "Tom Tomasian and Commonwealth Living Group at Real Broker MA: a data-driven team for move-up, luxury, and new construction homes across Greater Boston.",
  },
  hero: {
    preTitle: "Greater Boston Luxury Real Estate",
    title: "Where Greater Boston Moves Up",
    // Poster paints first (it is the measured LCP); the video attaches
    // after load. Re-encode with ffmpeg if the source is ever replaced.
    image: `${PHOTO}/hero-boston-aerial.jpg`,
    video: { webm: "/video/boston-aerial.webm", mp4: "/video/boston-aerial.mp4" },
  },
  searchBar: {
    placeholder: "Search by address, neighborhood, or town",
    ctaLabel: "Search",
    ctaHref: "/listings",
  },
  nav: {
    // Balanced around the centered logo: what you do on the left,
    // where and who on the right.
    left: [
      { label: "Sell With Us", href: "/sell" },
      { label: "Buy With Us", href: "/buy" },
      { label: "New Construction", href: "/new-construction" },
    ],
    right: [
      { label: "Property Search", href: "/listings" },
      { label: "Communities", href: "/communities" },
      { label: "Let’s Connect", href: "/connect" },
    ],
    menu: [
      { label: "Home", href: "/" },
      { label: "Property Search", href: "/listings" },
      { label: "New Construction", href: "/new-construction" },
      { label: "Buy with Us", href: "/buy" },
      { label: "Sell with Us", href: "/sell" },
      {
        label: "Communities",
        href: "/communities",
        children: [
          { label: "Canton", href: "/canton" },
          { label: "Westwood", href: "/westwood" },
          { label: "Wellesley", href: "/wellesley" },
          { label: "Boston", href: "/boston" },
        ],
      },
      { label: "Meet the Team", href: "/team" },
      { label: "Let's Connect", href: "/connect" },
    ],
  },
  // Luxury focus per the client brief: nothing under $800K in the browse feed
  // unless a visitor sets their own minimum.
  idx: {
    minPrice: 800000,
    // Towns the team works. They power the homepage autocomplete, so every
    // one is searchable the moment the page loads, before the MLS location
    // index arrives. Keep in step with IDX_MARKET_CITIES.
    markets: [
      "Canton", "Westwood", "Sharon", "Milton", "Needham", "Newton",
      "Chestnut Hill", "Wellesley", "Dover", "Brookline", "Easton",
      "Hingham", "Norwell", "Cohasset", "Walpole", "Medfield", "Boston",
    ],
  },
  contact: { phone: "(617) 295-7600", email: "tom@clghomes.com" },
  team: {
    tagline: "A small team with a big-market record.",
    members: [
      {
        name: "Tom Tomasian",
        role: "Founder & Team Lead",
        image: `${PHOTO}/tom-tomasian-gray.jpg`,
        phone: "(617) 295-7600",
        email: "tom@clghomes.com",
        license: "MA License #9574596",
        bio: "Fifteen years in the mortgage business before leading the team, Tom brings a lender's eye for the numbers to every purchase and sale.",
      },
      {
        name: "Vasilis Axios",
        role: "Real Estate Agent",
        image: "/team/vasilis-axios.jpg",
        bio: "Quick to respond and deeply versed in the process, Vasilis stays in close contact with every party from first showing to closing day.",
      },
      {
        name: "Alexander Stamatiou",
        role: "Real Estate Agent",
        image: "/team/alexander-stamatiou.jpg",
        bio: "A sharp negotiator with steady follow-through, Alexander keeps complicated closings on track until the keys change hands.",
      },
      {
        name: "Justin O'Connor",
        role: "Real Estate Agent",
        image: "/team/justin-oconnor.jpg",
        bio: "Justin listens first, applies no pressure, and works to make buying a home an experience clients genuinely enjoy.",
      },
    ],
  },
  legal: {
    licenseNumber: "9574596",
    licenseState: "Licensed in Massachusetts",
    mlsName: "MLS Property Information Network, Inc. (MLS PIN)",
    mlsDisclaimer:
      "The property listing data and information set forth herein were provided to MLS Property Information Network, Inc. from third party sources, including sellers, lessors and public records, and were compiled by MLS Property Information Network, Inc. The property listing data and information are for the personal, non commercial use of consumers having a good faith interest in purchasing or leasing listed properties of the type displayed to them and may not be used for any purpose other than to identify prospective properties which such consumers may have a good faith interest in purchasing or leasing. MLS Property Information Network, Inc. and its subscribers disclaim any and all representations and warranties as to the accuracy of the property listing data and information set forth herein.",
    governingLaw: "the Commonwealth of Massachusetts",
    stateCivilRightsAgency: "the Massachusetts Commission Against Discrimination (MCAD)",
    lastUpdated: "September 2026",
  },
  // PLACEHOLDER listings (DEMO- ids): shown until IDX Broker is connected.
  // Replace with the team's real active listings before launch.
  featured: {
    title: "Featured Properties",
    subtitle: "Active Listings",
    listings: [
      {
        price: "$1,895,000",
        address: "Sample Listing · Wellesley",
        propertyType: "residential",
        beds: "5",
        baths: "4.5",
        sqft: "4,800",
        status: "For Sale",
        mls: "DEMO-001",
        image: `${PHOTO}/brick-colonial-lawn.jpg`,
        href: "/listings",
      },
      {
        price: "$1,450,000",
        address: "Sample Listing · Westwood",
        propertyType: "residential",
        beds: "4",
        baths: "3.5",
        sqft: "3,900",
        status: "For Sale",
        mls: "DEMO-002",
        image: `${PHOTO}/colonial-black-shutters.jpg`,
        href: "/listings",
      },
      {
        price: "$1,275,000",
        address: "Sample Listing · Canton",
        propertyType: "residential",
        beds: "4",
        baths: "3.5",
        sqft: "3,650",
        status: "For Sale",
        mls: "DEMO-003",
        image: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
        href: "/listings",
      },
      {
        price: "$1,650,000",
        address: "Sample Listing · Boston, Back Bay",
        propertyType: "residential",
        beds: "2",
        baths: "2",
        sqft: "1,550",
        status: "For Sale",
        mls: "DEMO-004",
        image: `${PHOTO}/living-room-black-windows.jpg`,
        href: "/listings",
      },
    ],
  },
  pages: [
    {
      slug: "listings",
      type: "listings",
      title: "Featured Listings",
      preTitle: "Active and Recently Sold",
      heroImage: `${PHOTO}/shingle-estate-waterfront.jpg`,
      intro: [
        "The homes we represent across Greater Boston: current listings, new construction, and recent results.",
      ],
    },
    {
      slug: "buy",
      title: "Buy with Us",
      preTitle: "Representation for Move-Up and Luxury Buyers",
      heroImage: `${PHOTO}/living-room-black-windows.jpg`,
      intro: [
        "Buying at the upper end of the Greater Boston market rewards preparation. We start with your numbers, narrow the towns and streets that fit how you want to live, and negotiate with the data in hand.",
      ],
      sections: [
        {
          heading: "Know Your Numbers First",
          text: "Tom spent fifteen years in the mortgage business before leading this team. That means a clear read on financing structure, rate strategy, and what makes an offer strong on paper, before you ever walk into an open house.",
          image: `${PHOTO}/tom-tomasian-office.jpg`,
        },
        {
          heading: "New Construction and Quiet Inventory",
          text: "Some of the best homes in Canton, Westwood, Wellesley, and the surrounding towns are new builds or sell with little public exposure. We track both, so you see the full picture rather than the portal slice.",
          image: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
        },
        {
          heading: "Relocating to Greater Boston",
          text: "Moving in from out of state? We compare towns side by side on commute, schools, taxes, and value, run virtual tours when you can't be here, and keep you informed at every step until you have the keys.",
          image: `${PHOTO}/beacon-hill-lane.jpg`,
        },
      ],
      cta: { label: "Start Your Search", href: "/connect" },
    },
    {
      slug: "sell",
      title: "Sell with Us",
      preTitle: "Data-Driven Pricing, Polished Presentation",
      heroImage: `${PHOTO}/marble-kitchen.jpg`,
      intro: [
        "A home at this price point deserves more than a listing. We price from real comparables, present the property the way today's buyers expect, and put it in front of buyers who are ready to act.",
      ],
      sections: [
        {
          heading: "Pricing by the Numbers",
          text: "Automated estimates miss what actually moves a sale: finish quality, lot, school district, and the recent sales down the street. We build pricing from current comparables and position your home to draw competition.",
          image: `${PHOTO}/colonial-flag.jpg`,
        },
        {
          heading: "Offers You Can Count On",
          text: "A lender's background changes how offers are read. We look past the headline price to the financing behind it, so the offer you accept is the one most likely to close on time.",
          image: `${PHOTO}/tom-tomasian-phone.jpg`,
        },
        {
          heading: "Presentation That Earns the Price",
          text: "Staging guidance, professional photography, and a launch plan built for your buyer profile. The first week on market matters most, and we plan for it before the sign goes up.",
          image: `${PHOTO}/marble-kitchen.jpg`,
        },
        {
          heading: "A Managed Path to Closing",
          text: "From pre-market prep through inspection, appraisal, and closing, we coordinate the details and keep you informed, so the process protects your time.",
          image: `${PHOTO}/tom-tomasian-staircase.jpg`,
        },
      ],
      cta: { label: "Request a Valuation", href: "/connect" },
      valuation: true,
      valuationImage: `${PHOTO}/shingle-estate-dusk.jpg`,
    },
    {
      slug: "new-construction",
      title: "New Construction",
      preTitle: "New Builds Across Greater Boston",
      heroImage: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
      intro: [
        "New construction is where we spend most of our time. From a single infill build in Canton or Westwood to a new neighborhood on the South Shore, and new high-end condominiums in the city, we help buyers weigh the builder, the contract, and the numbers before they commit.",
      ],
      sections: [
        {
          heading: "Representation on Your Side",
          text: "The sales office represents the builder. Having your own agent costs you nothing in most new construction purchases, and it puts someone in your corner for pricing, upgrades, and contract terms.",
          image: `${PHOTO}/new-construction-site.jpg`,
        },
        {
          heading: "Financing a Build",
          text: "Construction timelines change how you finance. Tom's fifteen years in the mortgage business help you plan rate locks, deposits, and closing dates around the build schedule instead of reacting to it.",
          image: `${PHOTO}/tom-tomasian-office.jpg`,
        },
        {
          heading: "Single Family in the Suburbs, Condos in the City",
          text: "In Canton, Westwood, Wellesley, and the towns around them, new construction means single family homes on established streets. In Boston proper it means high-end condominiums: new buildings, penthouses, and boutique conversions. We work both.",
          image: `${PHOTO}/living-room-black-windows.jpg`,
        },
        {
          heading: "Inspections at Every Stage",
          text: "New does not mean flawless. We encourage independent inspections before drywall and before closing, and we track the punch list through to completion.",
          image: `${PHOTO}/living-room-two-story.jpg`,
        },
      ],
      cta: { label: "Ask About New Builds", href: "/connect" },
    },
    {
      slug: "communities",
      title: "Communities",
      preTitle: "Greater Boston, Town by Town",
      heroImage: `${PHOTO}/new-england-autumn-aerial.jpg`,
      intro: [
        "We focus on the Greater Boston towns where move-up and luxury buyers live. In the suburbs that means single family homes, with heavy emphasis on new construction. In Boston proper it means high-end condominiums. Counties here are broad and prices swing widely between towns, so we work town by town rather than painting the whole map with one brush.",
      ],
      sections: [
        {
          heading: "Canton, Sharon & Easton",
          text: "Our home base. Wooded lots, the Blue Hills on the doorstep, and quick access to Route 128, I-95, and I-93 for commuters heading into Boston or Providence.",
          image: `${PHOTO}/colonial-black-shutters.jpg`,
        },
        {
          heading: "Westwood, Walpole, Medfield & Dover",
          text: "Classic New England towns with strong schools, larger lots, and a steady pipeline of new construction, with commuter rail and Route 128 close by.",
          image: `${PHOTO}/gated-drive.jpg`,
        },
        {
          heading: "Wellesley, Needham, Newton & Chestnut Hill",
          text: "Some of the most sought-after addresses west of Boston, with walkable village centers, top-rated schools, and a quick trip into the city.",
          image: `${PHOTO}/brick-colonial-lawn.jpg`,
        },
        {
          heading: "Milton & Brookline",
          text: "Close-in communities with historic homes and tree-lined streets, minutes from downtown Boston.",
          image: `${PHOTO}/beacon-hill-lane.jpg`,
        },
        {
          heading: "Hingham, Norwell & Cohasset",
          text: "The South Shore's coastal towns: harbor views, historic centers, and room to spread out, with commuter boat and rail options into the city.",
          image: `${PHOTO}/waterfront-homes-dock.jpg`,
        },
        {
          heading: "Boston",
          text: "In the city, our focus is high-end condominiums, from Back Bay and Beacon Hill to the Seaport and the South End.",
          image: `${PHOTO}/boston-harbor-night.jpg`,
        },
      ],
      cta: { label: "Find Your Town", href: "/connect" },
    },
    {
      slug: "canton",
      marketSearch: { city: "Canton" },
      title: "Canton",
      preTitle: "Our Home Base",
      heroImage: `${PHOTO}/colonial-black-shutters.jpg`,
      intro: [
        "Canton is where our team is rooted. It pairs wooded, private lots and the Blue Hills Reservation with fast highway and commuter rail access to Boston.",
      ],
      sections: [
        {
          heading: "Room to Breathe, Close to the City",
          text: "Established neighborhoods and new construction sit side by side here, giving move-up buyers space and privacy without giving up an easy commute.",
          image: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
        },
        {
          heading: "Neighbors Worth Knowing",
          text: "Canton buyers often look at Sharon, Westwood, Milton, and Easton too. We know how each one compares on price, taxes, schools, and commute.",
          image: `${PHOTO}/new-england-autumn-aerial.jpg`,
        },
      ],
      cta: { label: "Talk Canton With Tom", href: "/connect" },
    },
    {
      slug: "westwood",
      marketSearch: { city: "Westwood" },
      title: "Westwood",
      preTitle: "Classic New England, New Construction",
      heroImage: `${PHOTO}/gated-drive.jpg`,
      intro: [
        "Westwood combines a well-regarded school system and a small-town feel with Route 128 and commuter rail access, and it sees a steady flow of new construction.",
      ],
      sections: [
        {
          heading: "Where New Builds Meet Established Streets",
          text: "From renovated colonials to new builds on generous lots, Westwood gives move-up buyers real choice. We help you compare them on value, not just finishes.",
          image: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
        },
        {
          heading: "Nearby: Dover, Medfield & Walpole",
          text: "Buyers here often weigh Dover's estate lots, Medfield's village center, and Walpole's value. We walk you through the tradeoffs.",
          image: `${PHOTO}/shingle-estate-waterfront.jpg`,
        },
      ],
      cta: { label: "Explore Westwood", href: "/connect" },
    },
    {
      slug: "wellesley",
      marketSearch: { city: "Wellesley" },
      title: "Wellesley",
      preTitle: "The MetroWest Standard",
      heroImage: `${PHOTO}/brick-colonial-lawn.jpg`,
      intro: [
        "Wellesley remains one of Greater Boston's most sought-after towns, with village shopping, top schools, and commuter rail into the city.",
      ],
      sections: [
        {
          heading: "Competitive by Nature",
          text: "Well-priced Wellesley homes draw strong interest. Buyers who arrive with financing fully structured and a clear read on recent sales are the ones who win.",
          image: `${PHOTO}/bedroom-suite.jpg`,
        },
        {
          heading: "Nearby: Needham, Newton & Chestnut Hill",
          text: "We cover the neighboring towns just as closely, so you can compare homes across town lines and choose on value.",
          image: `${PHOTO}/colonial-flag.jpg`,
        },
      ],
      cta: { label: "Explore Wellesley", href: "/connect" },
    },
    {
      slug: "boston",
      marketSearch: { city: "Boston" },
      title: "Boston",
      preTitle: "High-End Condominiums",
      heroImage: `${PHOTO}/boston-zakim-night.jpg`,
      intro: [
        "In the city, our focus is luxury condominiums: full-service buildings, penthouses, and boutique brownstone conversions across Boston's most established neighborhoods.",
      ],
      sections: [
        {
          heading: "Buildings, Not Just Units",
          text: "Condo value depends on the building behind it. We review association finances, reserves, and fees alongside the unit, so there are no surprises after closing.",
          image: `${PHOTO}/living-room-black-windows.jpg`,
        },
        {
          heading: "Back Bay to the Seaport",
          text: "Beacon Hill brownstones, Back Bay towers, South End lofts, and Seaport new construction each suit a different buyer. We help you find the one that fits.",
          image: `${PHOTO}/beacon-hill-lane.jpg`,
        },
      ],
      cta: { label: "Explore Boston Condos", href: "/connect" },
    },
    {
      slug: "team",
      type: "team",
      title: "Meet the Team",
      preTitle: "The People Behind the Results",
      heroImage: `${PHOTO}/boston-harbor-night.jpg`,
      intro: [
        "Commonwealth Living Group is a small team with collective experience of more than 300 homes sold. RealTrends Verified ranked us the #4 small team in Boston and #17 in Massachusetts by transaction sides in 2026.",
      ],
      cta: { label: "Work With Us", href: "/connect" },
    },
    {
      slug: "connect",
      type: "connect",
      title: "Let's Connect",
      preTitle: "Begin with a Conversation",
      heroImage: `${PHOTO}/beacon-hill-lane.jpg`,
      intro: [
        "Buying, selling, or weighing a move up? A short conversation is the right place to start. Call or text Tom at (617) 295-7600, or send a note below.",
      ],
    },
  ],
  stats: [
    { value: "300+", label: "Homes Sold, Collective Team Experience" },
    { value: "$180M+", label: "In Collective Sales Volume" },
    { value: "#4", label: "Small Team in Boston, RealTrends 2026" },
  ],
  services: [
    {
      preTitle: "Move-Up & Luxury",
      title: "Buy with Us",
      cta: "Learn More",
      href: "/buy",
      image: `${PHOTO}/interior-dining-chandelier.jpg`,
    },
    {
      preTitle: "Data-Driven Pricing",
      title: "Sell with Us",
      cta: "Learn More",
      href: "/sell",
      image: `${PHOTO}/colonial-hydrangeas.jpg`,
    },
    {
      preTitle: "Our Specialty",
      title: "New Construction",
      cta: "Explore New Builds",
      href: "/new-construction",
      image: `${PHOTO}/new-construction-modern-farmhouse.jpg`,
    },
  ],
  intro: {
    title: "A Data-Driven Team for Greater Boston",
    paragraphs: [
      "More than 300 homes sold, fifteen years on the lending side of the table, and one standard: take every client beyond the finish line.",
      "We work with move-up and luxury buyers and sellers across Greater Boston, from Canton, Westwood, and Wellesley to the South Shore and Boston's high-end condo market.",
      "Every recommendation starts with the numbers. That is how we price homes, structure offers, and help clients make their next move with confidence.",
    ],
    ctaLabel: "Explore Listings",
    ctaHref: "/listings",
  },
  areas: [
    {
      title: "Canton",
      description: "Our home base: wooded lots, the Blue Hills, and quick highway and rail access to Boston.",
      href: "/canton",
      image: `${PHOTO}/colonial-black-shutters.jpg`,
    },
    {
      title: "Westwood",
      description: "Strong schools, generous lots, and a steady pipeline of new construction off Route 128.",
      href: "/westwood",
      image: `${PHOTO}/gated-drive.jpg`,
    },
    {
      title: "Wellesley",
      description: "Village centers, top-rated schools, and some of the most sought-after addresses west of the city.",
      href: "/wellesley",
      image: `${PHOTO}/brick-colonial-lawn.jpg`,
    },
    {
      title: "Boston",
      description: "High-end condominiums from Beacon Hill and Back Bay to the Seaport.",
      href: "/boston",
      image: `${PHOTO}/boston-harbor-night.jpg`,
    },
    {
      title: "The South Shore",
      description: "Hingham, Norwell, and Cohasset: harbor views, historic centers, and room to spread out.",
      href: "/communities",
      image: `${PHOTO}/waterfront-homes-dock.jpg`,
    },
  ],
  about: {
    title: "Meet Tom Tomasian",
    subtitle: "Founder & Team Lead",
    image: `${PHOTO}/tom-tomasian-navy.jpg`,
    blocks: [
      {
        text: "Tom founded Commonwealth Living Group after fifteen years in the mortgage business, and that background shapes everything the team does. He reads a deal the way a lender does: by the numbers, with an eye on what will actually close.",
      },
      {
        text: "A Dorchester native and twelve-time Boston Marathon finisher, Tom built the team around a simple promise: take every client beyond the finish line. Together the team brings collective experience of more than 300 homes sold.",
      },
      {
        heading: "Ranked by RealTrends",
        text: "RealTrends Verified ranked Commonwealth Living Group the #4 small team in Boston and #17 in Massachusetts by transaction sides for 2026, placing the team among the top 1.5% of real estate professionals.",
      },
      {
        heading: "Data First",
        text: "From pricing a listing to structuring an offer, every recommendation starts with the market data and the financing behind it.",
      },
    ],
  },
  cta: {
    title: "Make Your Next Move",
    description:
      "Whether you are moving up, relocating to Greater Boston, or considering a new build, start with a conversation. We will bring the numbers.",
    buttonLabel: "Let's Connect",
    buttonHref: "/connect",
    image: `${PHOTO}/boston-skyline-night.jpg`,
  },
  footer: {
    agentName: "Tom Tomasian · Commonwealth Living Group",
    brokerage: "Real Broker MA, LLC",
    links: [
      { label: "Home", href: "/" },
      { label: "Property Search", href: "/listings" },
      { label: "New Construction", href: "/new-construction" },
      { label: "Buy with Us", href: "/buy" },
      { label: "Sell with Us", href: "/sell" },
      { label: "Communities", href: "/communities" },
      { label: "Meet the Team", href: "/team" },
      { label: "Let's Connect", href: "/connect" },
    ],
    socials: [
      { platform: "instagram", href: "https://www.instagram.com/tomtomasian/" },
      { platform: "facebook", href: "https://www.facebook.com/TomTomasian" },
      { platform: "linkedin", href: "https://www.linkedin.com/in/thomastomasian/" },
    ],
    // Google Business Profile address. Client is rebuilding the GBP; confirm before launch.
    addressLines: ["375 Neponset Ave", "Boston, MA 02122", "(617) 295-7600"],
    newsletter: {
      heading: "Join the List",
      tagline: "New Construction. Market Data. First Looks.",
      consent:
        "I agree to be contacted by Commonwealth Living Group via call, email, and text for real estate services. To opt out, reply 'stop' at any time or reply 'help' for assistance. You can also click the unsubscribe link in the emails. Message and data rates may apply. Message frequency may vary.",
    },
    copyright: `Copyright ${new Date().getFullYear()} Commonwealth Living Group`,
    compliance: {
      image: "/equal-housing.png",
      text: "Commonwealth Living Group is a team brokered by Real Broker MA, LLC.",
    },
  },
};
