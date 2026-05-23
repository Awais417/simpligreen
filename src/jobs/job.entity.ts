import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JobStatus {
  IN_PROGRESS = 'in_progress',
  PENDING_QA = 'pending_qa',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  adminId: string;

  @Column({ type: 'uuid' })
  managerId: string;

  @Column({ type: 'uuid' })
  qaId: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.IN_PROGRESS })
  status: JobStatus;

  @Column({ type: 'text', nullable: true })
  qaComments: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
