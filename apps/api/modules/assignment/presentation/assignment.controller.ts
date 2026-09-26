import {
  assignmentIdDto,
  createAssignmentDto,
  deleteAssignmentDto,
  getAssignmentsDto,
  idSchema,
  updateAssignmentDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { AssignmentAppService } from '../application/assignment.app.service';

export class AssignmentController extends BaseController<AssignmentAppService> {
  create = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createAssignmentDto);
    return this.created(c, await this.service.createAssignment(data, actor));
  };

  getAssignmentById = async (c: Context) => {
    const assignmentId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getAssignment(assignmentId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getAssignmentsDto);
    return this.ok(c, await this.service.listAssignments(query));
  };

  update = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateAssignmentDto);
    return this.ok(c, await this.service.updateAssignment(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteAssignmentDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, assignmentIdDto);
    return this.ok(c, await this.service.recover(data.assignmentId, actor));
  };
}
