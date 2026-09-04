import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Get To The Show | The Slores',
  description: 'Help the band collect their gear and get to the show! An arcade runner game by The Slores.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function GetToTheShowLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
