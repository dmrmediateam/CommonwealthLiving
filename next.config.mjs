/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // /search was replaced by the native MLS search at /listings.
    return [{ source: "/search", destination: "/listings", permanent: true }];
  },
};

export default nextConfig;
