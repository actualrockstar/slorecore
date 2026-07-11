import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "THE ANOMALY",
  description: "CLASSIFIED TRANSMISSION - DO NOT SHARE",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnomalyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
