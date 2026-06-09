import type { Metadata, Viewport } from "next"; 
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Friends & Fries Menu",
  description: "Scan, Order, and Enjoy your meal!",
};

export const viewport: Viewport = {
  themeColor: "#ea580c", 
};

// 👇 YE WALA HISSA GAYAB HO GAYA THA TUMHARI FILE SE 👇
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}