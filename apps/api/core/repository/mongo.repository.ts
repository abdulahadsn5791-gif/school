import type {
  FilterQuery,
  InsertManyOptions,
  Model,
  MongooseBulkWriteOptions,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

import { getCurrentSession } from '../database/transaction-context';
import { BaseRepository } from './base.repository';

export type CollationOptions = {
  locale: string;
  caseLevel?: boolean;
  caseFirst?: string;
  strength?: number;
  numericOrdering?: boolean;
  alternate?: string;
  maxVariable?: string;
  backwards?: boolean;
  normalization?: boolean;
};

export class MongoRepository<T> extends BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {
    super();
  }

  protected get session() {
    return getCurrentSession();
  }

  async create(data: Partial<T>) {
    const doc = new this.model(data);
    const saved = await doc.save({ session: this.session });

    return saved.toObject();
  }

  find(filter: FilterQuery<T>) {
    return this.model
      .find(filter)
      .session(this.session ?? null)
      .lean();
  }

  findOne(filter: FilterQuery<T>) {
    return this.model
      .findOne(filter)
      .session(this.session ?? null)
      .lean();
  }

  findById(id: string) {
    return this.model
      .findById(id)
      .session(this.session ?? null)
      .lean();
  }

  findByIdAndUpdate(id: string, data: UpdateQuery<T>, options: QueryOptions = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, {
      ...options,
      session: this.session,
    });
  }

  findOneAndUpdate(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ) {
    return this.model.findOneAndUpdate(filter, data, {
      ...options,
      session: this.session,
    });
  }

  updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>) {
    return this.model.updateOne(filter, data, {
      session: this.session,
    });
  }

  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>) {
    return this.model.updateMany(filter, data, {
      session: this.session,
    });
  }

  deleteOne(filter: FilterQuery<T>) {
    return this.model.deleteOne(filter, {
      session: this.session,
    });
  }

  deleteMany(filter: FilterQuery<T>) {
    return this.model.deleteMany(filter, {
      session: this.session,
    });
  }

  findByIdAndDelete(id: string) {
    return this.model.findByIdAndDelete(id).session(this.session ?? null);
  }

  count(filter: FilterQuery<T> = {}) {
    return this.model.countDocuments(filter).session(this.session ?? null);
  }

  exists(filter: FilterQuery<T>) {
    return this.model.exists(filter).session(this.session ?? null);
  }

  async paginate(params: { filter?: FilterQuery<T>; page?: number; limit?: number }) {
    const { page, limit } = this.normalizePagination({
      page: params.page,
      limit: params.limit,
    });

    const { skip } = this.buildOffsetFilter(page, limit);

    const filter = params.filter ?? {};

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .session(this.session ?? null)
        .lean(),

      this.model.countDocuments(filter).session(this.session ?? null),
    ]);

    return {
      data,
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  async paginateByCursor(params: {
    filter?: FilterQuery<T>;
    cursor?: string;
    limit?: number;
    direction?: 'next' | 'prev';
    collation?: CollationOptions;
  }) {
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));

    const filter: FilterQuery<T> = {
      ...(params.filter ?? {}),
      ...this.buildCursorFilter(params.cursor, params.direction),
    };

    let query = this.model.find(filter);
    if (params.collation) query = query.collation(params.collation);
    const docs = await query
      .sort({ _id: -1 })
      .limit(limit + 1)
      .session(this.session ?? null)
      .lean();

    return this.buildCursorMeta(docs, limit);
  }

  async upsert(filter: FilterQuery<T>, data: Partial<T>, setOnInsert: Partial<T> = {}) {
    return this.model
      .findOneAndUpdate(
        filter,
        {
          $set: data,
          $setOnInsert: setOnInsert,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          session: this.session ?? null,
        },
      )
      .lean();
  }

  /**
   * Keyset pagination sorted by a metric field (desc, tie-broken by `_id` asc)
   * or by `_id` alone for 'newest'/'oldest'. Tier-agnostic (new.md §7): the
   * CALLER composes the visibility filter (public/admin tier) into `filter`;
   * this helper only owns the cursor math. The shared `paginateByCursor`
   * (`_id` desc) stays untouched for the default case.
   */
  async paginateSortedBy(params: {
    filter?: FilterQuery<T>;
    sort?: { field: string; dir: 1 | -1 } | 'newest' | 'oldest';
    cursor?: string;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: T[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));
    const sort = params.sort ?? 'newest';
    const metric = typeof sort === 'object' ? sort : null;
    const sortField = metric ? metric.field : '_id';
    const dir: 1 | -1 = metric ? metric.dir : sort === 'oldest' ? 1 : -1;

    type Cursor = { v: unknown; id: string };
    const parseCursor = (raw?: string): Cursor | null => {
      if (!raw) return null;
      try {
        return JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as Cursor;
      } catch {
        return null;
      }
    };
    const encodeCursor = (v: unknown, id: string): string =>
      Buffer.from(JSON.stringify({ v, id })).toString('base64url');

    const baseFilter: FilterQuery<T> = params.filter ?? {};
    const filterFor = (cur: Cursor | null, goingForward: boolean): FilterQuery<T> => {
      if (!cur) return baseFilter;
      const extra = metric
        ? goingForward
          ? {
              $or: [{ [sortField]: { $lt: cur.v } }, { [sortField]: cur.v, _id: { $gt: cur.id } }],
            }
          : {
              $or: [{ [sortField]: { $gt: cur.v } }, { [sortField]: cur.v, _id: { $lt: cur.id } }],
            }
        : goingForward
          ? dir === -1
            ? { _id: { $lt: cur.v } }
            : { _id: { $gt: cur.v } }
          : dir === -1
            ? { _id: { $gt: cur.v } }
            : { _id: { $lt: cur.v } };
      return { ...baseFilter, ...(extra as object) } as FilterQuery<T>;
    };

    const forwardSort = metric
      ? ({ [sortField]: dir === -1 ? -1 : 1, _id: dir === -1 ? 1 : -1 } as Record<string, 1 | -1>)
      : { _id: dir };
    const reverseSort = metric
      ? ({ [sortField]: dir === -1 ? 1 : -1, _id: dir === -1 ? -1 : 1 } as Record<string, 1 | -1>)
      : { _id: (dir === -1 ? 1 : -1) as 1 | -1 };

    const cursor = parseCursor(params.cursor);
    const isPrev = params.direction === 'prev';

    const sortValueOf = (doc: T & { _id: string }): unknown =>
      metric ? ((doc as Record<string, unknown>)[sortField] ?? 0) : doc._id;

    if (!isPrev) {
      const docs = (await this.model
        .find(filterFor(cursor, true))
        .sort(forwardSort)
        .limit(limit + 1)
        .session(this.session ?? null)
        .lean()) as (T & { _id: string })[];
      const hasMore = docs.length > limit;
      const page = docs.slice(0, limit);
      const last = page[page.length - 1];
      const first = page[0];
      return {
        data: page,
        meta: {
          nextCursor: last && hasMore ? encodeCursor(sortValueOf(last), String(last._id)) : null,
          prevCursor: first ? encodeCursor(sortValueOf(first), String(first._id)) : null,
          hasMore,
        },
      };
    }

    const docs = (await this.model
      .find(filterFor(cursor, false))
      .sort(reverseSort)
      .limit(limit + 1)
      .session(this.session ?? null)
      .lean()) as (T & { _id: string })[];
    const hasMore = docs.length > limit;
    const page = docs.slice(0, limit).reverse();
    const last = page[page.length - 1];
    return {
      data: page,
      meta: {
        nextCursor: last && hasMore ? encodeCursor(sortValueOf(last), String(last._id)) : null,
        prevCursor: cursor ? encodeCursor(cursor.v, cursor.id) : null,
        hasMore,
      },
    };
  }

  /**
   * Execute a bulk write operation with an array of write operations.
   * @param operations - Array of write operations (e.g., `{ insertOne: { document } }`, `{ updateOne: { filter, update } }`)
   * @param options - Additional bulkWrite options (e.g., `{ ordered: false }`)
   * @returns The result of the bulk write.
   */
  async bulkWrite(operations: any[], options: MongooseBulkWriteOptions = {}) {
    return this.model.bulkWrite(operations, {
      ...options,
      session: this.session ?? undefined,
    });
  }

  /**
   * Insert many documents in a single batch.
   * @param documents - Array of documents (partial objects) to insert.
   * @param options - InsertMany options (e.g., `{ ordered: false }`)
   * @returns The array of inserted documents as plain objects.
   */
  async bulkCreate(documents: Partial<T>[], options: InsertManyOptions = {}) {
    const inserted = await this.model.insertMany(documents, {
      ...options,
      session: this.session ?? undefined,
    });
    // Return plain objects (lean)
    return inserted.map((doc) => doc.toObject());
  }
}
