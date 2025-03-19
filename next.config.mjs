/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react', 
      '@radix-ui/react-icons',
      'date-fns',
    ],
    serverActions: true,
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    instrumentationHook: true,
  },
  // Configuration pour la compression des images
  webpack: (config, { isServer }) => {
    // Optimisation des images avec imagemin
    config.module.rules.push({
      test: /\.(jpe?g|png|webp)$/i,
      use: [
        {
          loader: 'responsive-loader',
          options: {
            adapter: require('responsive-loader/sharp'),
            sizes: [320, 640, 960, 1280, 1920],
            placeholder: true,
            placeholderSize: 40,
          },
        },
      ],
    });

    // Optimisation spécifique côté client
    if (!isServer) {
      // Pour réduire la taille du bundle
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next|framer-motion)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 80000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const rawName = module.identifier().split('/').reduceRight((item) => item);
              const name = rawName
                .replace(/\.js$/, '')
                .replace(/^~/, '')
                .replace(/[^\w-]/g, '_');
              return `lib-${name}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: false,
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  // Compressions et optimisations avancées
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: process.env.SENTRY_AUTH_TOKEN ? true : false,
  env: {
    APP_ENV: process.env.NODE_ENV,
  },
};

// Configuration pour Sentry uniquement en production
const sentryWebpackPluginOptions = {
  silent: true,
};

const configWithSentry = process.env.SENTRY_AUTH_TOKEN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions) 
  : nextConfig;

export default configWithSentry; 
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react', 
      '@radix-ui/react-icons',
      'date-fns',
    ],
    serverActions: true,
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    instrumentationHook: true,
  },
  // Configuration pour la compression des images
  webpack: (config, { isServer }) => {
    // Optimisation des images avec imagemin
    config.module.rules.push({
      test: /\.(jpe?g|png|webp)$/i,
      use: [
        {
          loader: 'responsive-loader',
          options: {
            adapter: require('responsive-loader/sharp'),
            sizes: [320, 640, 960, 1280, 1920],
            placeholder: true,
            placeholderSize: 40,
          },
        },
      ],
    });

    // Optimisation spécifique côté client
    if (!isServer) {
      // Pour réduire la taille du bundle
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next|framer-motion)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 80000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const rawName = module.identifier().split('/').reduceRight((item) => item);
              const name = rawName
                .replace(/\.js$/, '')
                .replace(/^~/, '')
                .replace(/[^\w-]/g, '_');
              return `lib-${name}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: false,
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  // Compressions et optimisations avancées
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: process.env.SENTRY_AUTH_TOKEN ? true : false,
  env: {
    APP_ENV: process.env.NODE_ENV,
  },
};

// Configuration pour Sentry uniquement en production
const sentryWebpackPluginOptions = {
  silent: true,
};

const configWithSentry = process.env.SENTRY_AUTH_TOKEN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions) 
  : nextConfig;

export default configWithSentry; 