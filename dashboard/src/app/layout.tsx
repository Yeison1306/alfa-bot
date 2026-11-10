import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Alfa Dashboard',
  description: 'Dashboard privado para gestionar proyectos con Alfa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-100`}>
        {children}
      </body>
    </html>
  );
}