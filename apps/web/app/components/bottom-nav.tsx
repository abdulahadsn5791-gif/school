'use client';

import { useAuth } from '@ecomerece/frontend';
import { cn } from '@ecomerece/ui';
import { GraduationCap, House, Layers, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portalPathForRole } from '../lib/portal';

export function BottomNav() {
  const pathname = usePathname();
  const { user, isSignedIn } = useAuth();

  const items = [
    { href: '/', label: 'Home', icon: House, active: pathname === '/' },
    {
      href: isSignedIn ? portalPathForRole(user?.role) : '/auth/login',
      label: 'Portal',
      icon: GraduationCap,
      active: pathname.startsWith('/portal'),
    },
    {
      href: '/account',
      label: 'Account',
      icon: UserRound,
      active: pathname.startsWith('/account'),
    },
    { href: '/ui', label: 'UI', icon: Layers, active: pathname.startsWith('/ui') },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-chrome border-t border-line/10 bg-surface-1/95 glass:glass-surface"
    >
      <div className="mx-auto flex max-w-shell items-center justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-lg px-3 text-[10px] font-medium transition-colors',
                item.active ? 'text-accent' : 'text-ink-3 hover:text-ink',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
