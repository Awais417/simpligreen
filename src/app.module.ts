import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { S3Module } from './s3/s3.module';
import { InstallerTypesModule } from './installer-types/installer-types.module';
import { JobsModule } from './jobs/jobs.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskMediaModule } from './task-media/task-media.module';

@Module({
  imports: [
    // Config – loads .env globally
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // TypeORM – PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        ssl:
          config.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    TerminusModule,
    HttpModule,
    AuthModule,
    UsersModule,
    HealthModule,
    S3Module,
    InstallerTypesModule,
    JobsModule,
    TasksModule,
    TaskMediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
