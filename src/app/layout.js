import './globals.css';

export const metadata = {
  title: 'CareSight – Empowering Care for Ventilated Patients',
  description:
    'CareSight is a connected care platform designed for hospitals, ventilated patients, and nursing staff. Monitor patient data, medication, and communication all in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
