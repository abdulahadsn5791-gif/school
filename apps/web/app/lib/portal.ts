export type PortalRole = 'teacher' | 'student' | 'admin';

import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  type LucideIcon,
  ScrollText,
} from 'lucide-react';

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

export interface PortalSection {
  label: string;
  title: string;
  description: string;
  href: string;
  /** Key into a lucide icon map owned by the caller. */
  icon: string;
}

/** Sections of the teacher portal, in nav order. Hrefs are absolute. */
export const TEACHER_SECTIONS: PortalSection[] = [
  {
    label: 'My classes',
    title: 'My classes',
    description: 'The classes you are the class teacher of.',
    href: '/portal/teacher/classes',
    icon: 'graduationCap',
  },
  {
    label: 'My timetable',
    title: 'My timetable',
    description: 'Your weekly teaching schedule.',
    href: '/portal/teacher/timetable',
    icon: 'calendarDays',
  },
  {
    label: 'Attendance',
    title: 'Attendance',
    description: 'Mark a daily register for your classes.',
    href: '/portal/teacher/attendance',
    icon: 'clipboardCheck',
  },
  {
    label: 'Assignments',
    title: 'Assignments',
    description: 'Set work and track what is due.',
    href: '/portal/teacher/assignments',
    icon: 'clipboardList',
  },
  {
    label: 'Grading',
    title: 'Grading',
    description: 'Submissions waiting on a grade.',
    href: '/portal/teacher/grading',
    icon: 'scrollText',
  },
  {
    label: 'Leaves',
    title: 'Leaves',
    description: 'Request time off and track approval.',
    href: '/portal/teacher/leaves',
    icon: 'fileText',
  },
];

/** Icon components for the teacher sections, keyed by `PortalSection.icon`. */
export const TEACHER_SECTION_ICONS: Record<string, LucideIcon> = {
  graduationCap: GraduationCap,
  calendarDays: CalendarDays,
  clipboardCheck: ClipboardCheck,
  clipboardList: ClipboardList,
  scrollText: ScrollText,
  fileText: FileText,
};
