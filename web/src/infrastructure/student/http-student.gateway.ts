import { DomainError } from '../../domain/student/domain-error';
import { ConflictError } from '../../application/shared/conflict-error';
import type {
  GatewayRegisterInput,
  RegisteredStudent,
  StudentGateway,
} from '../../application/student/ports/out/student-gateway.port';

export function resolveApiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';
}

export class HttpStudentGateway implements StudentGateway {
  private readonly apiBase: string;

  constructor(apiBase: string = resolveApiBase()) {
    this.apiBase = apiBase;
  }

  async register(input: GatewayRegisterInput): Promise<RegisteredStudent> {
    const res = await fetch(`${this.apiBase}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      return (await res.json()) as RegisteredStudent;
    }

    let message = 'Registration failed. Please try again.';
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') message = body.message;
      else if (Array.isArray(body.message)) message = body.message.join(', ');
    } catch {
      if (res.status === 409) message = 'Email or student number already registered.';
    }

    if (res.status === 409) {
      throw new ConflictError(message);
    }
    throw new DomainError(message);
  }
}
