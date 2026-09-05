import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme/init-script";
import { CartProvider } from "@/components/cart/cart-provider";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://la-glitz.vercel.app"),
  title: {
    default: "LA GLITZ — Fine Jewelry from Accra, Ghana",
    template: "%s · LA GLITZ",
  },
  description:
    "LA GLITZ is a premium Ghanaian jewelry house crafting fine rings, earrings, necklaces, and bracelets. Shop authentic gold and gemstone pieces, delivered across Ghana.",
  keywords: [
    "Ghana jewelry",
    "Accra jewelry",
    "fine jewelry Ghana",
    "gold rings Ghana",
    "LA GLITZ",
    "Ghanaian jewelry store",
    "engagement rings Accra",
  ],
  authors: [{ name: "LA GLITZ" }],
  creator: "LA GLITZ",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "LA GLITZ — Fine Jewelry from Accra, Ghana",
    description:
      "Premium Ghanaian jewelry house. Shop fine rings, earrings, necklaces and bracelets crafted in Accra.",
    url: "https://la-glitz.vercel.app",
    siteName: "LA GLITZ",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "LA GLITZ — Fine Jewelry from Accra, Ghana",
    description:
      "Premium Ghanaian jewelry house. Shop fine rings, earrings, necklaces and bracelets crafted in Accra.",
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
      <body
        className={`${geistSans.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
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
