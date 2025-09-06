const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    image: '/static/images/fallback.png'
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    craCompat: false,
    gzipSize: true,
  },
  // Webpack configuration for better optimization
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Production optimizations
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
      }

      // Tree shaking for CSS
      if (!isServer) {
        config.optimization.splitChunks.cacheGroups.styles = {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
          priority: 20,
        };
      }

      // Add Terser for better minification
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new (require('terser-webpack-plugin'))({
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

      // Cache configuration
      config.cache = {
        type: 'filesystem',
        version: '1.0.0',
        store: 'pack',
        hashAlgorithm: 'xxhash64',
        compression: 'brotli',
        cacheDirectory: require('path').resolve(__dirname, '.next/cache/webpack')
      };
    }

    // Split chunks optimization
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
              // Get the name of the package from the path segment after node_modules
              const packagePath = module.context?.replace(/\\/g, '/').match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/);
              const packageName = packagePath ? packagePath[1] : 'vendors';
              return `vendor.${packageName.replace('@', '').replace(/\//g, '.')}`;
            },
            priority: -20,
            reuseExistingChunk: true
          }
        },
      };
    }

    return config;
  },
  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig));