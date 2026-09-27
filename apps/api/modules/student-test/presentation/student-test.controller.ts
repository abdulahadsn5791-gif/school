import {
  createStudentTestDto,
  deleteStudentTestDto,
  getStudentTestsDto,
  gradeStudentTestDto,
  idSchema,
  markMissedDto,
  submitStudentTestDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { StudentTestAppService } from '../application/student-test.app.service';

export class StudentTestController extends BaseController<StudentTestAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createStudentTestDto);
    return this.created(c, await this.service.createSubmission(data, actor));
  };

  submit = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, submitStudentTestDto);
    return this.ok(c, await this.service.submit(data, actor));
  };

  grade = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, gradeStudentTestDto);
    return this.ok(c, await this.service.grade(data, actor));
  };

  markMissed = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, markMissedDto);
    return this.ok(c, await this.service.markMissed(data, actor));
  };

  getSubmissionById = async (c: Context) => {
    const submissionId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getSubmission(submissionId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getStudentTestsDto);
    return this.ok(c, await this.service.listSubmissions(query, requireActor()));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteStudentTestDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };
}
