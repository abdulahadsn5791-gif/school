/**
 * PUBLIC visibility filter fragments per persistence field group (pure data —
 * no Mongo types, no imports — domain owns the definition, infra the mechanics).
 * Composed by repositories at read time (new.md §3):
 *
 * - `public` tier → the fragments are spread into the Mongo filter, so hidden
 *   rows (deleted / banned / blocked) do not exist for those callers.
 * - `admin` tier → no visibility filter; optional `includeDeleted` opt-in.
 *
 * Point reads at public tier must throw the SAME NotFoundError for a hidden row
 * as for a truly missing one (no state/existence leak).
 */
export const USER_PUBLIC_VISIBILITY = {
  'deleted.deleted': { $ne: true },
  'ban.banned': { $ne: true },
  'block.blocked': { $ne: true },
} as const;

/**
 * Generic not-deleted policy for school-scoped entities (any module whose
 * persistence has a `deleted.deleted` group).
 */
export const SOFT_DELETE_PUBLIC_VISIBILITY = {
  'deleted.deleted': { $ne: true },
} as const;
