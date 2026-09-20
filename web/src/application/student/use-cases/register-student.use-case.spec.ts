import { describe, expect, it } from 'vitest';
import { RegisterStudentUseCase } from './register-student.use-case';
import { ConflictError } from '../../shared/conflict-error';
import { DomainError } from '../../../domain/student/domain-error';
import type {
  GatewayRegisterInput,
  RegisteredStudent,
  StudentGateway,
} from '../ports/out/student-gateway.port';

class StubGateway implements StudentGateway {
  lastInput: GatewayRegisterInput | null = null;

  async register(input: GatewayRegisterInput): Promise<RegisteredStudent> {
    this.lastInput = input;
    return {
      id: 'id-1',
      name: input.name,
      email: input.email,
      studentNumber: input.studentNumber,
    };
  }
}

describe('RegisterStudentUseCase (web)', () => {
  it('normalizes input through domain VOs before calling the gateway', async () => {
    const gateway = new StubGateway();
    const useCase = new RegisterStudentUseCase(gateway);

    const out = await useCase.execute({
      name: '  Ada Lovelace  ',
      email: 'Ada@Example.COM ',
      password: 'secret123',
      studentNumber: ' S-001 ',
    });

    expect(gateway.lastInput).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
      studentNumber: 'S-001',
    });
    expect(out).toEqual({
      id: 'id-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      studentNumber: 'S-001',
    });
  });

  it('rejects invalid input without calling the gateway', async () => {
    const gateway = new StubGateway();
    const useCase = new RegisterStudentUseCase(gateway);

    await expect(
      useCase.execute({ name: 'A', email: 'not-an-email', password: 'secret123', studentNumber: 'S-1' }),
    ).rejects.toBeInstanceOf(DomainError);
    await expect(
      useCase.execute({ name: 'A', email: 'a@example.com', password: 'short', studentNumber: 'S-1' }),
    ).rejects.toBeInstanceOf(DomainError);
    expect(gateway.lastInput).toBeNull();
  });

  it('passes gateway conflicts through', async () => {
    const failing: StudentGateway = {
      register: async () => {
        throw new ConflictError('Email already registered');
      },
    };
    const useCase = new RegisterStudentUseCase(failing);

    await expect(
      useCase.execute({ name: 'A', email: 'a@example.com', password: 'secret123', studentNumber: 'S-1' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
