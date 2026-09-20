import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from './infrastructure/di/student.module';
import { StudentOrmEntity } from './infrastructure/persistence/student-orm.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'studyboard',
      password: process.env.DB_PASSWORD ?? 'studyboard',
      database: process.env.DB_NAME ?? 'studyboard',
      entities: [StudentOrmEntity],
      synchronize: process.env.DB_SYNC === 'true',
    }),
    StudentModule,
  ],
})
export class AppModule {}
