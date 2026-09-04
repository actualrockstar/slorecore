"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function LayoutClientWrapper({
  children,
  silkscreenClass,
}: {
  children: React.ReactNode;
  silkscreenClass: string;
}) {
  const pathname = usePathname();
  const isAnomaly = pathname === "/anomaly" || pathname?.startsWith("/anomaly/");
  const isElywyd = pathname === "/elywyd" || pathname?.startsWith("/elywyd/");

  // The ELYWYD experience is fully self-contained (its own fixed-position
  // black stage). Render it without any of the site's normal chrome:
  // no video background, no Silkscreen wrapper, no Discord logo.
  if (isElywyd) {
    return <>{children}</>;
  }

  if (isAnomaly) {
    return (
      <div className="min-h-screen w-full bg-[#030303] text-gray-200 overflow-x-hidden selection:bg-red-900 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className={`${silkscreenClass} antialiased`}>
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
      <a href="https://discord.gg/MWUyFsMBg3">
        <Image
          className="fixed right-5 bottom-5 dark:invert"
          src="/slorecore logo trans.png"
          alt="Slores Logo"
          width={150}
          height={38}
          priority
        />
      </a>
    </div>
  );
}
