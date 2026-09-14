import type { Metadata, Viewport } from "next";
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
      <body className="min-h-screen bg-night-950 text-slate-100 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}