import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native sqlite driver out of the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Bundle demo.db with the server output so the live dashboard has data.
  outputFileTracingIncludes: {
    "/**": ["./demo.db"],
  },
};

export default nextConfig;
