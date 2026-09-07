import type { Metadata } from "next";
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
    default: "Afrocentric Jewelry by LaGlitz — Africa Arising",
    template: "%s · Afrocentric Jewelry by LaGlitz",
  },
  description:
    "Afrocentric Jewelry by LaGlitz — handcrafted beads, gold, cowrie and kente-inspired jewelry from Accra, Ghana. Africa Arising. Shop rings, earrings, necklaces, bracelets, watches, brooches and sets.",
  keywords: [
    "Afrocentric jewelry",
    "Ghana jewelry",
    "LaGlitz",
    "Africa Arising",
    "Accra jewelry",
    "cowrie jewelry",
    "kente jewelry",
    "Ghanaian beads",
    "Charity Kessewaa Frimpong",
  ],
  authors: [{ name: "Afrocentric Jewelry by LaGlitz" }],
  creator: "Afrocentric Jewelry by LaGlitz",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Afrocentric Jewelry by LaGlitz — Africa Arising",
    description:
      "Handcrafted Afrocentric jewelry from Accra, Ghana. Beads, gold, cowrie and kente-inspired designs for the modern African woman.",
    siteName: "Afrocentric Jewelry by LaGlitz",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afrocentric Jewelry by LaGlitz — Africa Arising",
    description:
      "Handcrafted Afrocentric jewelry from Accra, Ghana. Beads, gold, cowrie and kente-inspired designs.",
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
