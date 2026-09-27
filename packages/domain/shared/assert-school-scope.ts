import type { Id } from '../value-objects/id.vo';

/**
 * Domain-owned rule violation (new.md §6 / infra.md Step 2 — the live bug).
 * Thrown by aggregate-level integrity guards; the app service lets it bubble
 * and the global error handler maps it into the standard envelope.
 */
export class DomainRuleError extends Error {
  readonly code = 'DOMAIN_RULE';

  constructor(message: string) {
    super(message);
    this.name = 'DomainRuleError';
  }
}

/**
 * Every referenced entity must belong to the same school as the aggregate.
 * Refs carry schoolId as a string (cross-module read models are plain data).
 * Throws with the offending label named, e.g. "Class does not belong to this school."
 */
export function assertSameSchool(
  schoolId: Id | string,
  refs: { label: string; schoolId: Id | string | null }[],
): void {
  const expected = typeof schoolId === 'string' ? schoolId : schoolId.value;
  for (const ref of refs) {
    if (!ref.schoolId) continue;
    const actual = typeof ref.schoolId === 'string' ? ref.schoolId : ref.schoolId.value;
    if (actual !== expected) {
      throw new DomainRuleError(`${ref.label} does not belong to this school.`);
    }
  }
}

/** The referenced user must actually hold the given role (e.g. 'teacher'). */
export function assertRefRole(
  role: string,
  user: { role: string; isDeleted: boolean } | null | undefined,
  label: string,
): void {
  if (!user || user.isDeleted) {
    throw new DomainRuleError(`This ${label} is not available.`);
  }
  if (user.role !== role) {
    throw new DomainRuleError(`The referenced user is not a ${label}.`);
  }
}
