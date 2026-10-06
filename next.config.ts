import type { NextConfig } from "next";

const config: NextConfig = {
  // Used by local browser checks; keep development origins narrowly scoped.
  allowedDevOrigins: ["127.0.0.1"],
};
export default config;
