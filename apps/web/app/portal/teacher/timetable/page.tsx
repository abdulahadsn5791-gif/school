'use client';

import { type TimetableSlot, useTeacherTimetable } from '@ecomerece/frontend';
import { Badge, Button, Card, EmptyState, ErrorState, Select, Spinner } from '@ecomerece/ui';
import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

type ViewMode = 'week' | 'agenda';
type DayGroup = { day: string; slots: TimetableSlot[] };

export default function TeacherTimetablePage() {
  const { byDay, classes, totalSlots, isLoading, isError, error, hasAnyTimetable } =
    useTeacherTimetable();
  const [view, setView] = useState<ViewMode>('week');
  const [classFilter, setClassFilter] = useState('');

  // Days left empty by the filter are dropped so the week view does not render
  // a run of "No lessons" cards.
  const visibleByDay = useMemo<DayGroup[]>(
    () =>
      byDay
        .map((group) => ({
          day: group.day,
          slots: classFilter
            ? group.slots.filter((slot) => slot.classId === classFilter)
            : group.slots,
        }))
        .filter((group) => group.slots.length > 0 || !classFilter),
    [byDay, classFilter],
  );

  const visibleSlots = visibleByDay.reduce((sum, group) => sum + group.slots.length, 0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card padding="lg" className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-ink-3">Loading your timetable…</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My timetable</h1>
          <p className="mt-1 text-sm text-ink-3">
            {hasAnyTimetable
              ? classFilter
                ? `${visibleSlots} ${visibleSlots === 1 ? 'slot' : 'slots'} for the selected class.`
                : `${totalSlots} ${totalSlots === 1 ? 'slot' : 'slots'} across the week.`
              : 'Your weekly teaching schedule.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'week' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'agenda' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('agenda')}
          >
            List
          </Button>
        </div>
      </header>

      {isError && (
        <div className="mt-6">
          <ErrorState
            title="Could not load your timetable"
            description={error?.message ?? 'Please try again.'}
          />
        </div>
      )}

      {!isError && !hasAnyTimetable && (
        <div className="mt-6">
          <EmptyState
            icon={CalendarDays}
            title="No timetable entries"
            description="You have no scheduled lessons yet. An administrator adds timetable entries when they assign you to teach a class."
          />
        </div>
      )}

      {!isError && hasAnyTimetable && (
        <>
          {classes.length > 1 && (
            <div className="mt-4 sm:w-64">
              <Select
                aria-label="Filter by class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All classes</option>
                {classes.map((clazz) => (
                  <option key={clazz.id} value={clazz.id}>
                    {clazz.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {view === 'week' ? (
            <WeekGrid byDay={visibleByDay} />
          ) : (
            <AgendaList byDay={visibleByDay} />
          )}
        </>
      )}
    </div>
  );
}

function WeekGrid({ byDay }: { byDay: DayGroup[] }) {
  return (
    <div className="mt-6 space-y-3">
      {byDay.map(({ day, slots }) => (
        <Card key={day} padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line/10 px-4 py-2.5">
            <p className="text-sm font-medium text-ink">{DAY_LABELS[day] ?? day}</p>
            {slots.length > 0 && (
              <Badge tone="neutral">
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
              </Badge>
            )}
          </div>
          {slots.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-3">No lessons.</p>
          ) : (
            <ul className="divide-y divide-line/5">
              {slots.map((slot) => (
                <SlotRow key={slot.entryId} slot={slot} />
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}

function AgendaList({ byDay }: { byDay: DayGroup[] }) {
  const days = byDay.filter((day) => day.slots.length > 0);
  return (
    <div className="mt-6">
      {days.map(({ day, slots }) => (
        <section key={day} className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-3">
            {DAY_LABELS[day] ?? day}
          </h2>
          <ul className="mt-2 space-y-2">
            {slots.map((slot) => (
              <li key={slot.entryId}>
                <Card padding="md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink-3">
                      {slot.startTime && slot.endTime
                        ? `${slot.startTime}–${slot.endTime}`
                        : slot.periodName}
                    </span>
                    <span className="text-sm font-medium text-ink">{slot.subjectName}</span>
                    <Badge tone="neutral">{slot.className}</Badge>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SlotRow({ slot }: { slot: TimetableSlot }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
      <span className="w-28 shrink-0 font-mono text-xs text-ink-3">
        {slot.startTime && slot.endTime ? `${slot.startTime}–${slot.endTime}` : slot.periodName}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {slot.subjectName}
      </span>
      <Badge tone="neutral">{slot.className}</Badge>
    </li>
  );
}
