'use client';

import { Button, Card } from '@ecomerece/ui';
import { Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-3">
          <Compass className="size-6 text-ink-3" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-ink">Page not found</h1>
        <p className="mt-1 text-sm text-ink-3">
          That address doesn&apos;t match anything in this app. It may have been renamed, or the
          link may be out of date.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="primary" onClick={() => router.push('/')}>
            Go to home
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </Card>
    </div>
  );
}
