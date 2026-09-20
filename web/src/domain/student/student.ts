import type { Email } from './email.vo';
import type { StudentName } from './student-name.vo';
import type { StudentNumber } from './student-number.vo';

export interface StudentProps {
  name: StudentName;
  email: Email;
  studentNumber: StudentNumber;
}

export class Student {
  readonly props: StudentProps;

  private constructor(props: StudentProps) {
    this.props = props;
  }

  static create(props: StudentProps): Student {
    return new Student(props);
  }

  get name(): StudentName {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get studentNumber(): StudentNumber {
    return this.props.studentNumber;
  }
}
