import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../domain/student/student';
import { StudentRepository } from '../../domain/student/student.repository';
import { StudentOrmEntity } from './student-orm.entity';
import { StudentMapper } from './student.mapper';

@Injectable()
export class TypeOrmStudentRepository implements StudentRepository {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private readonly repo: Repository<StudentOrmEntity>,
  ) {}

  async findById(id: string): Promise<Student | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? StudentMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const row = await this.repo.findOneBy({ email: email.trim().toLowerCase() });
    return row ? StudentMapper.toDomain(row) : null;
  }

  async findByStudentNumber(studentNumber: string): Promise<Student | null> {
    const row = await this.repo.findOneBy({ studentNumber: studentNumber.trim() });
    return row ? StudentMapper.toDomain(row) : null;
  }

  async save(student: Student): Promise<void> {
    await this.repo.save(StudentMapper.toPersistence(student));
  }
}
