import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { RegisterStudentDto } from '../dtos/register-student.dto';
import { RegisterStudentUseCase } from '../../application/student/use-cases/register-student.use-case';
import { DomainError } from '../../domain/shared/domain-error';
import { ConflictError } from '../../application/shared/conflict-error';

@Controller('students')
export class StudentController {
  constructor(
    @Inject(RegisterStudentUseCase)
    private readonly registerStudent: RegisterStudentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterStudentDto) {
    try {
      return await this.registerStudent.execute(dto);
    } catch (err) {
      if (err instanceof ConflictError) {
        throw new ConflictException(err.message);
      }
      if (err instanceof DomainError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
