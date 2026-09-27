import type { ActorTier, Id, UserRolesType } from '@ecomerece/domain';
import { ForbiddenError } from '../../errors/app-error';

export type { ActorTier };

export interface ActorProps {
  readonly id: Id;
  readonly role: UserRolesType;
  readonly tier: ActorTier;
  /** teachers/students: their school; admins: chosen scope. null until user.schoolId lands. */
  readonly schoolId: Id | null;
}

/**
 * The request's process context. Built once by auth middleware, threaded as the
 * FIRST parameter of every app-service method, and stored in AsyncLocalStorage
 * for code that cannot take the parameter (event handlers, deep internals).
 */
export class Actor {
  readonly id: Id;
  readonly role: UserRolesType;
  readonly tier: ActorTier;
  readonly schoolId: Id | null;

  constructor(props: ActorProps) {
    this.id = props.id;
    this.role = props.role;
    this.tier = props.tier;
    this.schoolId = props.schoolId;
  }

  /** Route-level elevation: adminMiddleware upgrades the tier for admin routes. */
  withTier(tier: ActorTier): Actor {
    return new Actor({ id: this.id, role: this.role, tier, schoolId: this.schoolId });
  }

  assertAdmin(): void {
    if (this.role !== 'admin') {
      throw new ForbiddenError('Administrator access is required for this action.');
    }
  }

  assertRole(role: UserRolesType): void {
    if (this.role !== role) {
      throw new ForbiddenError(`This action requires the ${role} role.`);
    }
  }

  assertRoleIn(...roles: UserRolesType[]): void {
    if (!roles.includes(this.role)) {
      throw new ForbiddenError(`This action requires one of the ${roles.join('/')} roles.`);
    }
  }
}
