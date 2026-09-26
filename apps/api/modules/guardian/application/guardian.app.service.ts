import {
  GuardianAggregate,
  type GuardianReadModel,
  Id,
  type IEventBus,
  type IGuardianRepository,
  type ISchoolRepository,
  NameInfoVO,
  PersonName,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateGuardianType,
  DeleteGuardianType,
  GetGuardiansType,
  UpdateGuardianType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { GuardianMapper } from '../infra/guardian.mapper';
import { GuardianMessages } from '../presentation/guardian.messages';

export class GuardianAppService {
  constructor(
    private readonly guardianRepo: IGuardianRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
  ) {}

  private async publishEvents(guardian: GuardianAggregate): Promise<void> {
    const events = guardian.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  private createName(name: CreateGuardianType['name']): NameInfoVO {
    return NameInfoVO.create(
      PersonName.create(name.firstName),
      name.middleName ? PersonName.create(name.middleName) : null,
      name.lastName ? PersonName.create(name.lastName) : null,
    );
  }

  async createGuardian(
    data: CreateGuardianType,
    _actor: { _id: string },
  ): Promise<GuardianReadModel> {
    const schoolId = Id.create(data.schoolId);
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }

    const existing = await this.guardianRepo.FindByPhone(schoolId, data.phone);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A guardian with this phone number already exists for this school.');
    }

    const guardian = GuardianAggregate.create({
      id: Id.create(),
      schoolId,
      name: this.createName(data.name),
      phone: data.phone,
      email: data.email ?? null,
      occupation: data.occupation ?? null,
      userId: data.userId ? Id.create(data.userId) : null,
    });

    await this.guardianRepo.Create(guardian);
    await this.publishEvents(guardian);
    return GuardianMapper.aggregateToReadModel(guardian);
  }

  async updateGuardian(
    data: UpdateGuardianType,
    _actor: { _id: string },
  ): Promise<GuardianReadModel> {
    const guardian = await this.guardianRepo.FindByIdOrThrow(Id.create(data.guardianId));
    if (guardian.isDeleted) throw new NotFoundError('Guardian not found.');

    guardian.updateProfile(
      data.name ? this.createName(data.name) : undefined,
      data.phone,
      data.email,
      data.occupation,
    );

    await this.guardianRepo.Save(guardian);
    await this.publishEvents(guardian);
    return GuardianMapper.aggregateToReadModel(guardian);
  }

  async getGuardian(guardianId: string): Promise<GuardianReadModel> {
    const guardian = await this.guardianRepo.FindByIdOrThrow(Id.create(guardianId));
    return GuardianMapper.aggregateToReadModel(guardian);
  }

  async listGuardians(query: GetGuardiansType): Promise<{
    data: GuardianReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { 'name.fullName': { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const result = await this.guardianRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((guardian) => GuardianMapper.aggregateToReadModel(guardian)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteGuardianType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const guardianId = Id.create(data.guardianId);
    const guardian = await this.guardianRepo.FindByIdOrThrow(guardianId);
    guardian.delete(actorId, Reason.create(data.reason));
    await this.guardianRepo.Save(guardian);
    await this.publishEvents(guardian);
    return GuardianMessages.delete(guardianId, actorId).message;
  }

  async recover(guardianId: string, _actor: { _id: string }): Promise<GuardianReadModel> {
    const guardian = await this.guardianRepo.FindByIdOrThrow(Id.create(guardianId));
    guardian.recover();
    await this.guardianRepo.Save(guardian);
    await this.publishEvents(guardian);
    return GuardianMapper.aggregateToReadModel(guardian);
  }
}
