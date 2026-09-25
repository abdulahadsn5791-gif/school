'use client';

import { HttpError, useAuth, useLogin } from '@ecomerece/frontend';
import { loginUserDto } from '@ecomerece/shared';
import { Banner, Button, Field, Input } from '@ecomerece/ui';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { portalPathForRole } from '../../lib/portal';
import { AuthShell } from '../auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) router.replace(portalPathForRole(user?.role));
  }, [isSignedIn, user?.role, router]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const parsed = loginUserDto.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0] ?? 'form')] = issue.message;
      }
      setErrors(next);
      return;
    }

    login.mutate(parsed.data, {
      onSuccess: (session) => router.replace(portalPathForRole(session.user.role)),
      onError: (error) => {
        if (error instanceof HttpError && error.issues?.length) {
          const next: Record<string, string> = {};
          for (const issue of error.issues) next[issue.field] = issue.message;
          setErrors(next);
        } else {
          setFormError(error instanceof Error ? error.message : 'Unable to sign in.');
        }
      },
    });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <Banner tone="danger" title={formError} />}

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            type="password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={login.isPending}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
