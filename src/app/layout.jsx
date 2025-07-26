import './globals.css';

export const metadata = {
  title: 'CareSight',
  description: 'Full RLS-enabled system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
