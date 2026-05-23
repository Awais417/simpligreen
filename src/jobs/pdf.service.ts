import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { Job } from './job.entity';
import { Task } from '../tasks/task.entity';
import { TaskMedia } from '../task-media/task-media.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskMedia)
    private readonly mediaRepo: Repository<TaskMedia>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateJobReport(job: Job): Promise<Buffer> {
    const tasks = await this.taskRepo.find({
      where: { jobId: job.id },
      order: { sequenceNumber: 'ASC' },
    });

    const [manager, qa] = await Promise.all([
      this.userRepo.findOne({ where: { id: job.managerId } }),
      this.userRepo.findOne({ where: { id: job.qaId } }),
    ]);

    const mediaByTask = new Map<string, TaskMedia[]>();
    for (const task of tasks) {
      const media = await this.mediaRepo.find({ where: { taskId: task.id } });
      mediaByTask.set(task.id, media);
    }

    const installerIds = [...new Set(tasks.map(t => t.installerId).filter(Boolean))];
    const installers = await Promise.all(
      installerIds.map(id => this.userRepo.findOne({ where: { id } })),
    );
    const installerMap = new Map(installers.filter(Boolean).map(u => [u!.id, u!]));

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Job Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Metadata
      doc.fontSize(12).font('Helvetica-Bold').text('Job Details');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Job ID: ${job.id}`);
      doc.text(`Title: ${job.title}`);
      if (job.description) doc.text(`Description: ${job.description}`);
      doc.text(`Status: ${job.status}`);
      doc.text(`Created: ${job.createdAt.toISOString()}`);
      if (job.completedAt) doc.text(`Completed: ${job.completedAt.toISOString()}`);
      doc.moveDown();

      // Stakeholders
      doc.fontSize(12).font('Helvetica-Bold').text('Stakeholders');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Manager: ${manager ? `${manager.firstName} ${manager.lastName}` : job.managerId}`);
      doc.text(`QA Engineer: ${qa ? `${qa.firstName} ${qa.lastName}` : job.qaId}`);
      if (job.qaComments) doc.text(`QA Comments: ${job.qaComments}`);
      doc.moveDown();

      // Tasks
      doc.fontSize(12).font('Helvetica-Bold').text('Task Ledger');
      doc.moveDown(0.3);

      for (const task of tasks) {
        const installer = installerMap.get(task.installerId);
        const media = mediaByTask.get(task.id) ?? [];

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);

        doc.font('Helvetica-Bold').fontSize(11)
          .text(`Task #${task.sequenceNumber}: ${task.status.toUpperCase()}`);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Task ID: ${task.id}`);
        doc.text(`Description: ${task.description}`);
        doc.text(`Installer: ${installer ? `${installer.firstName} ${installer.lastName}` : task.installerId}`);
        if (task.managerComments) doc.text(`Manager Comments: ${task.managerComments}`);

        const images = media.filter(m => m.fileType === 'image');
        const certs = media.filter(m => m.fileType === 'certificate');

        if (images.length > 0) {
          doc.text(`Images uploaded: ${images.map(m => m.originalName).join(', ')}`);
        }
        if (certs.length > 0) {
          doc.text(`Certificates uploaded: ${certs.map(m => m.originalName).join(', ')}`);
        }
        doc.moveDown(0.5);
      }

      // QA Sign-off
      if (job.status === 'completed' || job.status === 'pending_qa') {
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(12).font('Helvetica-Bold').text('QA Sign-off');
        doc.font('Helvetica').fontSize(10);
        doc.text(`Final Status: ${job.status}`);
        if (job.qaComments) doc.text(`QA Decision Comments: ${job.qaComments}`);
        if (job.completedAt) doc.text(`Finalized At: ${job.completedAt.toISOString()}`);
      }

      doc.end();
    });
  }
}
