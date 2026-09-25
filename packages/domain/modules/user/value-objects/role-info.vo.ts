import { type EffectiveDate, EnumVO, type Id, type Reason } from '../../../value-objects';

const USER_ROLES = ['teacher', 'student', 'admin'] as const;
export type UserRolesType = (typeof USER_ROLES)[number];

export class UserRoleVO extends EnumVO<UserRolesType> {
  constructor(value: string) {
    super(value, USER_ROLES);
  }

  static create(id: string) {
    return new UserRoleVO(id);
  }

  static get teacher(): UserRoleVO {
    return new UserRoleVO('teacher');
  }

  static get student(): UserRoleVO {
    return new UserRoleVO('student');
  }

  static get admin(): UserRoleVO {
    return new UserRoleVO('admin');
  }
}

export class RoleInfoVO {
  private constructor(
    readonly role: UserRoleVO,
    readonly from: EffectiveDate | null,
    readonly performedBy: Id | null,
    readonly reason: Reason | null,
  ) {}

  static none() {
    return new RoleInfoVO(UserRoleVO.student, null, null, null);
  }

  static system(role: UserRoleVO) {
    return new RoleInfoVO(role, null, null, null);
  }

  static assigned(role: UserRoleVO, from: EffectiveDate, actor: Id, reason: Reason) {
    return new RoleInfoVO(role, from, actor, reason);
  }

  static rehydrate(
    role: UserRoleVO,
    from: EffectiveDate | null,
    assignedBy: Id | null,
    reason: Reason | null,
  ) {
    return new RoleInfoVO(role, from, assignedBy, reason);
  }

  equals(role: UserRoleVO): boolean {
    return this.role.value === role.value;
  }

  get isAdmin(): boolean {
    return this.role.value === 'admin';
  }

  get isTeacher(): boolean {
    return this.role.value === 'teacher';
  }

  get isStudent(): boolean {
    return this.role.value === 'student';
  }

  get isSystemAssigned(): boolean {
    return this.from === null && this.performedBy === null;
  }
}
