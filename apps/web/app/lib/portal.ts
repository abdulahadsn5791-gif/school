export type PortalRole = 'teacher' | 'student' | 'admin';

export const PORTAL_ROLES = ['student', 'teacher', 'admin'] as const;

export function isPortalRole(value: string | null | undefined): value is PortalRole {
  return value === 'student' || value === 'teacher' || value === 'admin';
}

/** Where a signed-in user of the given role should land. */
export function portalPathForRole(role: string | null | undefined): string {
  return isPortalRole(role) ? `/portal/${role}` : '/account';
}

export interface PortalMeta {
  label: string;
  title: string;
  tagline: string;
}

export const PORTAL_META: Record<PortalRole, PortalMeta> = {
  student: {
    label: 'Student',
    title: 'Student portal',
    tagline: 'Courses, assignments, grades, and your timetable.',
  },
  teacher: {
    label: 'Teacher',
    title: 'Teacher portal',
    tagline: 'Classes, rosters, grading, and attendance.',
  },
  admin: {
    label: 'Admin',
    title: 'Admin portal',
    tagline: 'People, roles, moderation, and platform settings.',
  },
};
