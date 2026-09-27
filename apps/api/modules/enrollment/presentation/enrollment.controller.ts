import {
  createEnrollmentDto,
  deleteEnrollmentDto,
  enrollmentIdDto,
  getClassRosterDto,
  getEnrollmentsDto,
  getStudentNameIndexDto,
  idSchema,
  updateEnrollmentDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { EnrollmentAppService } from '../application/enrollment.app.service';

export class EnrollmentController extends BaseController<EnrollmentAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createEnrollmentDto);
    return this.created(c, await this.service.createEnrollment(data, actor));
  };

  getEnrollmentById = async (c: Context) => {
    const enrollmentId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getEnrollment(enrollmentId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getEnrollmentsDto);
    return this.ok(c, await this.service.listEnrollments(query));
  };

  roster = async (c: Context) => {
    const actor = requireActor();
    const query = this.query(c, getClassRosterDto);
    return this.ok(c, await this.service.getClassRoster(query, actor));
  };

  /** Composed screen (new.md §6): batched student names across classes. */
  studentNameIndex = async (c: Context) => {
    const actor = requireActor();
    const classIds = (this.query(c, getStudentNameIndexDto).classIds ?? '').trim();
    if (!classIds) return this.ok(c, []);
    return this.ok(
      c,
      await this.service.getStudentNameIndex(
        classIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
        actor,
      ),
    );
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateEnrollmentDto);
    return this.ok(c, await this.service.updateEnrollment(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteEnrollmentDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, enrollmentIdDto);
    return this.ok(c, await this.service.recover(data.enrollmentId, actor));
  };
}
