'use client';

import {
  useCreateNotice,
  useGetClasses,
  useGetNotices,
  useGetSchools,
  useSoftDeleteNotice,
  useUpdateNotice,
} from '@ecomerece/frontend';
import type { GetNoticesType, NoticeResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select, Textarea } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const AUDIENCES = ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS'] as const;
type Audience = (typeof AUDIENCES)[number];

export default function AdminNoticesPage() {
  const [audience, setAudience] = useState<Audience | ''>('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<NoticeResponseDto | null>(null);
  const [deleting, setDeleting] = useState<NoticeResponseDto | null>(null);

  const params: GetNoticesType = {
    audience: audience || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetNotices(params);
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const softDeleteNotice = useSoftDeleteNotice();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createNotice.isPending || updateNotice.isPending || softDeleteNotice.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Notices</h1>
          <p className="mt-1 text-sm text-ink-3">
            Announcements scoped by audience. CLASS audience requires a class.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New notice
        </Button>
      </header>

      <div className="mt-4 sm:w-44">
        <Select
          value={audience}
          onChange={(e) => {
            setAudience(e.target.value as Audience | '');
            setCursor(undefined);
          }}
          aria-label="Filter by audience"
        >
          <option value="">All audiences</option>
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Title</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Audience</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Publishes
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 lg:table-cell">
                  Expires
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No notices yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-64 truncate px-3 py-2 text-sm font-medium text-ink">
                    {row.title}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={row.audience === 'CLASS' ? 'accent' : 'neutral'}>
                      {row.audience}
                    </Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {new Date(row.publishAt).toLocaleDateString()}
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 lg:table-cell">
                    {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—'}
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
        title={editing ? 'Edit notice' : 'New notice'}
        size="lg"
      >
        <NoticeForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete notice?">
        <p className="text-sm text-ink-2">
          {deleting ? `“${deleting.title}” will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteNotice.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteNotice.mutate(
                { noticeId: deleting.id, reason: 'Deleted from admin console' },
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

function NoticeForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: NoticeResponseDto | null;
  onDone: () => void;
}) {
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  // Pickers instead of UUID inputs (new.md §10).
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = schools.data?.data ?? [];
  const classes = useGetClasses({ limit: 50 });
  const classOptions = (classes.data?.data ?? []).filter(
    (clazz) => !form.schoolId || clazz.schoolId === form.schoolId,
  );
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    title: initial?.title ?? '',
    body: initial?.body ?? '',
    audience: (initial?.audience ?? 'ALL') as Audience,
    classId: initial?.classId ?? '',
    expiresAt: initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : '',
  });
  const pending = createNotice.isPending || updateNotice.isPending;
  const error = createNotice.error ?? updateNotice.error;

  const submit = () => {
    if (mode === 'create') {
      createNotice.mutate(
        {
          schoolId: form.schoolId,
          title: form.title,
          body: form.body,
          audience: form.audience,
          classId: form.audience === 'CLASS' ? form.classId : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateNotice.mutate(
        {
          noticeId: initial.id,
          title: form.title !== initial.title ? form.title : undefined,
          body: form.body !== initial.body ? form.body : undefined,
          audience: form.audience !== initial.audience ? form.audience : undefined,
          classId:
            (form.audience === 'CLASS' ? form.classId : null) !== initial.classId
              ? form.audience === 'CLASS'
                ? form.classId
                : null
              : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
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
      <Field label="Title">
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </Field>
      <Field label="Body">
        <Textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={4}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Audience">
          <Select
            value={form.audience}
            onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as Audience }))}
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        {form.audience === 'CLASS' && (
          <Field label="Class" hint="Required for CLASS audience">
            <Select
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              required
            >
              <option value="">{classes.isLoading ? 'Loading classes…' : 'Select a class'}</option>
              {classOptions.map((clazz) => (
                <option key={clazz.id} value={clazz.id}>
                  {clazz.name} · {clazz.academicYear}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
      <Field label="Expires at" hint="Optional">
        <Input
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Publish notice' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
