import type { Id } from '../../../value-objects';
import type { ClassAggregate } from '../class.aggregate';

export interface IClassRepository {
  FindById(id: Id): Promise<ClassAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ClassAggregate>;
  FindBySchool(schoolId: Id): Promise<ClassAggregate[]>;
  FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<ClassAggregate[]>;
  FindByTeacher(teacherId: Id): Promise<ClassAggregate[]>;
  Save(clazz: ClassAggregate): Promise<void>;
  Create(clazz: ClassAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
