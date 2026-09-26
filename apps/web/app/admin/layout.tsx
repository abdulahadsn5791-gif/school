'use client';

import { useAuth } from '@ecomerece/frontend';
import { Button, Card, IconTile, Spinner } from '@ecomerece/ui';
import {
  Banknote,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  type LucideIcon,
  School as SchoolIcon,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Schools', href: '/admin/schools', icon: SchoolIcon },
  { label: 'Academic terms', href: '/admin/academic-terms', icon: CalendarDays },
  { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Periods', href: '/admin/periods', icon: ClipboardList },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Guardians', href: '/admin/guardians', icon: UserCog },
  { label: 'Enrollments', href: '/admin/enrollments', icon: ClipboardCheck },
  { label: 'Timetable', href: '/admin/timetable', icon: Settings },
  { label: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Fees', href: '/admin/fees', icon: Wallet },
  { label: 'Notices', href: '/admin/notices', icon: Bell },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Leaves', href: '/admin/leaves', icon: FileText },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Student tests', href: '/admin/student-tests', icon: ScrollText },
  { label: 'Audit logs', href: '/admin/audit-logs', icon: ScrollText },
  { label: 'Sessions', href: '/admin/sessions', icon: ShieldCheck },
  { label: 'Billing', href: '/admin/billing', icon: Banknote },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  if (!isInitialized || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <Card padding="lg" className="mx-auto max-w-md text-center">
          <IconTile icon={ShieldCheck} tone="danger" className="mx-auto" />
          <h1 className="mt-4 text-lg font-semibold text-ink">Admins only</h1>
          <p className="mt-1 text-sm text-ink-3">
            Your account role is {user?.role ?? 'unknown'}. Ask an administrator for access.
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
          <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Admin console</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{user.fullName}</p>
        </div>
        <nav aria-label="Admin sections" className="space-y-0.5 px-2 pb-3 md:pb-6">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm transition-all duration-200 ease-spring ${
                  active
                    ? 'bg-surface-3 font-medium text-ink'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 md:h-dvh md:overflow-y-auto">{children}</div>
    </div>
  );
}
