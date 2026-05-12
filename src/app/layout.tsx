import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GreenCalc - Green Energy Calculator",
    template: "%s | GreenCalc",
  },
  description:
    "Calculate your solar and wind energy potential. Compare equipment, estimate ROI, and plan your green energy system with real-time location-based data.",
  keywords: [
    "solar calculator",
    "wind energy calculator",
    "solar panel comparison",
    "green energy",
    "renewable energy",
    "ROI calculator",
    "solar power",
    "wind power",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
