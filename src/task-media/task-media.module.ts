import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskMedia } from './task-media.entity';
import { Task } from '../tasks/task.entity';
import { InstallerType } from '../installer-types/installer-type.entity';
import { TaskMediaService } from './task-media.service';
import { TaskMediaController } from './task-media.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskMedia, Task, InstallerType]), S3Module],
  controllers: [TaskMediaController],
  providers: [TaskMediaService],
})
export class TaskMediaModule {}
