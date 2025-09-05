import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Supabase + Next.js App',
  description: 'Full RLS-enabled system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
