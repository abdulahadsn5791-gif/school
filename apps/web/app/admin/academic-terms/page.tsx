'use client';

import {
  useCreateAcademicTerm,
  useGetAcademicTerms,
  useGetSchools,
  useSoftDeleteAcademicTerm,
  useUpdateAcademicTerm,
} from '@ecomerece/frontend';
import type { AcademicTermResponseDto, GetAcademicTermsType } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminAcademicTermsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AcademicTermResponseDto | null>(null);
  const [deleting, setDeleting] = useState<AcademicTermResponseDto | null>(null);

  const params: GetAcademicTermsType = { cursor, limit: PAGE_SIZE, direction: 'next' };
  const list = useGetAcademicTerms(params);
  const createTerm = useCreateAcademicTerm();
  const updateTerm = useUpdateAcademicTerm();
  const softDeleteTerm = useSoftDeleteAcademicTerm();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createTerm.isPending || updateTerm.isPending || softDeleteTerm.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Academic terms</h1>
          <p className="mt-1 text-sm text-ink-3">
            Terms per school and year. Marking one current unmarks its peers.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New term
        </Button>
      </header>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Year</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Dates
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No terms yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.name}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.academicYear}</td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {new Date(row.startDate).toLocaleDateString()} –{' '}
                    {new Date(row.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {row.isDeleted ? (
                      <Badge tone="danger">Deleted</Badge>
                    ) : row.isCurrent ? (
                      <Badge tone="accent">Current</Badge>
                    ) : (
                      <Badge tone="neutral">Scheduled</Badge>
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
        title={editing ? 'Edit term' : 'New term'}
      >
        <TermForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete term?">
        <p className="text-sm text-ink-2">
          {deleting ? `${deleting.name} (${deleting.academicYear}) will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteTerm.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteTerm.mutate(
                { academicTermId: deleting.id, reason: 'Deleted from admin console' },
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

function TermForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: AcademicTermResponseDto | null;
  onDone: () => void;
}) {
  const createTerm = useCreateAcademicTerm();
  const updateTerm = useUpdateAcademicTerm();
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    academicYear: initial?.academicYear ?? '',
    name: initial?.name ?? '',
    startDate: initial ? new Date(initial.startDate).toISOString().slice(0, 10) : '',
    endDate: initial ? new Date(initial.endDate).toISOString().slice(0, 10) : '',
    isCurrent: initial?.isCurrent ?? false,
  });
  const pending = createTerm.isPending || updateTerm.isPending;
  const error = createTerm.error ?? updateTerm.error;

  // Schools come from the engine's list (new.md §10) — no pasted UUIDs.
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = schools.data?.data ?? [];

  const submit = () => {
    if (mode === 'create') {
      createTerm.mutate(
        {
          schoolId: form.schoolId,
          academicYear: form.academicYear,
          name: form.name,
          startDate: new Date(form.startDate),
          endDate: new Date(form.endDate),
          isCurrent: form.isCurrent || undefined,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateTerm.mutate(
        {
          academicTermId: initial.id,
          name: form.name !== initial.name ? form.name : undefined,
          isCurrent: form.isCurrent !== initial.isCurrent ? form.isCurrent : undefined,
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
        <>
          <Field label="School">
            <Select
              value={form.schoolId}
              onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
              required
            >
              <option value="">{schools.isLoading ? 'Loading schools…' : 'Select a school'}</option>
              {schoolOptions.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Academic year" hint="Format 2026-2027">
            <Input
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              placeholder="2026-2027"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                required
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
            />
            Mark as current term
          </label>
        </>
      )}
      {mode === 'edit' && (
        <>
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
            />
            Current term
          </label>
        </>
      )}
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create term' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
