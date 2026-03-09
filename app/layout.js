import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Job Application Tracker',
  description: 'Track your job applications and manage interviews',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
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
