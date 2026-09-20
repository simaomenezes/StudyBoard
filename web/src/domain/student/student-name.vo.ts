import { DomainError } from './domain-error';

export class StudentName {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): StudentName {
    const normalized = raw.trim();
    if (normalized.length === 0) {
      throw new DomainError('Student name must not be empty');
    }
    return new StudentName(normalized);
  }
}
