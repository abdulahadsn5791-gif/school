'use client';

import {
  useCreateSchool,
  useGetSchools,
  useSoftDeleteSchool,
  useUpdateSchool,
} from '@ecomerece/frontend';
import type { GetSchoolsType, SchoolResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminSchoolsPage() {
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SchoolResponseDto | null>(null);
  const [deleting, setDeleting] = useState<SchoolResponseDto | null>(null);

  const params: GetSchoolsType = {
    search: search.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetSchools(params);
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const softDeleteSchool = useSoftDeleteSchool();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createSchool.isPending || updateSchool.isPending || softDeleteSchool.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Schools</h1>
          <p className="mt-1 text-sm text-ink-3">Every school on the platform.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New school
        </Button>
      </header>

      <div className="mt-4">
        <Input
          icon={Search}
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursor(undefined);
          }}
          aria-label="Search schools"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 sm:table-cell">
                  Code
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Email
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 lg:table-cell">
                  Phone
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No schools yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.name}</td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    <Badge tone="neutral">{row.code}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {row.email ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 lg:table-cell">
                    {row.phone ?? '—'}
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
        title={editing ? 'Edit school' : 'New school'}
      >
        <SchoolForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete school?">
        <p className="text-sm text-ink-2">
          {deleting
            ? `${deleting.name} (${deleting.code}) will be soft-deleted and hidden from lists.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteSchool.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteSchool.mutate(
                { schoolId: deleting.id, reason: 'Deleted from admin console' },
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

function SchoolForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: SchoolResponseDto | null;
  onDone: () => void;
}) {
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
  });
  const pending = createSchool.isPending || updateSchool.isPending;
  const error = createSchool.error ?? updateSchool.error;

  const submit = () => {
    if (mode === 'create') {
      createSchool.mutate(
        {
          name: form.name,
          code: form.code,
          address: form.address || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateSchool.mutate(
        {
          schoolId: initial.id,
          name: form.name || undefined,
          address: form.address || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
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
      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          disabled={mode === 'edit'}
        />
      </Field>
      <Field label="Code">
        <Input
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          required
          disabled={mode === 'edit'}
        />
      </Field>
      <Field label="Address">
        <Input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create school' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
