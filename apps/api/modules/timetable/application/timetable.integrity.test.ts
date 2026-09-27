import { describe, expect, test } from 'bun:test';
import { assertRefRole, assertSameSchool, DomainRuleError } from '@ecomerece/domain';

describe('referential integrity guards (the live-bug fix)', () => {
  test('a ref from another school is rejected', () => {
    expect(() => assertSameSchool('school-a', [{ label: 'Class', schoolId: 'school-b' }])).toThrow(
      DomainRuleError,
    );
    expect(() => assertSameSchool('school-a', [{ label: 'Class', schoolId: 'school-b' }])).toThrow(
      /Class does not belong to this school/,
    );
  });

  test('refs from the same school pass', () => {
    expect(() =>
      assertSameSchool('school-a', [
        { label: 'Class', schoolId: 'school-a' },
        { label: 'Subject', schoolId: 'school-a' },
      ]),
    ).not.toThrow();
  });

  test('a null schoolId ref is skipped (school-agnostic entity)', () => {
    expect(() => assertSameSchool('school-a', [{ label: 'Period', schoolId: null }])).not.toThrow();
  });

  test('a non-teacher in the teacher slot is rejected', () => {
    expect(() =>
      assertRefRole('teacher', { role: 'student', isDeleted: false }, 'teacher'),
    ).toThrow(/not a teacher/);
  });

  test('a deleted user in any ref slot is rejected', () => {
    expect(() => assertRefRole('teacher', { role: 'teacher', isDeleted: true }, 'teacher')).toThrow(
      /not available/,
    );
  });

  test('a real teacher passes', () => {
    expect(() =>
      assertRefRole('teacher', { role: 'teacher', isDeleted: false }, 'teacher'),
    ).not.toThrow();
  });
});
