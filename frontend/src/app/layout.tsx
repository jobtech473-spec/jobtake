import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobtake — The hiring layer for extraordinary careers",
  description:
    "Jobtake is the premium AI-powered recruitment platform. Discover roles at the world's most ambitious teams.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Jobtake — Premium AI Recruitment",
    description:
      "Premium AI-powered recruitment matching senior talent with the world's most ambitious teams.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
