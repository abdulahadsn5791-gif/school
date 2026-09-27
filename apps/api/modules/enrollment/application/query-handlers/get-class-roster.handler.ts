import type { GetClassRosterQuery } from '@ecomerece/domain';
import type { EnrollmentAppService } from '../enrollment.app.service';

/**
 * Cross-module roster read (new.md §6). Public tier; the CALLING module
 * authorizes the class before asking for its roster.
 */
export class GetClassRosterHandler {
  constructor(private readonly enrollmentAppService: EnrollmentAppService) {}

  async handle(query: GetClassRosterQuery) {
    return this.enrollmentAppService.getRosterForClass(query.classId);
  }
}
