import { Student } from '../../domain/student/student';
import { Email } from '../../domain/student/value-objects/email';
import { StudentNumber } from '../../domain/student/value-objects/student-number';
import { PasswordHash } from '../../domain/student/value-objects/password-hash';
import { StudentOrmEntity } from './student-orm.entity';

export class StudentMapper {
  static toDomain(row: StudentOrmEntity): Student {
    return Student.create({
      id: row.id,
      name: row.name,
      email: Email.create(row.email),
      studentNumber: StudentNumber.create(row.studentNumber),
      passwordHash: PasswordHash.create(row.passwordHash),
    });
  }

  static toPersistence(student: Student): StudentOrmEntity {
    const row = new StudentOrmEntity();
    row.id = student.id;
    row.name = student.name;
    row.email = student.email.value;
    row.studentNumber = student.studentNumber.value;
    row.passwordHash = student.passwordHash.value;
    return row;
  }
}
