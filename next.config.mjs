/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Logo A and icons are static under public/; skip sharp for clean Hobby builds
    unoptimized: true,
  },
};

export default nextConfig;
