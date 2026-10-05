import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme/init-script";
import { CartProvider } from "@/components/cart/cart-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_BASE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "The Boys Store — Smart shopping, simply",
    template: "%s · The Boys Store",
  },
  description:
    "The Boys Store — a modern online marketplace for useful products, trusted services, and standout finds. Shop across electronics, fashion, home, beauty, gadgets, bundles, and more.",
  keywords: [
    "quality goods",
    "online marketplace",
    "The Boys Store",
    "Smart shopping, simply",
    "Ghana marketplace",
    "smart shopping",
    "quality products",
    "everyday essentials",
    "Joshua Nasi Words",
  ],
  authors: [{ name: "The Boys Store" }],
  creator: "The Boys Store",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "The Boys Store — Smart shopping, simply",
    description:
      "A polished marketplace for products and services that make everyday life simpler, better, and more connected.",
    siteName: "The Boys Store",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Boys Store — Smart shopping, simply",
    description:
      "Shop useful products, standout finds, and trusted services from The Boys Store.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body
        className={`${geistSans.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
