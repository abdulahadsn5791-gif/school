import { AsyncLocalStorage } from 'node:async_hooks';
import { UnauthorizedError } from '../../errors/app-error';
import type { Actor } from './actor';

/** Same pattern as the transaction context: one store per request. */
export const actorContext = new AsyncLocalStorage<Actor>();

export function getActor(): Actor | null {
  return actorContext.getStore() ?? null;
}

export function requireActor(): Actor {
  const actor = getActor();
  if (!actor) throw new UnauthorizedError('An authenticated actor is required.');
  return actor;
}

export async function runWithActor<T>(actor: Actor, fn: () => Promise<T>): Promise<T> {
  return actorContext.run(actor, fn);
}
