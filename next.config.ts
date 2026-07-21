import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native sqlite driver out of the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
