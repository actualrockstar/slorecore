import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import LayoutClientWrapper from "./components/LayoutClientWrapper";

const silkscreen = Silkscreen({
  weight: ['400', '700'],  // Silkscreen has regular (400) and bold (700)
  subsets: ['latin'] 
});


export const metadata: Metadata = {
  title: "The  Slores",
  description: "Offical website for Mareko and the Slores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Analytics/>
        <LayoutClientWrapper silkscreenClass={silkscreen.className}>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
