'use client';

import {
  useCreateGuardian,
  useGetGuardians,
  useSoftDeleteGuardian,
  useUpdateGuardian,
} from '@ecomerece/frontend';
import type { GetGuardiansType, GuardianResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminGuardiansPage() {
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GuardianResponseDto | null>(null);
  const [deleting, setDeleting] = useState<GuardianResponseDto | null>(null);

  const params: GetGuardiansType = {
    search: search.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetGuardians(params);
  const createGuardian = useCreateGuardian();
  const updateGuardian = useUpdateGuardian();
  const softDeleteGuardian = useSoftDeleteGuardian();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createGuardian.isPending || updateGuardian.isPending || softDeleteGuardian.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Guardians</h1>
          <p className="mt-1 text-sm text-ink-3">Parents and guardians linked to students.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New guardian
        </Button>
      </header>

      <div className="mt-4">
        <Input
          icon={Search}
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursor(undefined);
          }}
          aria-label="Search guardians"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Phone</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 sm:table-cell">
                  Email
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Occupation
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No guardians yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.name.fullName}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.phone}</td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 sm:table-cell">
                    {row.email ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {row.occupation ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    {row.isDeleted ? (
                      <Badge tone="danger">Deleted</Badge>
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => setDeleting(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {list.isError && <p className="mt-3 text-sm text-danger">{(list.error as Error)?.message}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta?.prevCursor}
          onClick={() => setCursor(meta?.prevCursor ?? undefined)}
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta?.hasMore}
          onClick={() => setCursor(meta?.nextCursor ?? undefined)}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Edit guardian' : 'New guardian'}
      >
        <GuardianForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete guardian?">
        <p className="text-sm text-ink-2">
          {deleting ? `${deleting.name.fullName} (${deleting.phone}) will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteGuardian.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteGuardian.mutate(
                { guardianId: deleting.id, reason: 'Deleted from admin console' },
                { onSuccess: () => setDeleting(null) },
              );
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function GuardianForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: GuardianResponseDto | null;
  onDone: () => void;
}) {
  const createGuardian = useCreateGuardian();
  const updateGuardian = useUpdateGuardian();
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    firstName: initial?.name.firstName ?? '',
    middleName: initial?.name.middleName ?? '',
    lastName: initial?.name.lastName ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    occupation: initial?.occupation ?? '',
  });
  const pending = createGuardian.isPending || updateGuardian.isPending;
  const error = createGuardian.error ?? updateGuardian.error;

  const submit = () => {
    const name = {
      firstName: form.firstName,
      middleName: form.middleName || undefined,
      lastName: form.lastName || undefined,
    };
    if (mode === 'create') {
      createGuardian.mutate(
        {
          schoolId: form.schoolId,
          name,
          phone: form.phone,
          email: form.email || undefined,
          occupation: form.occupation || undefined,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateGuardian.mutate(
        {
          guardianId: initial.id,
          name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          occupation: form.occupation || undefined,
        },
        { onSuccess: onDone },
      );
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {mode === 'create' && (
        <Field label="School ID" hint="UUID of the school">
          <Input
            value={form.schoolId}
            onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
            required
          />
        </Field>
      )}
      <div className="grid grid-cols-3 gap-3">
        <Field label="First name">
          <Input
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
        </Field>
        <Field label="Middle name">
          <Input
            value={form.middleName}
            onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
          />
        </Field>
        <Field label="Last name">
          <Input
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          required
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </Field>
      <Field label="Occupation">
        <Input
          value={form.occupation}
          onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create guardian' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
