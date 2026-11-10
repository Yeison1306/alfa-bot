'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <span className="text-2xl font-bold text-dark-900 dark:text-white">Alfa Dashboard</span>
      </div>
    </div>
  );
}