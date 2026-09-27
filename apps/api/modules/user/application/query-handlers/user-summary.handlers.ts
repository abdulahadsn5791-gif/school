import type {
  GetUserSummariesByIdsQuery,
  GetUserSummaryByIdQuery,
  UserSummaryReadModel,
} from '@ecomerece/domain';
import type { UserAppService } from '../user.app.service';

/**
 * Thin adapter over the user module's app service (infra.md Step 1). Reads run
 * at PUBLIC tier: deleted/banned/blocked users do not exist for other modules.
 */
export class GetUserSummaryByIdHandler {
  constructor(private readonly userAppService: UserAppService) {}

  async handle(query: GetUserSummaryByIdQuery): Promise<UserSummaryReadModel> {
    const user = await this.userAppService.getUserById(query.id);
    return {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      isDeleted: user.isDeleted,
    };
  }
}

export class GetUserSummariesByIdsHandler {
  constructor(private readonly userAppService: UserAppService) {}

  async handle(query: GetUserSummariesByIdsQuery): Promise<UserSummaryReadModel[]> {
    if (query.ids.length === 0) return [];
    const users = await this.userAppService.getUsersByIds(query.ids);
    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      isDeleted: user.isDeleted,
    }));
  }
}
