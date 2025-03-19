/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "localhost:3003"],
    },
    esmExternals: true,
  },
  eslint: {
    // Désactiver temporairement la vérification ESLint pendant la construction
    ignoreDuringBuilds: true,
  },
  // Forcer un nouveau buildId à chaque démarrage pour éviter les conflits de cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Configuration optimisée du webpack pour résoudre les problèmes de chargement
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Optimisations pour les modules clients
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 