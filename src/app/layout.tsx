import type { Metadata, Viewport } from "next";
import Script from "next/script";
import DebugErrorBanner from "@/components/DebugErrorBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Konum Paylaşım | Gerçek Zamanlı Konum Paylaşma",
  description:
    "WhatsApp tarzı, gerçek zamanlı ve onaya dayalı konum paylaşım uygulaması.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0f1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        {/* Leaflet is loaded as a plain global script/stylesheet (not a
            bundled npm import) so the map never depends on a webpack
            code-split chunk that could fail to load. */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-night-950 text-slate-100 antialiased">
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          strategy="beforeInteractive"
          crossOrigin=""
        />
        <DebugErrorBanner />
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}