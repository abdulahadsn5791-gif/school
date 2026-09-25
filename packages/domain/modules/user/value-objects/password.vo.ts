import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import { StringVO } from '../../../value-objects';

const ARGON2_PREFIX = '$argon2id$';

/**
 * Validates an already-hashed password (argon2id output from `Bun.password`).
 *
 * The aggregate only ever sees the hash — the plaintext password is hashed and
 * verified in the application layer where the (impure) crypto lives.
 */
export class PasswordVO extends StringVO {
  constructor(value: string) {
    super(value);

    if (!PasswordVO.isValid(value)) {
      throw new BadRequestError('Stored password hash is invalid.');
    }
  }

  static isValid(value: string): boolean {
    if (typeof value !== 'string') return false;
    if (!value.startsWith(ARGON2_PREFIX)) return false;
    if (value.length < 20) return false;
    if (value.length > 300) return false;
    return true;
  }

  static create(hash: string) {
    return new PasswordVO(hash);
  }

  static rehydrate(hash: string) {
    return new PasswordVO(hash);
  }
}
