export type IQuery<TResult = unknown> = {
  readonly __result?: TResult;
};

/**
 * A query class with any constructor signature. Handlers own the concrete
 * parameter types; the bus only needs `constructor.name`-style identity.
 */
export type QueryConstructor<TQuery> = abstract new (...args: any[]) => TQuery;

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  handle(query: TQuery): Promise<TResult> | TResult;
}

export interface IQueryBus {
  register<TQuery extends IQuery<TResult>, TResult>(
    queryClass: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResult>,
  ): void;

  execute<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
