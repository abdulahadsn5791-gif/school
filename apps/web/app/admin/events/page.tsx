'use client';

import {
  useCreateEvent,
  useGetEvents,
  useGetSchools,
  useSoftDeleteEvent,
  useUpdateEvent,
} from '@ecomerece/frontend';
import type { EventResponseDto, GetEventsType } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select, Textarea } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const EVENT_TYPES = ['HOLIDAY', 'EXAM', 'MEETING', 'ACTIVITY', 'OTHER'] as const;
type EventType = (typeof EVENT_TYPES)[number];

export default function AdminEventsPage() {
  const [type, setType] = useState<EventType | ''>('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EventResponseDto | null>(null);
  const [deleting, setDeleting] = useState<EventResponseDto | null>(null);

  const params: GetEventsType = {
    type: type || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetEvents(params);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const softDeleteEvent = useSoftDeleteEvent();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createEvent.isPending || updateEvent.isPending || softDeleteEvent.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Calendar events</h1>
          <p className="mt-1 text-sm text-ink-3">
            Holidays, exams, meetings, and activities per school.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New event
        </Button>
      </header>

      <div className="mt-4 sm:w-44">
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value as EventType | '');
            setCursor(undefined);
          }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
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
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Type</th>
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
                    {list.isLoading ? 'Loading…' : 'No events yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-64 truncate px-3 py-2 text-sm font-medium text-ink">
                    {row.title}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={row.type === 'EXAM' ? 'warning' : 'neutral'}>{row.type}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {new Date(row.startDate).toLocaleDateString()} –{' '}
                    {new Date(row.endDate).toLocaleDateString()}
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
        title={editing ? 'Edit event' : 'New event'}
        size="lg"
      >
        <EventForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete event?">
        <p className="text-sm text-ink-2">
          {deleting ? `“${deleting.title}” will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteEvent.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteEvent.mutate(
                { eventId: deleting.id, reason: 'Deleted from admin console' },
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

function EventForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: EventResponseDto | null;
  onDone: () => void;
}) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  // Schools come from the engine's list (new.md §10) — no pasted UUIDs.
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = schools.data?.data ?? [];
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    type: (initial?.type ?? 'OTHER') as EventType,
    startDate: initial ? new Date(initial.startDate).toISOString().slice(0, 10) : '',
    endDate: initial ? new Date(initial.endDate).toISOString().slice(0, 10) : '',
  });
  const pending = createEvent.isPending || updateEvent.isPending;
  const error = createEvent.error ?? updateEvent.error;

  const submit = () => {
    if (mode === 'create') {
      createEvent.mutate(
        {
          schoolId: form.schoolId,
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          startDate: new Date(form.startDate),
          endDate: new Date(form.endDate),
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      const datesChanged =
        form.startDate !== new Date(initial.startDate).toISOString().slice(0, 10) ||
        form.endDate !== new Date(initial.endDate).toISOString().slice(0, 10);
      updateEvent.mutate(
        {
          eventId: initial.id,
          title: form.title !== initial.title ? form.title : undefined,
          description:
            form.description !== (initial.description ?? '') ? form.description : undefined,
          type: form.type !== initial.type ? form.type : undefined,
          ...(datesChanged
            ? {
                startDate: new Date(form.startDate),
                endDate: new Date(form.endDate),
              }
            : {}),
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
      <Field label="Description" hint="Optional">
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type">
          <Select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventType }))}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
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
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create event' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
