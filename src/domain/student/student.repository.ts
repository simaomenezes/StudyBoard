import { Student } from './student';

export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByStudentNumber(studentNumber: string): Promise<Student | null>;
  save(student: Student): Promise<void>;
}
