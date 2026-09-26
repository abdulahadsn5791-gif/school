'use client';

import { useAuth } from '@ecomerece/frontend';
import { Badge, Button, Card, IconTile, Spinner } from '@ecomerece/ui';
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { isPortalRole, PORTAL_META, portalPathForRole } from '../../lib/portal';

interface PortalCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PORTAL_CARDS: Record<string, PortalCard[]> = {
  student: [
    { icon: BookOpen, title: 'My courses', description: 'Enrolled classes and materials.' },
    { icon: ClipboardList, title: 'Assignments', description: 'What is due and what is done.' },
    { icon: BarChart3, title: 'Grades', description: 'Results and progress over time.' },
    { icon: CalendarDays, title: 'Timetable', description: 'Your weekly schedule.' },
  ],
  // `teacher` has its own static route at app/portal/teacher, which shadows this
  // dynamic segment. Do not add a teacher entry here — it would be unreachable.
  admin: [
    { icon: Users, title: 'People', description: 'Every account on the platform.' },
    { icon: ShieldCheck, title: 'Moderation', description: 'Blocks, bans, and recovery.' },
    { icon: BadgeCheck, title: 'Roles', description: 'Assign and review permissions.' },
    { icon: Settings, title: 'Settings', description: 'Platform-wide configuration.' },
  ],
};

export default function PortalPage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const { user, isSignedIn, isInitialized } = useAuth();
  const role = params?.role;

  const valid = isPortalRole(role);

  useEffect(() => {
    if (isInitialized && !isSignedIn) router.replace('/auth/login');
  }, [isInitialized, isSignedIn, router]);

  if (!isInitialized || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (!valid) {
    return (
      <PortalFrame>
        <Card padding="lg" className="mx-auto max-w-md text-center">
          <h1 className="text-lg font-semibold text-ink">Unknown portal</h1>
          <p className="mt-1 text-sm text-ink-3">
            There is no portal for “{role}”. Choose one of the available portals.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/')}>
            Back to home
          </Button>
        </Card>
      </PortalFrame>
    );
  }

  const canView = user?.role === role || user?.role === 'admin';

  if (!canView) {
    return (
      <PortalFrame>
        <Card padding="lg" className="mx-auto max-w-md text-center">
          <h1 className="text-lg font-semibold text-ink">You don&apos;t have access</h1>
          <p className="mt-1 text-sm text-ink-3">
            This is the {PORTAL_META[role].title.toLowerCase()}. Your account is a{' '}
            {user?.role ?? 'guest'}.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push(portalPathForRole(user?.role))}
          >
            Go to my portal
          </Button>
        </Card>
      </PortalFrame>
    );
  }

  const meta = PORTAL_META[role];
  const cards = PORTAL_CARDS[role] ?? [];

  return (
    <PortalFrame>
      <div className="mx-auto max-w-shell px-4 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-3">Welcome back, {user?.fullName ?? 'there'}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">{meta.title}</h1>
            <p className="mt-1 text-sm text-ink-2">{meta.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="accent" className="capitalize">
              {role}
            </Badge>
            {user?.role === 'admin' && user?.role !== role && (
              <Badge tone="neutral">Admin preview</Badge>
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} padding="lg">
              <IconTile icon={card.icon} tone="accent" />
              <p className="mt-4 text-sm font-semibold text-ink">{card.title}</p>
              <p className="mt-1 text-sm text-ink-3">{card.description}</p>
            </Card>
          ))}
        </div>

        <Card
          padding="lg"
          className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Manage your account</p>
            <p className="text-sm text-ink-3">
              Update your profile, switch theme, or toggle the frosted-glass effect.
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/account')}>
            Account &amp; settings
          </Button>
        </Card>
      </div>
    </PortalFrame>
  );
}

function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1">{children}</main>
    </div>
  );
}
