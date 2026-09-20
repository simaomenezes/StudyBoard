import { RegisterStudentUseCase } from './register-student.use-case';
import { Student } from '../../../domain/student/student';
import { StudentRepository } from '../../../domain/student/student.repository';
import { DomainError } from '../../../domain/shared/domain-error';
import { ConflictError } from '../../shared/conflict-error';

class InMemoryStudentRepository implements StudentRepository {
  readonly items = new Map<string, Student>();

  async findById(id: string): Promise<Student | null> {
    return this.items.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const target = email.trim().toLowerCase();
    for (const s of this.items.values()) {
      if (s.email.value === target) return s;
    }
    return null;
  }

  async findByStudentNumber(studentNumber: string): Promise<Student | null> {
    const target = studentNumber.trim();
    for (const s of this.items.values()) {
      if (s.studentNumber.value === target) return s;
    }
    return null;
  }

  async save(student: Student): Promise<void> {
    this.items.set(student.id, student);
  }
}

describe('RegisterStudentUseCase', () => {
  it('registers a student and never exposes the password hash', async () => {
    const repo = new InMemoryStudentRepository();
    const useCase = new RegisterStudentUseCase(repo, {
      hash: async (plain: string) => `hashed:${plain}`,
    });

    const out = await useCase.execute({
      name: 'Ada Lovelace',
      email: 'Ada@Example.com',
      password: 'secret123',
      studentNumber: 'S-001',
    });

    expect(out.email).toBe('ada@example.com');
    expect(out.studentNumber).toBe('S-001');
    expect(out).not.toHaveProperty('passwordHash');
    expect(out).not.toHaveProperty('password');

    const stored = await repo.findByEmail('ada@example.com');
    expect(stored?.passwordHash.value).toBe('hashed:secret123');
  });

  it('rejects duplicate email', async () => {
    const repo = new InMemoryStudentRepository();
    const useCase = new RegisterStudentUseCase(repo, {
      hash: async () => 'hashed',
    });

    await useCase.execute({
      name: 'A',
      email: 'a@example.com',
      password: 'secret123',
      studentNumber: 'S-001',
    });

    await expect(
      useCase.execute({
        name: 'B',
        email: 'a@example.com',
        password: 'secret123',
        studentNumber: 'S-002',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects duplicate student number and short passwords', async () => {
    const repo = new InMemoryStudentRepository();
    const useCase = new RegisterStudentUseCase(repo, {
      hash: async () => 'hashed',
    });

    await useCase.execute({
      name: 'A',
      email: 'a@example.com',
      password: 'secret123',
      studentNumber: 'S-001',
    });

    await expect(
      useCase.execute({
        name: 'B',
        email: 'b@example.com',
        password: 'secret123',
        studentNumber: 'S-001',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      useCase.execute({
        name: 'C',
        email: 'c@example.com',
        password: 'short',
        studentNumber: 'S-003',
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
