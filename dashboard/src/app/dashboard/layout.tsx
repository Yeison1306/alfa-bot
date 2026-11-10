'use client';

import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex">
      <Sidebar />
      <div className={cn('flex-1 lg:ml-64 transition-all duration-300', 'min-h-screen')}>
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm border-b border-dark-200 dark:border-dark-700">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}