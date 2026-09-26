'use client';

import {
  useAssignRole,
  useBanLift,
  useBanUser,
  useBlockLift,
  useBlockUser,
  useGetAdminUsersInfinite,
  useRecoverUser,
  useSoftDeleteUser,
} from '@ecomerece/frontend';
import type { UserResponseReadModel, UserRolesType } from '@ecomerece/shared';
import { Badge, Button, Input, Modal, Select } from '@ecomerece/ui';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

const ROLES: UserRolesType[] = ['admin', 'teacher', 'student'];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRolesType | ''>('');
  const [deleting, setDeleting] = useState<UserResponseReadModel | null>(null);

  const filters = {
    search: search.trim() || undefined,
    role: role || undefined,
    limit: 30,
  };
  const list = useGetAdminUsersInfinite(filters);
  const assignRole = useAssignRole();
  const blockUser = useBlockUser();
  const blockLift = useBlockLift();
  const banUser = useBanUser();
  const banLift = useBanLift();
  const softDeleteUser = useSoftDeleteUser();
  const recoverUser = useRecoverUser();

  const rows = list.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
          <p className="mt-1 text-sm text-ink-3">Accounts, roles, and moderation state.</p>
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRolesType | '')}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 sm:table-cell">
                  Email
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Role</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">State</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No users found'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.fullName}</td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 sm:table-cell">{row.email}</td>
                  <td className="px-3 py-2">
                    <Select
                      value={row.role}
                      disabled={assignRole.isPending}
                      onChange={(e) =>
                        assignRole.mutate({
                          userId: row.id,
                          role: e.target.value as UserRolesType,
                          reason: 'Role changed from admin console',
                        })
                      }
                      aria-label={`Role for ${row.fullName}`}
                      className="min-h-9 py-1.5"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.isDeleted && <Badge tone="danger">Deleted</Badge>}
                      {row.isBlocked ? (
                        <Badge tone="warning">Blocked</Badge>
                      ) : (
                        <Badge tone="success">Active</Badge>
                      )}
                      {row.isBanned && <Badge tone="danger">Banned</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {row.isDeleted ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={recoverUser.isPending}
                          onClick={() => recoverUser.mutate(row.id)}
                        >
                          Recover
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={softDeleteUser.isPending}
                          onClick={() => setDeleting(row)}
                        >
                          Delete
                        </Button>
                      )}
                      {!row.isDeleted && row.isBlocked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={blockLift.isPending}
                          onClick={() => blockLift.mutate(row.id)}
                        >
                          Unblock
                        </Button>
                      )}
                      {!row.isDeleted && !row.isBlocked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={blockUser.isPending}
                          onClick={() =>
                            blockUser.mutate({
                              userId: row.id,
                              reason: 'Blocked from admin console',
                            })
                          }
                        >
                          Block
                        </Button>
                      )}
                      {!row.isDeleted && row.isBanned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={banLift.isPending}
                          onClick={() => banLift.mutate(row.id)}
                        >
                          Unban
                        </Button>
                      )}
                      {!row.isDeleted && !row.isBanned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={banUser.isPending}
                          onClick={() =>
                            banUser.mutate({
                              userId: row.id,
                              days: 7,
                              reason: 'Banned from admin console',
                            })
                          }
                        >
                          Ban
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

      <div className="mt-3 flex justify-center">
        {list.hasNextPage && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            <Plus className="size-4" /> Load more
          </Button>
        )}
      </div>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete user?">
        <p className="text-sm text-ink-2">
          {deleting
            ? `${deleting.fullName} (${deleting.email}) will be soft-deleted and unable to sign in.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteUser.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteUser.mutate(
                { userId: deleting.id, reason: 'Deleted from admin console' },
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
