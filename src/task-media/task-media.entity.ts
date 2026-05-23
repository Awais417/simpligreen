import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum FileType {
  IMAGE = 'image',
  CERTIFICATE = 'certificate',
}

@Entity('task_media')
export class TaskMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @Column({ length: 500 })
  fileKey: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ type: 'enum', enum: FileType })
  fileType: FileType;

  @Column({ length: 255 })
  originalName: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
