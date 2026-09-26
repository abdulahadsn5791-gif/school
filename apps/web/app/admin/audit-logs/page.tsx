'use client';

import { useGetAuditLogsByActor, useGetAuditLogsByEntity } from '@ecomerece/frontend';
import { Badge, Button, Field, Input, Select } from '@ecomerece/ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

type Mode = 'actor' | 'entity';

export default function AdminAuditLogsPage() {
  const [mode, setMode] = useState<Mode>('actor');
  const [actorId, setActorId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [submitted, setSubmitted] = useState<{
    mode: Mode;
    actorId: string;
    entityType: string;
    entityId: string;
  } | null>(null);

  const byActor = useGetAuditLogsByActor(submitted?.mode === 'actor' ? submitted.actorId : '', 50);
  const byEntity = useGetAuditLogsByEntity(
    submitted?.mode === 'entity' ? submitted.entityType : '',
    submitted?.mode === 'entity' ? submitted.entityId : '',
    50,
  );

  const active = submitted?.mode === 'entity' ? byEntity : byActor;
  const rows = active.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Audit logs</h1>
        <p className="mt-1 text-sm text-ink-3">
          Read-only trail, newest first. Query by actor or by entity.
        </p>
      </header>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted({ mode, actorId, entityType, entityId });
        }}
      >
        <div className="sm:w-36">
          <Field label="Search by">
            <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="actor">Actor</option>
              <option value="entity">Entity</option>
            </Select>
          </Field>
        </div>
        {mode === 'actor' ? (
          <div className="flex-1">
            <Field label="Actor user ID">
              <Input
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                placeholder="UUID"
                required
              />
            </Field>
          </div>
        ) : (
          <>
            <div className="sm:w-40">
              <Field label="Entity type">
                <Input
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  placeholder="school / class / …"
                  required
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Entity ID">
                <Input
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="UUID"
                  required
                />
              </Field>
            </div>
          </>
        )}
        <Button variant="primary" type="submit" className="mb-0.5">
          <Search className="size-4" /> Query
        </Button>
      </form>

      {active.isFetching && <p className="mt-4 text-sm text-ink-3">Loading…</p>}
      {active.isError && (
        <p className="mt-4 text-sm text-danger">{(active.error as Error)?.message}</p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line/10">
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">When</th>
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">Action</th>
                  <th className="px-3 py-2 text-xs font-medium text-ink-3">Entity</th>
                  <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                    Actor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/5">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-3">
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-ink-2">
                      {new Date(row.at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone="neutral">{row.action}</Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-ink-2">
                      {row.entityType}:{row.entityId.slice(0, 8)}…
                    </td>
                    <td className="hidden px-3 py-2 font-mono text-xs text-ink-2 md:table-cell">
                      {row.actorId?.slice(0, 8) ?? '—'}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {submitted && !active.isFetching && rows.length === 0 && !active.isError && (
        <p className="mt-4 text-sm text-ink-3">No audit entries found.</p>
      )}
    </div>
  );
}
