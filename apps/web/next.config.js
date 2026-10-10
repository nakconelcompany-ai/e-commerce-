/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nuvora/shared'],
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'localhost'],
  },
};

module.exports = nextConfig;
