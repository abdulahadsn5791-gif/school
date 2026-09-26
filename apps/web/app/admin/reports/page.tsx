'use client';

import { useCreateReport, useGetReports, useSoftDeleteReport } from '@ecomerece/frontend';
import type { ReportResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Textarea } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

interface SubjectRow {
  key: number;
  subjectId: string;
  homeworkMarks: string;
  testMarks: string;
  oralMarks: string;
  totalObtained: string;
  maxMarks: string;
  grade: string;
}

const emptySubject: SubjectRow = {
  key: 0,
  subjectId: '',
  homeworkMarks: '0',
  testMarks: '0',
  oralMarks: '0',
  totalObtained: '',
  maxMarks: '100',
  grade: '',
};

export default function AdminReportsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ReportResponseDto | null>(null);

  const list = useGetReports({ cursor, limit: PAGE_SIZE, direction: 'next' });
  const softDeleteReport = useSoftDeleteReport();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-3">
            Per-student, per-term report cards. One report per student and term.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New report
        </Button>
      </header>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Term
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Year</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Overall</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Grade</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No reports yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.studentId}
                  </td>
                  <td className="hidden max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2 md:table-cell">
                    {row.termId}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.academicYear}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">
                    {row.overallPercentage}%
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="accent">{row.overallGrade}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    {row.isDeleted ? (
                      <Badge tone="danger">Deleted</Badge>
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={softDeleteReport.isPending}
                      onClick={() => setDeleting(row)}
                    >
                      Delete
                    </Button>
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

      <Modal open={creating} onClose={() => setCreating(false)} title="New report" size="lg">
        <ReportForm onDone={() => setCreating(false)} />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete report?">
        <p className="text-sm text-ink-2">
          {deleting
            ? `Report for ${deleting.studentId.slice(0, 8)}… (${deleting.academicYear}) will be soft-deleted.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteReport.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteReport.mutate(
                { reportId: deleting.id, reason: 'Deleted from admin console' },
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

function ReportForm({ onDone }: { onDone: () => void }) {
  const createReport = useCreateReport();
  const [head, setHead] = useState({
    schoolId: '',
    studentId: '',
    classId: '',
    termId: '',
    academicYear: '',
    overallPercentage: '',
    overallGrade: '',
    attendancePercentage: '',
    generalRemarks: '',
  });
  const [subjects, setSubjects] = useState<SubjectRow[]>([{ ...emptySubject, key: 0 }]);
  const [nextKey, setNextKey] = useState(1);

  const setSubject = (index: number, patch: Partial<SubjectRow>) =>
    setSubjects((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const submit = () => {
    createReport.mutate(
      {
        schoolId: head.schoolId,
        studentId: head.studentId,
        classId: head.classId,
        termId: head.termId,
        academicYear: head.academicYear,
        overallPercentage: Number(head.overallPercentage),
        overallGrade: head.overallGrade,
        attendancePercentage: head.attendancePercentage ? Number(head.attendancePercentage) : null,
        generalRemarks: head.generalRemarks || null,
        subjects: subjects
          .filter((s) => s.subjectId && s.totalObtained && s.grade)
          .map((s) => ({
            subjectId: s.subjectId,
            homeworkMarks: Number(s.homeworkMarks) || 0,
            testMarks: Number(s.testMarks) || 0,
            oralMarks: Number(s.oralMarks) || 0,
            totalObtained: Number(s.totalObtained),
            maxMarks: Number(s.maxMarks),
            grade: s.grade,
          })),
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="School ID">
          <Input
            value={head.schoolId}
            onChange={(e) => setHead((h) => ({ ...h, schoolId: e.target.value }))}
            required
          />
        </Field>
        <Field label="Student ID">
          <Input
            value={head.studentId}
            onChange={(e) => setHead((h) => ({ ...h, studentId: e.target.value }))}
            required
          />
        </Field>
        <Field label="Class ID">
          <Input
            value={head.classId}
            onChange={(e) => setHead((h) => ({ ...h, classId: e.target.value }))}
            required
          />
        </Field>
        <Field label="Term ID">
          <Input
            value={head.termId}
            onChange={(e) => setHead((h) => ({ ...h, termId: e.target.value }))}
            required
          />
        </Field>
      </div>
      <Field label="Academic year" hint="2026-2027">
        <Input
          value={head.academicYear}
          onChange={(e) => setHead((h) => ({ ...h, academicYear: e.target.value }))}
          required
        />
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Subject grades</p>
        {subjects.map((s, i) => (
          <div key={s.key} className="rounded-xl bg-surface-3 p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label={i === 0 ? 'Subject ID' : undefined}>
                  <Input
                    value={s.subjectId}
                    onChange={(e) => setSubject(i, { subjectId: e.target.value })}
                    required
                  />
                </Field>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove subject"
                disabled={subjects.length === 1}
                onClick={() => setSubjects((prev) => prev.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              <Input
                type="number"
                min={0}
                value={s.homeworkMarks}
                onChange={(e) => setSubject(i, { homeworkMarks: e.target.value })}
                aria-label="Homework marks"
                placeholder="HW"
              />
              <Input
                type="number"
                min={0}
                value={s.testMarks}
                onChange={(e) => setSubject(i, { testMarks: e.target.value })}
                aria-label="Test marks"
                placeholder="Test"
              />
              <Input
                type="number"
                min={0}
                value={s.oralMarks}
                onChange={(e) => setSubject(i, { oralMarks: e.target.value })}
                aria-label="Oral marks"
                placeholder="Oral"
              />
              <Input
                type="number"
                min={0}
                value={s.totalObtained}
                onChange={(e) => setSubject(i, { totalObtained: e.target.value })}
                aria-label="Total obtained"
                placeholder="Total"
                required
              />
              <Input
                type="number"
                min={1}
                value={s.maxMarks}
                onChange={(e) => setSubject(i, { maxMarks: e.target.value })}
                aria-label="Max marks"
                placeholder="Max"
                required
              />
              <Input
                value={s.grade}
                onChange={(e) => setSubject(i, { grade: e.target.value })}
                aria-label="Grade"
                placeholder="A"
                required
              />
            </div>
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSubjects((prev) => [...prev, { ...emptySubject, key: nextKey }]);
            setNextKey((k) => k + 1);
          }}
        >
          <Plus className="size-4" /> Add subject
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Overall %">
          <Input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={head.overallPercentage}
            onChange={(e) => setHead((h) => ({ ...h, overallPercentage: e.target.value }))}
            required
          />
        </Field>
        <Field label="Overall grade">
          <Input
            value={head.overallGrade}
            onChange={(e) => setHead((h) => ({ ...h, overallGrade: e.target.value }))}
            required
          />
        </Field>
        <Field label="Attendance %" hint="Optional">
          <Input
            type="number"
            min={0}
            max={100}
            value={head.attendancePercentage}
            onChange={(e) => setHead((h) => ({ ...h, attendancePercentage: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="General remarks" hint="Optional">
        <Textarea
          value={head.generalRemarks}
          onChange={(e) => setHead((h) => ({ ...h, generalRemarks: e.target.value }))}
          rows={2}
        />
      </Field>

      {createReport.error && (
        <p className="text-sm text-danger">{(createReport.error as Error).message}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={createReport.isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={createReport.isPending}>
          Create report
        </Button>
      </div>
    </form>
  );
}
