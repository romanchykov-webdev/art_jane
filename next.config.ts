import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // reactCompiler: true,
    reactCompiler: process.env.NODE_ENV === 'production',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nnmvfkxukiifiucgjdra.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};

export default nextConfig;
