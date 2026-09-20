import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterStudentUseCase } from '../../application/student/use-cases/register-student.use-case';
import { StudentController } from '../../interface/controllers/student.controller';
import { StudentOrmEntity } from '../persistence/student-orm.entity';
import { TypeOrmStudentRepository } from '../persistence/typeorm-student.repository';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { PASSWORD_HASHER, STUDENT_REPOSITORY } from './tokens';

@Module({
  imports: [TypeOrmModule.forFeature([StudentOrmEntity])],
  controllers: [StudentController],
  providers: [
    RegisterStudentUseCase,
    { provide: STUDENT_REPOSITORY, useClass: TypeOrmStudentRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
  exports: [STUDENT_REPOSITORY],
})
export class StudentModule {}
