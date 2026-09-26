'use client';

import { useGetClassRoster, useTeacherContext } from '@ecomerece/frontend';
import { Badge, Card, EmptyState, ErrorState, Spinner } from '@ecomerece/ui';
import { ChevronDown, GraduationCap, Users } from 'lucide-react';
import { useState } from 'react';

export default function TeacherClassesPage() {
  const { classes, isLoading, isError, error, refetch, hasClasses, schoolId } = useTeacherContext();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading && !hasClasses) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card padding="lg" className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-ink-3">Loading your classes…</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">My classes</h1>
        <p className="mt-1 text-sm text-ink-3">
          The classes you are the class teacher of. Open one to see its roster.
        </p>
      </header>

      {isError && (
        <div className="mt-6">
          <ErrorState
            title="Could not load your classes"
            description={error?.message ?? 'Please try again.'}
            onRetry={refetch}
          />
        </div>
      )}

      {!isError && !hasClasses && (
        <div className="mt-6">
          <EmptyState
            icon={GraduationCap}
            title="No classes assigned yet"
            description="You are not the class teacher of any class. An administrator needs to assign you before attendance, assignments, and grading become available."
          />
        </div>
      )}

      {hasClasses && (
        <>
          {schoolId && (
            <p className="mt-4 font-mono text-xs text-ink-3">
              School ID <span className="text-ink-2">{schoolId}</span>
            </p>
          )}

          <div className="mt-4 space-y-2">
            {classes.map((clazz) => (
              <ClassRow
                key={clazz.id}
                clazz={clazz}
                expanded={expanded === clazz.id}
                onToggle={() => setExpanded((prev) => (prev === clazz.id ? null : clazz.id))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ClassRow({
  clazz,
  expanded,
  onToggle,
}: {
  clazz: {
    id: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
  };
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{clazz.name}</p>
          <p className="mt-0.5 text-xs text-ink-3">
            Grade {clazz.grade} · Section {clazz.section} · {clazz.academicYear}
          </p>
        </div>
        <Badge tone="neutral">{clazz.academicYear}</Badge>
        <ChevronDown
          className={`size-4 shrink-0 text-ink-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded && <RosterPanel classId={clazz.id} />}
    </Card>
  );
}

function RosterPanel({ classId }: { classId: string }) {
  const roster = useGetClassRoster(classId);
  const students = roster.data ?? [];

  if (roster.isLoading) {
    return (
      <div className="flex items-center gap-3 border-t border-line/10 px-4 py-4">
        <Spinner />
        <span className="text-sm text-ink-3">Loading roster…</span>
      </div>
    );
  }

  if (roster.isError) {
    return (
      <div className="border-t border-line/10 px-4 py-4">
        <p className="text-sm text-danger">{(roster.error as Error)?.message}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex items-center gap-2 border-t border-line/10 px-4 py-4 text-sm text-ink-3">
        <Users className="size-4" aria-hidden="true" />
        No students enrolled in this class.
      </div>
    );
  }

  return (
    <div className="border-t border-line/10">
      <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wide text-ink-3">
        Roster · {students.length} {students.length === 1 ? 'student' : 'students'}
      </p>
      <ul className="divide-y divide-line/5">
        {students.map((student) => (
          <li key={student.studentId} className="flex items-center gap-3 px-4 py-2">
            <span className="w-10 shrink-0 font-mono text-xs text-ink-3">
              {student.rollNumber ?? '—'}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{student.fullName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
