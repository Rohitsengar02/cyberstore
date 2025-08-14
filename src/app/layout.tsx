
import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/client-providers";
import MobileNavWrapper from "@/components/mobile-nav-wrapper";

export const metadata: Metadata = {
  title: "NoirCart",
  description: "A sleek e-commerce landing page to showcase a variety of products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <ClientProviders>
          {children}
          <MobileNavWrapper />
        </ClientProviders>
      </body>
    </html>
  );
}
