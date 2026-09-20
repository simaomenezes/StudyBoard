import { DomainError } from '../shared/domain-error';
import { Email } from './value-objects/email';
import { StudentNumber } from './value-objects/student-number';
import { PasswordHash } from './value-objects/password-hash';

export interface StudentProps {
  id: string;
  name: string;
  email: Email;
  studentNumber: StudentNumber;
  passwordHash: PasswordHash;
}

export class Student {
  private constructor(readonly props: StudentProps) {}

  static create(props: StudentProps): Student {
    if (props.name.trim().length === 0) {
      throw new DomainError('Student name must not be empty');
    }
    return new Student(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get studentNumber(): StudentNumber {
    return this.props.studentNumber;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }
}
