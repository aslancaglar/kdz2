/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['convex', 'lucide-react'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'friendly-swan-312.convex.cloud',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },
};

export default nextConfig;
