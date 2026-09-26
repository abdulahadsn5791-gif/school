export type GuardianReadModel = {
  id: string;
  schoolId: string;
  name: { firstName: string; middleName: string | null; lastName: string | null; fullName: string };
  phone: string;
  email: string | null;
  occupation: string | null;
  userId: string | null;
  isDeleted: boolean;
  createdAt: Date;
};
