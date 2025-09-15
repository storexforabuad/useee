import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from '@ducanh2912/next-pwa';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import { Configuration } from 'webpack';
import type { NextConfig } from 'next';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pwa = withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
    image: '/static/images/fallback.png',
    audio: '',
    video: '',
    font: ''
  },
  workboxOptions: {
    skipWaiting: true,
    exclude: [/middleware-manifest\.json$/],
  }
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  },
  // Bundle optimization settings
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable module concatenation
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['@firebase/firestore', '@firebase/auth', 'lucide-react', 'framer-motion'],
  },
  // Webpack configuration for better optimization
  webpack: (config: Configuration, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        minimize: true,
        moduleIds: 'deterministic',
        runtimeChunk: isServer ? undefined : 'single',
        concatenateModules: true,
        providedExports: true,
        innerGraph: true,
      };

      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            firebase: {
              test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
              enforce: true
            },
            shared: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react|@headlessui)[\\/]/,
              name: 'shared',
              chunks: 'async',
              priority: 15,
              reuseExistingChunk: true
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name(module: { context: string | undefined }) {
                const packagePath = module.context?.replace(/\\/g, '/').match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/);
                const packageName = packagePath ? packagePath[1] : 'vendors';
                return `vendor.${packageName.replace('@', '').replace(/\//g, '.')}`;
              },
              priority: -20,
              reuseExistingChunk: true
            },
            styles: {
              name: 'styles',
              test: /\.css$/,
              chunks: 'all',
              enforce: true,
              priority: 20,
            }
          },
        };
      }

      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              pure_funcs: ['console.log'],
              passes: 2,
              collapse_vars: true,
              reduce_vars: true,
              hoist_funs: true,
              keep_fargs: false
            },
            mangle: {
              safari10: true,
            },
            module: true,
            format: {
              comments: false,
              preserve_annotations: true
            },
            toplevel: true,
            keep_classnames: false,
            keep_fnames: false
          },
        })
      );

      config.cache = {
        type: 'filesystem',
        version: '1.0.0',
        store: 'pack',
        hashAlgorithm: 'xxhash64',
        compression: 'brotli',
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack')
      };
    }

    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2,
  },
}

export default pwa(bundleAnalyzer(nextConfig));