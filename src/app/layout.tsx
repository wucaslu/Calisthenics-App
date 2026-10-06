import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
