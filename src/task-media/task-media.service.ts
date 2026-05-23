import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskMedia, FileType } from './task-media.entity';
import { Task, TaskStatus } from '../tasks/task.entity';
import { InstallerType } from '../installer-types/installer-type.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class TaskMediaService {
  constructor(
    @InjectRepository(TaskMedia)
    private readonly mediaRepo: Repository<TaskMedia>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(InstallerType)
    private readonly typeRepo: Repository<InstallerType>,
    private readonly s3: S3Service,
  ) {}

  async upload(
    taskId: string,
    installerId: string,
    file: Express.Multer.File,
    fileType: FileType,
  ): Promise<TaskMedia> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.installerId !== installerId) throw new ForbiddenException('Not your task');
    if (task.status !== TaskStatus.ACTIVE) {
      throw new BadRequestException('Can only upload media to ACTIVE tasks');
    }

    // Enforce certificate requirement
    if (fileType === FileType.CERTIFICATE && task.installerTypeId) {
      const type = await this.typeRepo.findOne({ where: { id: task.installerTypeId } });
      if (type && !type.requiresCertificate) {
        throw new BadRequestException('This installer type does not require certificates');
      }
    }

    const folder = fileType === FileType.IMAGE ? 'task-images' : 'task-certificates';
    const { key, url } = await this.s3.uploadFile(file, folder);

    const media = this.mediaRepo.create({
      taskId,
      fileKey: key,
      fileUrl: url,
      fileType,
      originalName: file.originalname,
    });
    return this.mediaRepo.save(media);
  }

  async findByTask(taskId: string): Promise<TaskMedia[]> {
    return this.mediaRepo.find({
      where: { taskId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async remove(mediaId: string, installerId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    const task = await this.taskRepo.findOne({ where: { id: media.taskId } });
    if (!task || task.installerId !== installerId) {
      throw new ForbiddenException('Not your media');
    }

    await this.s3.deleteFile(media.fileKey);
    await this.mediaRepo.remove(media);
  }
}
