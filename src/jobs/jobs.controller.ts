import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { PdfService } from './pdf.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QaDecisionDto } from './dto/qa-decision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly pdfService: PdfService,
  ) {}

  // ── Admin ──────────────────────────────────────────────
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job and assign Manager + QA (Admin only)' })
  async create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    const data = await this.jobsService.create(user.id, dto);
    return { message: 'Job created', data };
  }

  // ── Admin / Manager / QA ───────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.QA)
  @ApiOperation({ summary: 'List jobs (Admin: all | Manager/QA: own assignments)' })
  async findAll(@CurrentUser() user: User) {
    const data = await this.jobsService.findAll(user.id, user.role);
    return { message: 'Jobs fetched', data };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.QA)
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const data = await this.jobsService.findOne(id, user.id, user.role);
    return { message: 'Job fetched', data };
  }

  @Get(':id/pdf')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Download full job PDF report (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const job = await this.jobsService.findOne(id, user.id, user.role);
    const buffer = await this.pdfService.generateJobReport(job);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="job-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  // ── Manager ────────────────────────────────────────────
  @Post(':id/submit-to-qa')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Submit completed job to QA (Manager only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async submitToQa(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.jobsService.submitToQa(id, user.id);
    return { message: 'Job submitted to QA', data };
  }

  // ── QA ─────────────────────────────────────────────────
  @Post(':id/qa-approve')
  @Roles(UserRole.QA)
  @ApiOperation({ summary: 'QA approves job — marks as COMPLETED' })
  @ApiParam({ name: 'id', type: 'string' })
  async qaApprove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: QaDecisionDto,
  ) {
    const data = await this.jobsService.qaApprove(id, user.id, dto);
    return { message: 'Job approved by QA', data };
  }

  @Post(':id/qa-reject')
  @Roles(UserRole.QA)
  @ApiOperation({ summary: 'QA rejects job — returns to Manager (comments required)' })
  @ApiParam({ name: 'id', type: 'string' })
  async qaReject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: QaDecisionDto,
  ) {
    const data = await this.jobsService.qaReject(id, user.id, dto);
    return { message: 'Job rejected by QA, returned to manager', data };
  }
}
