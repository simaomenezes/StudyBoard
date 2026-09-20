export interface GatewayRegisterInput {
  name: string;
  email: string;
  password: string;
  studentNumber: string;
}

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
}

export interface StudentGateway {
  register(input: GatewayRegisterInput): Promise<RegisteredStudent>;
}
