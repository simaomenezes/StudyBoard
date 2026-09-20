import { DomainError } from '../../shared/domain-error';

export class PasswordHash {
  private constructor(readonly value: string) {}

  static create(hash: string): PasswordHash {
    if (hash.trim().length === 0) {
      throw new DomainError('Password hash must not be empty');
    }
    return new PasswordHash(hash);
  }
}
