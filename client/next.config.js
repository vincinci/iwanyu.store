/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ],
    };
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

module.exports = nextConfig;
