export type CalendarEventReadModel = {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  type: 'HOLIDAY' | 'EXAM' | 'MEETING' | 'ACTIVITY' | 'OTHER';
  startDate: Date;
  endDate: Date;
  classId: string | null;
  isDeleted: boolean;
  createdAt: Date;
};
