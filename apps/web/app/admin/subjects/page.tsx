'use client';

import {
  useCreateSubject,
  useGetSchools,
  useGetSubjects,
  useSoftDeleteSubject,
  useUpdateSubject,
} from '@ecomerece/frontend';
import type { GetSubjectsType, SubjectResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminSubjectsPage() {
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SubjectResponseDto | null>(null);
  const [deleting, setDeleting] = useState<SubjectResponseDto | null>(null);

  const params: GetSubjectsType = {
    search: search.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetSubjects(params);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const softDeleteSubject = useSoftDeleteSubject();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createSubject.isPending || updateSubject.isPending || softDeleteSubject.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Subjects</h1>
          <p className="mt-1 text-sm text-ink-3">Curriculum subjects and their codes.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New subject
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
          aria-label="Search subjects"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Code</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No subjects yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.name}</td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.code}</Badge>
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
        title={editing ? 'Edit subject' : 'New subject'}
      >
        <SubjectForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete subject?">
        <p className="text-sm text-ink-2">
          {deleting ? `${deleting.name} (${deleting.code}) will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteSubject.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteSubject.mutate(
                { subjectId: deleting.id, reason: 'Deleted from admin console' },
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

function SubjectForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: SubjectResponseDto | null;
  onDone: () => void;
}) {
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  // Schools come from the engine's list; the form sends the chosen school's id.
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = (schools.data?.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
  }));
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    name: initial?.name ?? '',
    code: initial?.code ?? '',
  });
  const pending = createSubject.isPending || updateSubject.isPending;
  const error = createSubject.error ?? updateSubject.error;

  const submit = () => {
    if (mode === 'create') {
      createSubject.mutate(
        { schoolId: form.schoolId, name: form.name, code: form.code },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateSubject.mutate({ subjectId: initial.id, name: form.name }, { onSuccess: onDone });
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
      )}
      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
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
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create subject' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
