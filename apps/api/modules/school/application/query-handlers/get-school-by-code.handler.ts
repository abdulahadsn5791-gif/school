import type { GetSchoolByCodeQuery } from '@ecomerece/domain';
import type { SchoolAppService } from '../school.app.service';

/** Human-key resolution for sibling modules (new.md §5). */
export class GetSchoolByCodeHandler {
  constructor(private readonly schoolAppService: SchoolAppService) {}

  async handle(query: GetSchoolByCodeQuery): Promise<{ id: string } | null> {
    const id = await this.schoolAppService.resolveSchoolByCode(query.code);
    return id ? { id: id.value } : null;
  }
}
