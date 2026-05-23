import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
  PENDING = 'pending',       // blocked by previous task
  ACTIVE = 'active',         // installer can work on it
  SUBMITTED = 'submitted',   // installer submitted, awaiting manager
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  jobId: string;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({ type: 'uuid' })
  installerId: string;

  @Column({ type: 'uuid', nullable: true })
  installerTypeId: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'text', nullable: true })
  managerComments: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
