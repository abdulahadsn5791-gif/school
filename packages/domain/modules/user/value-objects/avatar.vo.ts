import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import type { EffectiveDate, UrlVO } from '../../../value-objects';

/**
 * Avatar image attached to a user account.
 *
 * `publicId` is the provider storage key (Cloudinary public_id) so the
 * application layer can delete the image from storage when it is replaced or
 * cleared. External URLs carry no `publicId`.
 */
export class AvatarVO {
  private constructor(
    readonly url: UrlVO | null,
    readonly publicId: string | null,
    readonly createdOn: EffectiveDate | null,
  ) {}

  static create(url: UrlVO, publicId: string | null, createdOn: EffectiveDate): AvatarVO {
    if (!url) throw new BadRequestError('Avatar URL is required.');
    if (!publicId) throw new BadRequestError('Avatar publicId is required.');
    return new AvatarVO(url, publicId, createdOn);
  }

  static fromUrl(url: UrlVO): AvatarVO {
    return new AvatarVO(url, null, null);
  }

  static none(): AvatarVO {
    return new AvatarVO(null, null, null);
  }

  static rehydrate(
    url: UrlVO | null,
    publicId: string | null,
    createdOn: EffectiveDate | null,
  ): AvatarVO {
    return new AvatarVO(url, publicId, createdOn);
  }

  get isEmpty(): boolean {
    return this.url === null;
  }

  toObject(): { url: string | null; publicId: string | null; createdOn: Date | null } {
    return {
      url: this.url?.value ?? null,
      publicId: this.publicId,
      createdOn: this.createdOn?.value ?? null,
    };
  }
}
