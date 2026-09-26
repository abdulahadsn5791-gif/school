'use client';

import {
  useCreateFeeStructure,
  useGetFeeStructures,
  useGetInvoices,
  useGetPayments,
  useIssueInvoice,
  useRecordPayment,
  useWaiveInvoice,
} from '@ecomerece/frontend';
import type { FeeStructureResponseDto, InvoiceResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const FREQUENCIES = ['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME'] as const;
const INVOICE_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'] as const;
const PAYMENT_METHODS = ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE'] as const;

type Tab = 'structures' | 'invoices' | 'payments';

export default function AdminFeesPage() {
  const [tab, setTab] = useState<Tab>('invoices');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Fees</h1>
          <p className="mt-1 text-sm text-ink-3">
            Structures define what to charge; invoices track who owes; payments settle them.
          </p>
        </div>
        <div className="flex gap-2">
          {(['invoices', 'structures', 'payments'] as Tab[]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </header>

      {tab === 'structures' && <StructuresTab />}
      {tab === 'invoices' && <InvoicesTab />}
      {tab === 'payments' && <PaymentsTab />}
    </div>
  );
}

function StructuresTab() {
  const list = useGetFeeStructures({});
  const _createStructure = useCreateFeeStructure();
  const [creating, setCreating] = useState(false);

  const rows = list.data?.data ?? [];

  return (
    <div className="mt-6">
      <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
        <Plus className="size-4" /> New structure
      </Button>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Title</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Amount</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Frequency</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Year
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Due day
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No fee structures'}
                  </td>
                </tr>
              )}
              {rows.map((row: FeeStructureResponseDto) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.title}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.amount}</td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.frequency}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 font-mono text-sm text-ink-2 md:table-cell">
                    {row.academicYear}
                  </td>
                  <td className="hidden px-3 py-2 font-mono text-sm text-ink-2 md:table-cell">
                    {row.dueDayOfMonth ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New fee structure">
        <StructureForm onDone={() => setCreating(false)} />
      </Modal>
    </div>
  );
}

function StructureForm({ onDone }: { onDone: () => void }) {
  const createStructure = useCreateFeeStructure();
  const [form, setForm] = useState({
    schoolId: '',
    classId: '',
    academicYear: '',
    title: '',
    amount: '',
    frequency: 'MONTHLY' as (typeof FREQUENCIES)[number],
    dueDayOfMonth: '',
  });

  const submit = () => {
    createStructure.mutate(
      {
        schoolId: form.schoolId,
        classId: form.classId,
        academicYear: form.academicYear,
        title: form.title,
        amount: Number(form.amount),
        frequency: form.frequency,
        dueDayOfMonth: form.dueDayOfMonth ? Number(form.dueDayOfMonth) : null,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="School ID">
          <Input
            value={form.schoolId}
            onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
            required
          />
        </Field>
        <Field label="Class ID">
          <Input
            value={form.classId}
            onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
            required
          />
        </Field>
      </div>
      <Field label="Academic year" hint="2026-2027">
        <Input
          value={form.academicYear}
          onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
          required
        />
      </Field>
      <Field label="Title">
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Amount">
          <Input
            type="number"
            min={1}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
          />
        </Field>
        <Field label="Frequency">
          <Select
            value={form.frequency}
            onChange={(e) =>
              setForm((f) => ({ ...f, frequency: e.target.value as (typeof FREQUENCIES)[number] }))
            }
          >
            {FREQUENCIES.map((fr) => (
              <option key={fr} value={fr}>
                {fr}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due day" hint="1–28, optional">
          <Input
            type="number"
            min={1}
            max={28}
            value={form.dueDayOfMonth}
            onChange={(e) => setForm((f) => ({ ...f, dueDayOfMonth: e.target.value }))}
          />
        </Field>
      </div>
      {createStructure.error && (
        <p className="text-sm text-danger">{(createStructure.error as Error).message}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={createStructure.isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={createStructure.isPending}>
          Create
        </Button>
      </div>
    </form>
  );
}

function InvoicesTab() {
  const [status, setStatus] = useState<(typeof INVOICE_STATUSES)[number] | ''>('');
  const list = useGetInvoices({ status: status || undefined });
  const _issueInvoice = useIssueInvoice();
  const waiveInvoice = useWaiveInvoice();
  const [issuing, setIssuing] = useState(false);
  const [paying, setPaying] = useState<InvoiceResponseDto | null>(null);

  const rows = list.data?.data ?? [];

  const tone = (s: (typeof INVOICE_STATUSES)[number]) =>
    s === 'PAID'
      ? 'success'
      : s === 'WAIVED'
        ? 'neutral'
        : s === 'OVERDUE'
          ? 'danger'
          : s === 'PARTIAL'
            ? 'warning'
            : 'accent';

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => setIssuing(true)}>
          <Plus className="size-4" /> Issue invoice
        </Button>
        <div className="w-40">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof INVOICE_STATUSES)[number] | '')}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Due</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Paid</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Balance</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No invoices'}
                  </td>
                </tr>
              )}
              {rows.map((row: InvoiceResponseDto) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.studentId}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.amountDue}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.amountPaid}</td>
                  <td className="px-3 py-2 font-mono text-sm text-ink">{row.balance}</td>
                  <td className="px-3 py-2">
                    <Badge tone={tone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {(row.status === 'UNPAID' || row.status === 'PARTIAL') && (
                        <Button variant="ghost" size="sm" onClick={() => setPaying(row)}>
                          Pay
                        </Button>
                      )}
                      {(row.status === 'UNPAID' || row.status === 'OVERDUE') && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={waiveInvoice.isPending}
                          onClick={() => waiveInvoice.mutate({ invoiceId: row.id })}
                        >
                          Waive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {list.isError && <p className="mt-3 text-sm text-danger">{(list.error as Error)?.message}</p>}

      <Modal open={issuing} onClose={() => setIssuing(false)} title="Issue invoice">
        <IssueForm onDone={() => setIssuing(false)} />
      </Modal>

      <PaymentModal invoice={paying} onClose={() => setPaying(null)} />
    </div>
  );
}

function IssueForm({ onDone }: { onDone: () => void }) {
  const issueInvoice = useIssueInvoice();
  const [form, setForm] = useState({
    schoolId: '',
    studentId: '',
    feeStructureId: '',
    dueDate: '',
  });

  const submit = () => {
    issueInvoice.mutate(
      {
        schoolId: form.schoolId,
        studentId: form.studentId,
        feeStructureId: form.feeStructureId,
        dueDate: new Date(form.dueDate),
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="School ID">
        <Input
          value={form.schoolId}
          onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
          required
        />
      </Field>
      <Field label="Student ID">
        <Input
          value={form.studentId}
          onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
          required
        />
      </Field>
      <Field label="Fee structure ID">
        <Input
          value={form.feeStructureId}
          onChange={(e) => setForm((f) => ({ ...f, feeStructureId: e.target.value }))}
          required
        />
      </Field>
      <Field label="Due date">
        <Input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          required
        />
      </Field>
      {issueInvoice.error && (
        <p className="text-sm text-danger">{(issueInvoice.error as Error).message}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={issueInvoice.isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={issueInvoice.isPending}>
          Issue
        </Button>
      </div>
    </form>
  );
}

function PaymentModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceResponseDto | null;
  onClose: () => void;
}) {
  const recordPayment = useRecordPayment();
  const [form, setForm] = useState({ amount: '', method: 'CASH', reference: '' });

  const submit = () => {
    if (!invoice) return;
    recordPayment.mutate(
      {
        invoiceId: invoice.id,
        amount: Number(form.amount),
        method: form.method as (typeof PAYMENT_METHODS)[number],
        reference: form.reference || null,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={invoice !== null} onClose={onClose} title="Record payment">
      {invoice && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className="text-sm text-ink-2">
            Balance due: <span className="font-mono">{invoice.balance}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <Input
                type="number"
                min={0.01}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </Field>
            <Field label="Method">
              <Select
                value={form.method}
                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Reference" hint="Optional">
            <Input
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
            />
          </Field>
          {recordPayment.error && (
            <p className="text-sm text-danger">{(recordPayment.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={recordPayment.isPending}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={recordPayment.isPending}>
              Record
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function PaymentsTab() {
  const [invoiceIdInput, setInvoiceIdInput] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const list = useGetPayments(invoiceId);
  const rows = list.data?.data ?? [];

  return (
    <div className="mt-6">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setInvoiceId(invoiceIdInput.trim());
        }}
      >
        <div className="flex-1">
          <Field label="Invoice ID">
            <Input
              value={invoiceIdInput}
              onChange={(e) => setInvoiceIdInput(e.target.value)}
              placeholder="UUID"
              required
            />
          </Field>
        </div>
        <Button variant="primary" type="submit" className="mb-0.5">
          Load payments
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Paid at</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Amount</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Method</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No payments'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-ink-2">
                    {new Date(row.paidAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink">{row.amount}</td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.method}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {row.reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {list.isError && <p className="mt-3 text-sm text-danger">{(list.error as Error)?.message}</p>}
    </div>
  );
}
