// import { withSentryConfig } from '@sentry/nextjs'
import defaultNextConfig from '@sushiswap/nextjs-config'
import { withAxiom } from 'next-axiom'

import withBundleAnalyzer from '@next/bundle-analyzer'
const bundleAnalyzer = withBundleAnalyzer({
  enabled: false && process.env.NODE_ENV !== 'development',
})

const FURO_URL = process.env.FURO_URL || 'https://furo.sushi.com'

/** @type {import('next').NextConfig} */
const nextConfig = bundleAnalyzer({
  ...defaultNextConfig,
  experimental: {
    ...defaultNextConfig.experimental,
    testProxy: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        permanent: true,
        destination: '/swap',
      },
      {
        source: '/discord{/}?',
        permanent: true,
        destination: 'https://discord.gg/SDPH8SNVZW',
      },
      {
        source: '/github{/}?',
        permanent: true,
        destination: 'https://github.com/sushiswap',
      },
      {
        source: '/twitter{/}?',
        permanent: true,
        destination: 'https://twitter.com/sushiswap',
      },
      {
        source: '/instagram{/}?',
        permanent: true,
        destination: 'https://instagram.com/instasushiswap',
      },
      {
        source: '/medium{/}?',
        permanent: true,
        destination: 'https://medium.com/sushiswap-org',
      },
      {
        source: '/earn/:path*',
        permanent: true,
        destination: '/pool/:path*',
      },
      {
        source: '/pools/:path*',
        permanent: true,
        destination: '/pool/:path*',
      },
      {
        source: '/pool/:path*/positions',
        permanent: true,
        destination: '/pool/:path*',
      },
      {
        source: '/skale/swap',
        permanent: true,
        destination: '/swap?chainId=2046399126',
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/furo',
        destination: `${FURO_URL}/furo`,
      },
      {
        source: '/furo/:path*',
        destination: `${FURO_URL}/furo/:path*`,
      },
    ]
  },
  // sentry: {
  //   hideSourceMaps: true,
  //   widenClientFileUpload: true,
  //   automaticVercelMonitors: true,
  // },
})

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
// const sentryWebpackPluginOptions = {
//   // Additional config options for the Sentry webpack plugin. Keep in mind that
//   // the following options are set automatically, and overriding them is not
//   // recommended:
//   //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

//   org: 'sushi-j9',
//   project: 'evm',

//   // An auth token is required for uploading source maps.
//   authToken: process.env.SENTRY_AUTH_TOKEN,

//   silent: true, // Suppresses all logs

//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options.
// }

export default withAxiom(nextConfig)

// export default withSentryConfig(
//   withAxiom(nextConfig),
//   sentryWebpackPluginOptions,
//   {
//     hideSourceMaps: true,
//     widenClientFileUpload: true,
//     automaticVercelMonitors: true,
//   },
//   // {
//   //   // For all available options, see:
//   //   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//   //   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   //   widenClientFileUpload: true,

//   //   // Transpiles SDK to be compatible with IE11 (increases bundle size)
//   //   transpileClientSDK: false,

//   //   // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
//   //   tunnelRoute: '/monitoring',

//   //   // Hides source maps from generated client bundles
//   //   hideSourceMaps: true,

//   //   // Automatically tree-shake Sentry logger statements to reduce bundle size
//   //   disableLogger: true,
//   // },
// )
