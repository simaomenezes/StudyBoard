import { useState } from 'react';
import type { RegisterStudentInputPort } from '../../application/student/ports/in/register-student.input-port';
import type { RegisterStudentFormValues } from '../../infrastructure/student/register-student.schema';
import {
  toRegisterStudentInput,
  toRegisterStudentViewModel,
  type RegisterStudentViewModel,
} from './student.presenter';

export function useRegisterStudentController(port: RegisterStudentInputPort) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<RegisterStudentViewModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(values: RegisterStudentFormValues): Promise<boolean> {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const output = await port.execute(toRegisterStudentInput(values));
      setRegistered(toRegisterStudentViewModel(output));
      return true;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setRegistered(null);
    setServerError(null);
  }

  return { submit, reset, serverError, registered, isSubmitting };
}

export type RegisterStudentController = ReturnType<typeof useRegisterStudentController>;
