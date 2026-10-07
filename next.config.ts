import type { NextConfig } from "next";

const isDesktopBuild = process.env.CALISTHENICS_DESKTOP === "1";

const config: NextConfig = {
  // Used by local browser checks; keep development origins narrowly scoped.
  allowedDevOrigins: ["127.0.0.1"],
  ...(isDesktopBuild ? { output: "export", trailingSlash: true } : {}),
};
export default config;
