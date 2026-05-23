import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { QaDecisionDto } from './dto/qa-decision.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly repo: Repository<Job>,
  ) {}

  async create(adminId: string, dto: CreateJobDto): Promise<Job> {
    const job = this.repo.create({ ...dto, adminId });
    return this.repo.save(job);
  }

  async findAll(userId: string, role: UserRole): Promise<Job[]> {
    if (role === UserRole.ADMIN) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    if (role === UserRole.MANAGER) {
      return this.repo.find({ where: { managerId: userId }, order: { createdAt: 'DESC' } });
    }
    if (role === UserRole.QA) {
      return this.repo.find({ where: { qaId: userId }, order: { createdAt: 'DESC' } });
    }
    throw new ForbiddenException('Installers do not have job-level access');
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Job> {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    this.assertAccess(job, userId, role);
    return job;
  }

  async submitToQa(jobId: string, managerId: string): Promise<Job> {
    const job = await this.repo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.managerId !== managerId) throw new ForbiddenException('Not your job');
    if (job.status !== JobStatus.IN_PROGRESS) {
      throw new BadRequestException('Job must be in_progress to submit to QA');
    }
    job.status = JobStatus.PENDING_QA;
    return this.repo.save(job);
  }

  async qaApprove(jobId: string, qaId: string, dto: QaDecisionDto): Promise<Job> {
    const job = await this.repo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.qaId !== qaId) throw new ForbiddenException('Not your assignment');
    if (job.status !== JobStatus.PENDING_QA) {
      throw new BadRequestException('Job must be pending_qa for QA review');
    }
    job.status = JobStatus.COMPLETED;
    job.qaComments = dto.comments ?? null;
    job.completedAt = new Date();
    return this.repo.save(job);
  }

  async qaReject(jobId: string, qaId: string, dto: QaDecisionDto): Promise<Job> {
    const job = await this.repo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.qaId !== qaId) throw new ForbiddenException('Not your assignment');
    if (job.status !== JobStatus.PENDING_QA) {
      throw new BadRequestException('Job must be pending_qa for QA review');
    }
    if (!dto.comments) throw new BadRequestException('Rejection requires comments');
    job.status = JobStatus.IN_PROGRESS;
    job.qaComments = dto.comments;
    return this.repo.save(job);
  }

  private assertAccess(job: Job, userId: string, role: UserRole): void {
    if (role === UserRole.ADMIN) return;
    if (role === UserRole.MANAGER && job.managerId === userId) return;
    if (role === UserRole.QA && job.qaId === userId) return;
    throw new ForbiddenException('Access denied to this job');
  }
}
