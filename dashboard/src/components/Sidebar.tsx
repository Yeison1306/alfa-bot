'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderPlus, MessageSquare, Settings, LogOut, ChevronLeft, X, Menu, User, Bell, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Proyectos', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat con Alfa', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Nuevo Proyecto', href: '/dashboard/projects/new', icon: FolderPlus },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static z-50 h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-dark-200 dark:border-dark-700', collapsed && 'justify-center')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-semibold text-lg text-dark-900 dark:text-white">Alfa Dashboard</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800', collapsed && 'mx-auto')}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Navegación principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer with user info */}
        <div className={cn('p-4 border-t border-dark-200 dark:border-dark-700', collapsed && 'hidden')}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 dark:text-white truncate">Usuario</p>
              <p className="text-xs text-dark-400 dark:text-dark-500 truncate">usuario@ejemplo.com</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="flex-1 px-3 py-2 text-sm bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-700">
              <Settings className="h-4 w-4 mr-2 inline" /> Configuración
            </button>
            <button className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <LogOut className="h-4 w-4 mr-2 inline" /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary-500 text-white rounded-full shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
}