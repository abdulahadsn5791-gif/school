'use client';

import { useAuth, useTeacherContext } from '@ecomerece/frontend';
import { Badge, Button, Card, EmptyState, ErrorState, IconTile, Spinner } from '@ecomerece/ui';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TEACHER_SECTION_ICONS, TEACHER_SECTIONS } from '../../lib/portal';

export default function TeacherHomePage() {
  const { user, isSignedIn, isInitialized } = useAuth();
  const { classes, hasClasses, isLoading, isError, error, refetch } = useTeacherContext();
  const router = useRouter();

  if (!isInitialized || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-3">Welcome back, {user?.fullName ?? 'there'}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Teacher portal</h1>
          <p className="mt-1 text-sm text-ink-2">Classes, timetable, grading, and attendance.</p>
        </div>
        <Badge tone="accent" className="capitalize">
          {user?.role}
        </Badge>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEACHER_SECTIONS.map((section) => {
          const SectionIcon = TEACHER_SECTION_ICONS[section.icon];
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card padding="lg" className="h-full transition-colors group-hover:bg-surface-2">
                <IconTile icon={SectionIcon} tone="accent" />
                <p className="mt-4 text-sm font-semibold text-ink">{section.title}</p>
                <p className="mt-1 text-sm text-ink-3">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        {isLoading && !hasClasses && (
          <Card padding="lg" className="flex items-center gap-3">
            <Spinner />
            <span className="text-sm text-ink-3">Loading your classes…</span>
          </Card>
        )}

        {isError && (
          <ErrorState
            title="Could not load your classes"
            description={error?.message ?? 'Please try again.'}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && !hasClasses && (
          <EmptyState
            icon={GraduationCap}
            title="No classes assigned yet"
            description="You are not the class teacher of any class. An administrator needs to assign you before attendance, assignments, and grading become available."
          />
        )}

        {hasClasses && (
          <Card padding="lg">
            <p className="text-sm font-medium text-ink">
              You teach {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </p>
            <ul className="mt-2 space-y-1">
              {classes.map((clazz) => (
                <li key={clazz.id} className="text-sm text-ink-3">
                  <span className="font-medium text-ink-2">{clazz.name}</span> · {clazz.grade}
                  {clazz.section} · {clazz.academicYear}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card
        padding="lg"
        className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Manage your account</p>
          <p className="text-sm text-ink-3">Update your profile, switch theme, or sign out.</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/account')}>
          Account &amp; settings
        </Button>
      </Card>
    </div>
  );
}
