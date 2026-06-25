import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js to use server-side Twilio without bundling issues
  serverExternalPackages: ["twilio"],
};

export default nextConfig;
