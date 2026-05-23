import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Task } from '../tasks/task.entity';
import { TaskMedia } from '../task-media/task-media.entity';
import { User } from '../users/entities/user.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Task, TaskMedia, User])],
  controllers: [JobsController],
  providers: [JobsService, PdfService],
  exports: [JobsService],
})
export class JobsModule {}
