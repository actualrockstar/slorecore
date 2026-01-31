import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next"

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
      <body
        className={`${silkscreen.className} antialiased`}
      >
        <Analytics/>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-10"
        >
          <source src="https://urbosdur9qrkencr.public.blob.vercel-storage.com/web-edit.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {children}
        <a href="https://discord.gg/MWUyFsMBg3"><Image
          className="fixed right-5 bottom-5 dark:invert"
          src="/slorecore logo trans.png"
          alt="Slores Logo"
          width={200}
          height={38}
          priority
        /></a>
        
      </body>
    </html>
  );
}
