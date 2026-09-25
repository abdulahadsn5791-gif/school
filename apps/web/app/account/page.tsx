'use client';

import { useAuth, useLogout, useProfileManager } from '@ecomerece/frontend';
import {
  Avatar,
  Badge,
  Button,
  Card,
  GroupedList,
  ListHeader,
  ListRow,
  Spinner,
} from '@ecomerece/ui';
import { CalendarDays, Clock, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemePreferences } from '../components/theme-controls';

export default function AccountPage() {
  const router = useRouter();
  const { isSignedIn, isInitialized } = useAuth();

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

  return <AccountContent />;
}

function AccountContent() {
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const logout = useLogout();
  const { user, isLoading, error, formatDate } = useProfileManager();
  const profile = user ?? sessionUser;

  const signOut = () => {
    logout.mutate(undefined, { onSuccess: () => router.replace('/') });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Account &amp; settings</h1>
        <p className="mt-1 text-sm text-ink-3">Your profile, appearance, and session.</p>

        <Card padding="lg" className="mt-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar size="xl" name={profile?.fullName} src={profile?.avatar?.url ?? undefined} />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-ink">
                {profile?.fullName ?? 'Your account'}
              </p>
              {profile?.email && <p className="truncate text-sm text-ink-3">{profile.email}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {profile?.role && (
                  <Badge tone="accent" className="capitalize">
                    {profile.role}
                  </Badge>
                )}
                {profile?.isBanned && <Badge tone="danger">Banned</Badge>}
                {profile?.isBlocked && <Badge tone="danger">Blocked</Badge>}
                {profile?.isDeleted && <Badge tone="neutral">Deleted</Badge>}
              </div>
            </div>
            <Button
              variant="secondary"
              isLoading={logout.isPending}
              loadingText="Signing out…"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </Card>

        <section className="mt-8">
          <ListHeader title="Profile" trailing={isLoading ? 'Refreshing…' : undefined} />
          <GroupedList>
            <ListRow
              icon={UserRound}
              title="Full name"
              trailing={<span className="text-sm text-ink-2">{profile?.fullName ?? '—'}</span>}
            />
            <ListRow
              icon={Mail}
              title="Email"
              trailing={
                <span className="max-w-[45vw] truncate text-sm text-ink-2">
                  {profile?.email ?? '—'}
                </span>
              }
            />
            <ListRow
              icon={ShieldCheck}
              title="Role"
              trailing={
                <span className="text-sm capitalize text-ink-2">{profile?.role ?? '—'}</span>
              }
            />
            <ListRow
              icon={CalendarDays}
              title="Member since"
              trailing={
                <span className="text-sm text-ink-2">{formatDate(profile?.createdAt)}</span>
              }
            />
            <ListRow
              icon={Clock}
              title="Last login"
              trailing={
                <span className="text-sm text-ink-2">{formatDate(profile?.lastLogin)}</span>
              }
            />
          </GroupedList>
          {error && (
            <p className="mt-2 px-1 text-xs text-danger">
              {error instanceof Error ? error.message : 'Could not load profile.'}
            </p>
          )}
        </section>

        <section className="mt-8">
          <ListHeader title="Appearance" />
          <Card padding="lg">
            <ThemePreferences />
          </Card>
        </section>
      </main>
    </div>
  );
}
