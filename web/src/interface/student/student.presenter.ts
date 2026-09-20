import type { RegisterStudentOutput } from '../../application/student/ports/in/register-student.input-port';
import type { RegisterStudentInput } from '../../application/student/ports/in/register-student.input-port';
import type { RegisterStudentFormValues } from '../../infrastructure/student/register-student.schema';

export interface RegisterStudentViewModel {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
}

export function toRegisterStudentInput(values: RegisterStudentFormValues): RegisterStudentInput {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    studentNumber: values.studentNumber,
  };
}

export function toRegisterStudentViewModel(output: RegisterStudentOutput): RegisterStudentViewModel {
  return {
    id: output.id,
    name: output.name,
    email: output.email,
    studentNumber: output.studentNumber,
  };
}
