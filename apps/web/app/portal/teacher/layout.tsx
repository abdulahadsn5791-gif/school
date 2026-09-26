'use client';

import { useAuth } from '@ecomerece/frontend';
import { Button, Card, IconTile, Spinner } from '@ecomerece/ui';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { TEACHER_SECTION_ICONS, TEACHER_SECTIONS } from '../../lib/portal';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  if (!isInitialized || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <Card padding="lg" className="mx-auto max-w-md text-center">
          <IconTile icon={ShieldCheck} tone="danger" className="mx-auto" />
          <h1 className="mt-4 text-lg font-semibold text-ink">Teachers only</h1>
          <p className="mt-1 text-sm text-ink-3">
            Your account role is {user?.role ?? 'unknown'}. Ask an administrator to assign the
            teacher role.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/account')}>
            Back to my account
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas md:flex-row">
      <aside className="shrink-0 border-b border-line/10 bg-surface-1 md:h-dvh md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Teacher portal</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{user?.fullName}</p>
        </div>
        <nav aria-label="Teacher sections" className="space-y-0.5 px-2 pb-3 md:pb-6">
          {TEACHER_SECTIONS.map((section) => {
            const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
            const SectionIcon = TEACHER_SECTION_ICONS[section.icon];
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm transition-all duration-200 ease-spring ${
                  active
                    ? 'bg-surface-3 font-medium text-ink'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <SectionIcon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{section.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 md:h-dvh md:overflow-y-auto">{children}</div>
    </div>
  );
}
