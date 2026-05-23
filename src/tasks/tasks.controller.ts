import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { RejectTaskDto } from './dto/reject-task.dto';
import { ReassignTaskDto } from './dto/reassign-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ── Manager: create task under a job ─────────────────
  @Post('jobs/:jobId/tasks')
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a task inside a job (Manager only)' })
  @ApiParam({ name: 'jobId', type: 'string' })
  async create(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTaskDto,
  ) {
    const data = await this.tasksService.create(jobId, user.id, dto);
    return { message: 'Task created', data };
  }

  // ── Manager / QA: list tasks for a job ───────────────
  @Get('jobs/:jobId/tasks')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.QA)
  @ApiOperation({ summary: 'List all tasks for a job (Admin/Manager/QA)' })
  @ApiParam({ name: 'jobId', type: 'string' })
  async findByJob(@Param('jobId', ParseUUIDPipe) jobId: string) {
    const data = await this.tasksService.findByJob(jobId);
    return { message: 'Tasks fetched', data };
  }

  // ── Installer: list own active tasks ─────────────────
  @Get('tasks/my-tasks')
  @Roles(UserRole.INSTALLER)
  @ApiOperation({ summary: 'Get active tasks assigned to me (Installer only)' })
  async myTasks(@CurrentUser() user: User) {
    const data = await this.tasksService.findMyTasks(user.id);
    return { message: 'My tasks fetched', data };
  }

  // ── All: get single task ──────────────────────────────
  @Get('tasks/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.INSTALLER, UserRole.QA)
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.tasksService.findOne(id);
    return { message: 'Task fetched', data };
  }

  // ── Installer: submit task ────────────────────────────
  @Post('tasks/:id/submit')
  @Roles(UserRole.INSTALLER)
  @ApiOperation({ summary: 'Submit task for manager review (Installer only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.tasksService.submit(id, user.id);
    return { message: 'Task submitted for review', data };
  }

  // ── Manager: approve task ─────────────────────────────
  @Post('tasks/:id/approve')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve submitted task — unlocks next task (Manager only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.tasksService.approve(id, user.id);
    return { message: 'Task approved', data };
  }

  // ── Manager: reject task ──────────────────────────────
  @Post('tasks/:id/reject')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Reject submitted task with mandatory feedback (Manager only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RejectTaskDto,
  ) {
    const data = await this.tasksService.reject(id, user.id, dto);
    return { message: 'Task rejected, returned to installer', data };
  }

  // ── Manager: reassign task installer ─────────────────
  @Patch('tasks/:id/reassign')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Reassign task to a different installer (Manager only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async reassign(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ReassignTaskDto,
  ) {
    const data = await this.tasksService.reassign(id, user.id, dto);
    return { message: 'Task reassigned', data };
  }
}
