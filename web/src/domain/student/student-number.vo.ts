import { DomainError } from './domain-error';

export class StudentNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): StudentNumber {
    const normalized = raw.trim();
    if (normalized.length === 0) {
      throw new DomainError('Student number must not be empty');
    }
    return new StudentNumber(normalized);
  }

  equals(other: StudentNumber): boolean {
    return this.value === other.value;
  }
}
