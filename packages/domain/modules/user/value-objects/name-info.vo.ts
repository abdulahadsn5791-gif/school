import type { PersonName } from '../../../value-objects';

export class NameInfoVO {
  private constructor(
    readonly firstName: PersonName,
    readonly middleName: PersonName | null,
    readonly lastName: PersonName | null,
    readonly fullName: string,
  ) {}

  static create(firstName: PersonName, middleName: PersonName | null, lastName: PersonName | null) {
    const fullName = [firstName, middleName, lastName]
      .filter((name): name is PersonName => name !== null)
      .map((name) => name.value)
      .join(' ');
    return new NameInfoVO(firstName, middleName, lastName, fullName);
  }

  static rehydrate(
    firstName: PersonName,
    middleName: PersonName | null,
    lastName: PersonName | null,
    fullName: string,
  ) {
    return new NameInfoVO(firstName, middleName, lastName, fullName);
  }
}
