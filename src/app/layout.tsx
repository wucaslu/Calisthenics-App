import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calisthenics Skill Tree — Build strength. Unlock skills.",
  description:
    "Explore connected Pull, Push, Legs, and Core skills, find your next progression, and build a path toward your goals. Progress stays on your device.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
