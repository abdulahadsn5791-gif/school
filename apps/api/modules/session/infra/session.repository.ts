import type { Id, ISessionRepository, SessionAggregate } from '@ecomerece/domain';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { SessionMapper } from './session.mapper';
import { RefreshTokenModel, type RefreshTokenPersistence } from './session.models';

export class SessionRepository
  extends MongoRepository<RefreshTokenPersistence>
  implements ISessionRepository
{
  constructor() {
    super(RefreshTokenModel);
  }

  async FindById(id: Id): Promise<SessionAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return SessionMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<SessionAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Session not found.');
    return SessionMapper.persistenceToAggregate(doc);
  }

  async FindByUserId(userId: Id): Promise<SessionAggregate[]> {
    const docs = await super.find({ userId: userId.value });
    return docs.map((doc) => SessionMapper.persistenceToAggregate(doc));
  }

  async FindActiveByUserId(userId: Id): Promise<SessionAggregate[]> {
    const docs = await super.find({
      userId: userId.value,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    return docs.map((doc) => SessionMapper.persistenceToAggregate(doc));
  }

  async Save(session: SessionAggregate): Promise<void> {
    const { _id, ...data } = SessionMapper.aggregateToPersistence(session);
    await RefreshTokenModel.updateOne({ _id }, { $set: data });
  }

  async Create(session: SessionAggregate): Promise<void> {
    const doc = new RefreshTokenModel(SessionMapper.aggregateToPersistence(session));
    await doc.save({ session: this.session });
  }

  async RevokeAllForUser(userId: Id): Promise<number> {
    const result = await RefreshTokenModel.updateMany(
      { userId: userId.value, revokedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { revokedAt: new Date() } },
    ).session(this.session ?? null);
    return result.modifiedCount ?? 0;
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }
}
