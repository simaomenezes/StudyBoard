import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('students')
export class StudentOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'student_number', unique: true })
  studentNumber!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;
}
