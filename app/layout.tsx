import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Don’t Press That! | Multiplayer Chaos",
  description: "A colorful real-time party game for 2–8 friends. One shared spaceship. Too many captains.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
