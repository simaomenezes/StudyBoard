import { DomainError } from '../../../domain/student/domain-error';
import { Email } from '../../../domain/student/email.vo';
import { StudentName } from '../../../domain/student/student-name.vo';
import { StudentNumber } from '../../../domain/student/student-number.vo';
import { Student } from '../../../domain/student/student';
import type {
  RegisterStudentInput,
  RegisterStudentInputPort,
  RegisterStudentOutput,
} from '../ports/in/register-student.input-port';
import type { StudentGateway } from '../ports/out/student-gateway.port';

export class RegisterStudentUseCase implements RegisterStudentInputPort {
  private readonly gateway: StudentGateway;

  constructor(gateway: StudentGateway) {
    this.gateway = gateway;
  }

  async execute(input: RegisterStudentInput): Promise<RegisterStudentOutput> {
    if (input.password.length < 8) {
      throw new DomainError('Password must have at least 8 characters');
    }

    const student = Student.create({
      name: StudentName.create(input.name),
      email: Email.create(input.email),
      studentNumber: StudentNumber.create(input.studentNumber),
    });

    const registered = await this.gateway.register({
      name: student.name.value,
      email: student.email.value,
      password: input.password,
      studentNumber: student.studentNumber.value,
    });

    return {
      id: registered.id,
      name: registered.name,
      email: registered.email,
      studentNumber: registered.studentNumber,
    };
  }
}
