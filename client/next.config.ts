import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    locales: ['en', 'rw', 'fr'],
    defaultLocale: 'en',
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
  // Add additional configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Replace Firebase modules with empty modules
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/app': require.resolve('./src/stubs/firebase-app.js'),
        'firebase/auth': require.resolve('./src/stubs/firebase-auth.js'),
        'firebase/firestore': require.resolve('./src/stubs/firebase-firestore.js'),
        'firebase/storage': require.resolve('./src/stubs/firebase-storage.js'),
        'firebase/analytics': require.resolve('./src/stubs/firebase-analytics.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
