import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_AUTH_DISABLED: process.env.AUTH_DISABLED ?? "",
  },
};

export default nextConfig;
