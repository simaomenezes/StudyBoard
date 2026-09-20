import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Student } from '../../../domain/student/student';
import { Email } from '../../../domain/student/value-objects/email';
import { StudentNumber } from '../../../domain/student/value-objects/student-number';
import { PasswordHash } from '../../../domain/student/value-objects/password-hash';
import { DomainError } from '../../../domain/shared/domain-error';
import { ConflictError } from '../../shared/conflict-error';
import {
  RegisterStudentInput,
  RegisterStudentInputPort,
  RegisterStudentOutput,
} from '../ports/in/register-student.input-port';
import { PasswordHasher } from '../ports/out/password-hasher.port';
import {
  STUDENT_REPOSITORY,
  type StudentRepositoryToken,
} from '../../../infrastructure/di/tokens';
import { PASSWORD_HASHER } from '../../../infrastructure/di/tokens';

@Injectable()
export class RegisterStudentUseCase implements RegisterStudentInputPort {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly students: StudentRepositoryToken,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: RegisterStudentInput): Promise<RegisterStudentOutput> {
    if (input.password.length < 8) {
      throw new DomainError('Password must have at least 8 characters');
    }

    const email = Email.create(input.email);
    const studentNumber = StudentNumber.create(input.studentNumber);

    if (await this.students.findByEmail(email.value)) {
      throw new ConflictError('Email already registered');
    }
    if (await this.students.findByStudentNumber(studentNumber.value)) {
      throw new ConflictError('Student number already registered');
    }

    const hash = await this.hasher.hash(input.password);
    const student = Student.create({
      id: randomUUID(),
      name: input.name,
      email,
      studentNumber,
      passwordHash: PasswordHash.create(hash),
    });

    await this.students.save(student);

    return {
      id: student.id,
      name: student.name,
      email: student.email.value,
      studentNumber: student.studentNumber.value,
    };
  }
}
