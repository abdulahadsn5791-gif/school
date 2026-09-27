import type { GetClassesByIdsQuery } from '@ecomerece/domain';
import type { ClassAppService } from '../class.app.service';

/** Thin adapter over the class module's app service (new.md §4/§6). */
export class GetClassesByIdsHandler {
  constructor(private readonly classAppService: ClassAppService) {}

  async handle(query: GetClassesByIdsQuery) {
    return this.classAppService.getClassesByIds(query.ids);
  }
}
