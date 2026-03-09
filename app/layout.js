import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Job Application Tracker',
  description: 'Track your job applications and manage interviews',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
