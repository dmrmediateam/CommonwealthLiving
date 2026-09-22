/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Retired routes: /new-construction folded into the buy page, /search
    // replaced by the native MLS search at /listings.
    return [
      { source: "/new-construction", destination: "/buy", permanent: true },
      { source: "/search", destination: "/listings", permanent: true },
    ];
  },
};

export default nextConfig;
