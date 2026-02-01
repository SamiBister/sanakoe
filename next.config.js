const withNextIntl = require("next-intl/plugin")(
  // Specify the path to the request config
  "./src/i18n.ts",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for hosting on static platforms
  // output: 'export', // Uncomment for static export

  // Disable image optimization for static export
  // images: {
  //   unoptimized: true
  // },

  // Other Next.js config options
  reactStrictMode: true,

  // i18n will be handled by next-intl middleware
  // No need for built-in i18n config with App Router
};

module.exports = withNextIntl(nextConfig);
