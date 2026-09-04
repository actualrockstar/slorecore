import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Everybody Loves You When You're Dead",
  description:
    "A fictional posthumous attention simulator. See how much everyone loves you after you're gone.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ElywydLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
