export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  studentNumber: string;
}

export interface RegisterStudentOutput {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
}

export interface RegisterStudentInputPort {
  execute(input: RegisterStudentInput): Promise<RegisterStudentOutput>;
}
