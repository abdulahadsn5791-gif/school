'use client';

import { useAuth } from '@ecomerece/frontend';
import { Badge, Button, Card, IconTile, Spinner } from '@ecomerece/ui';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Presentation,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PORTAL_META, PORTAL_ROLES, portalPathForRole } from './lib/portal';

const PORTAL_ICONS = {
  student: BookOpen,
  teacher: Presentation,
  admin: ShieldCheck,
} as const;

const PORTAL_TONES = {
  student: 'accent',
  teacher: 'success',
  admin: 'danger',
} as const;

const FEATURES = [
  {
    icon: Users,
    title: 'Role-based portals',
    description: 'Students, teachers, and admins each land in a workspace built for their job.',
  },
  {
    icon: BarChart3,
    title: 'One account',
    description: 'A single identity across every portal, with roles managed centrally by admins.',
  },
  {
    icon: Bell,
    title: 'Built to be used',
    description: 'An OS-grade design system with light, dark, and frosted-glass themes.',
  },
];

export default function HomePage() {
  const { isInitialized } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1">
        <Hero />
        <Portals />
        <Features />
      </main>
      {!isInitialized && (
        <div className="fixed right-4 bottom-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}

function Hero() {
  const router = useRouter();
  const { user, isSignedIn, isInitialized } = useAuth();

  return (
    <section className="mx-auto max-w-shell px-4 pt-16 pb-14 text-center sm:pt-24">
      <Badge tone="accent" className="mb-5">
        Learning platform
      </Badge>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Everything your school needs, in one place
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-ink-2">
        Ecomerece Academy brings students, teachers, and administrators together — with a portal
        tailored to each role.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {isInitialized && isSignedIn ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(portalPathForRole(user?.role))}
            >
              Go to my {user?.role} portal
            </Button>
            <Button variant="secondary" size="lg" onClick={() => router.push('/account')}>
              My account
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" onClick={() => router.push('/auth/login')}>
            Sign in
          </Button>
        )}
      </div>
    </section>
  );
}

function Portals() {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();

  return (
    <section className="mx-auto max-w-shell px-4 pb-16">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Pick up where you left off
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          {isSignedIn
            ? 'Your role decides which portal opens.'
            : 'Sign in and we will take you to the right portal automatically.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PORTAL_ROLES.map((role) => {
          const meta = PORTAL_META[role];
          const isMine = isSignedIn && user?.role === role;
          return (
            <Card key={role} padding="lg" className="flex flex-col">
              <IconTile icon={PORTAL_ICONS[role]} tone={PORTAL_TONES[role]} size="lg" />
              <div className="mt-4 flex items-center gap-2">
                <p className="text-base font-semibold text-ink">{meta.title}</p>
                {isMine && <Badge tone="accent">Your role</Badge>}
              </div>
              <p className="mt-1 flex-1 text-sm text-ink-3">{meta.tagline}</p>
              <Button
                variant="secondary"
                fullWidth
                className="mt-5"
                onClick={() => router.push(`/portal/${role}`)}
              >
                Open {meta.label} portal
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function Features() {
  const router = useRouter();

  return (
    <section className="border-t border-line/10 bg-surface-1">
      <div className="mx-auto max-w-shell px-4 py-16">
        <div className="mb-8 flex items-center gap-3">
          <GraduationCap className="size-5 text-accent" aria-hidden="true" />
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Why Ecomerece Academy</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} padding="lg">
              <IconTile icon={feature.icon} tone="neutral" />
              <p className="mt-4 text-sm font-semibold text-ink">{feature.title}</p>
              <p className="mt-1 text-sm text-ink-3">{feature.description}</p>
            </Card>
          ))}
        </div>

        <Card
          padding="lg"
          className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <CalendarDays className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Need access?</p>
            <p className="text-sm text-ink-3">
              Accounts are created and managed by an administrator.
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push('/auth/login')}>
            Sign in
          </Button>
        </Card>
      </div>
    </section>
  );
}
