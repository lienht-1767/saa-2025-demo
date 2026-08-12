import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep visual-regression captures free of the development-only corner badge.
  devIndicators: false,
};

export default withNextIntl(nextConfig);
