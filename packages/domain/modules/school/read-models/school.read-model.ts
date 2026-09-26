export type SchoolReadModel = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  timezone: string;
  isDeleted: boolean;
  createdAt: Date;
};
