const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;
const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;

function extractHostname(url) {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

const imageHostnames = Array.from(
    new Set([
        '**.convex.cloud',
        '**.convex.site',
        extractHostname(convexUrl),
        extractHostname(convexSiteUrl),
        'images.pexels.com',
        'via.placeholder.com',
    ].filter(Boolean)),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['convex', 'lucide-react'],
    env: {
        ...(convexUrl ? { NEXT_PUBLIC_CONVEX_URL: convexUrl } : {}),
        ...(convexSiteUrl ? { NEXT_PUBLIC_CONVEX_SITE_URL: convexSiteUrl } : {}),
    },
    images: {
        unoptimized: true,
        remotePatterns: imageHostnames.map((hostname) => ({
            protocol: 'https',
            hostname,
        })),
    },
};

export default nextConfig;
