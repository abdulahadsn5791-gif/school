import type { GetSubjectsByIdsQuery } from '@ecomerece/domain';
import type { SubjectAppService } from '../subject.app.service';

/** Thin adapter over the subject module's app service (new.md §4/§6). */
export class GetSubjectsByIdsHandler {
  constructor(private readonly subjectAppService: SubjectAppService) {}

  async handle(query: GetSubjectsByIdsQuery) {
    return this.subjectAppService.getSubjectsByIds(query.ids);
  }
}
