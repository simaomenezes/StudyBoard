import { DomainError } from './domain-error';

export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      throw new DomainError('Invalid email');
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
