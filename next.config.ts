import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep visual-regression captures free of the development-only corner badge.
  devIndicators: false,
  images: {
    // Google OAuth profile photos are stored as absolute lh3 URLs in public.profiles.avatar_url.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default withNextIntl(nextConfig);
