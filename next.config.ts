import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure better-sqlite3 native module works server-side only
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
