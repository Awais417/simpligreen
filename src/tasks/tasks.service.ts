import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { RejectTaskDto } from './dto/reject-task.dto';
import { ReassignTaskDto } from './dto/reassign-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}

  async create(jobId: string, managerId: string, dto: CreateTaskDto): Promise<Task> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.managerId !== managerId) throw new ForbiddenException('Not your job');

    // First task is immediately ACTIVE; others start PENDING
    const isFirst = dto.sequenceNumber === 1;
    const task = this.taskRepo.create({
      ...dto,
      jobId,
      status: isFirst ? TaskStatus.ACTIVE : TaskStatus.PENDING,
    });
    return this.taskRepo.save(task);
  }

  async findByJob(jobId: string): Promise<Task[]> {
    return this.taskRepo.find({
      where: { jobId },
      order: { sequenceNumber: 'ASC' },
    });
  }

  async findMyTasks(installerId: string): Promise<Task[]> {
    return this.taskRepo.find({
      where: { installerId, status: TaskStatus.ACTIVE },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async submit(taskId: string, installerId: string): Promise<Task> {
    const task = await this.findOne(taskId);
    if (task.installerId !== installerId) throw new ForbiddenException('Not your task');
    if (task.status !== TaskStatus.ACTIVE) {
      throw new BadRequestException('Task must be ACTIVE to submit');
    }
    task.status = TaskStatus.SUBMITTED;
    return this.taskRepo.save(task);
  }

  async approve(taskId: string, managerId: string): Promise<Task> {
    const task = await this.findOne(taskId);
    const job = await this.jobRepo.findOne({ where: { id: task.jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.managerId !== managerId) throw new ForbiddenException('Not your job');
    if (task.status !== TaskStatus.SUBMITTED) {
      throw new BadRequestException('Task must be SUBMITTED to approve');
    }

    task.status = TaskStatus.APPROVED;
    task.approvedAt = new Date();
    await this.taskRepo.save(task);

    // Activate the next sequential task
    const nextTask = await this.taskRepo.findOne({
      where: { jobId: task.jobId, sequenceNumber: task.sequenceNumber + 1 },
    });
    if (nextTask && nextTask.status === TaskStatus.PENDING) {
      nextTask.status = TaskStatus.ACTIVE;
      await this.taskRepo.save(nextTask);
    }

    return task;
  }

  async reject(taskId: string, managerId: string, dto: RejectTaskDto): Promise<Task> {
    const task = await this.findOne(taskId);
    const job = await this.jobRepo.findOne({ where: { id: task.jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.managerId !== managerId) throw new ForbiddenException('Not your job');
    if (task.status !== TaskStatus.SUBMITTED) {
      throw new BadRequestException('Task must be SUBMITTED to reject');
    }

    task.status = TaskStatus.ACTIVE; // back to active for re-submission
    task.managerComments = dto.comments;
    if (dto.newInstallerId) {
      task.installerId = dto.newInstallerId;
    }
    return this.taskRepo.save(task);
  }

  async reassign(taskId: string, managerId: string, dto: ReassignTaskDto): Promise<Task> {
    const task = await this.findOne(taskId);
    const job = await this.jobRepo.findOne({ where: { id: task.jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.managerId !== managerId) throw new ForbiddenException('Not your job');
    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot reassign tasks on a completed job');
    }

    task.installerId = dto.installerId;
    return this.taskRepo.save(task);
  }
}
