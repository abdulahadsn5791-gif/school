'use client';

import { useGetSessions, useRevokeAllSessions, useRevokeSession } from '@ecomerece/frontend';
import type { SessionResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input } from '@ecomerece/ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function AdminSessionsPage() {
  const [userIdInput, setUserIdInput] = useState('');
  const [userId, setUserId] = useState('');

  const list = useGetSessions({ userId });
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();

  const rows = list.data?.data ?? [];
  const busy = revokeSession.isPending || revokeAll.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sessions</h1>
        <p className="mt-1 text-sm text-ink-3">
          Refresh tokens per user. Revoking forces re-authentication on that device.
        </p>
      </header>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setUserId(userIdInput.trim());
        }}
      >
        <div className="flex-1">
          <Field label="User ID">
            <Input
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="UUID"
              required
            />
          </Field>
        </div>
        <Button variant="primary" type="submit" className="mb-0.5">
          <Search className="size-4" /> Load
        </Button>
        {userId && (
          <Button
            variant="destructive"
            className="mb-0.5"
            disabled={busy}
            isLoading={revokeAll.isPending}
            onClick={() => revokeAll.mutate(userId)}
          >
            Revoke all
          </Button>
        )}
      </form>

      {rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line/10">
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">Device</th>
                  <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                    IP
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">Expires</th>
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">State</th>
                  <th className="px-3 py-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/5">
                {rows.map((row: SessionResponseDto) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-3">
                    <td className="max-w-64 truncate px-3 py-2 text-sm text-ink-2">
                      {row.userAgent ?? 'Unknown device'}
                    </td>
                    <td className="hidden px-3 py-2 font-mono text-xs text-ink-2 md:table-cell">
                      {row.ip ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-ink-2">
                      {new Date(row.expiresAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {row.revokedAt ? (
                        <Badge tone="danger">Revoked</Badge>
                      ) : row.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="warning">Expired</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.isActive && !row.revokedAt && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            revokeSession.mutate(
                              { sessionId: row.id },
                              { onSuccess: () => list.refetch() },
                            )
                          }
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {list.isError && <p className="mt-4 text-sm text-danger">{(list.error as Error)?.message}</p>}
      {userId && !list.isFetching && rows.length === 0 && !list.isError && (
        <p className="mt-4 text-sm text-ink-3">No sessions for this user.</p>
      )}
    </div>
  );
}
