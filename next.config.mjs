/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lms.astanait.edu.kz',
      },
    ],
  },
};

export default nextConfig;
