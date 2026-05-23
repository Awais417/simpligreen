import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { TaskMediaService } from './task-media.service';
import { FileType } from './task-media.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Task Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks/:taskId/media')
export class TaskMediaController {
  constructor(private readonly service: TaskMediaService) {}

  @Post()
  @Roles(UserRole.INSTALLER)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image or certificate for a task (Installer only)' })
  @ApiParam({ name: 'taskId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'fileType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: ['image', 'certificate'] },
      },
    },
  })
  async upload(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: string,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!Object.values(FileType).includes(fileType as FileType)) {
      throw new BadRequestException('fileType must be "image" or "certificate"');
    }
    const data = await this.service.upload(taskId, user.id, file, fileType as FileType);
    return { message: 'File uploaded successfully', data };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.INSTALLER, UserRole.QA)
  @ApiOperation({ summary: 'List all media files for a task' })
  @ApiParam({ name: 'taskId', type: 'string' })
  async findByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    const data = await this.service.findByTask(taskId);
    return { message: 'Media fetched', data };
  }

  @Delete(':mediaId')
  @Roles(UserRole.INSTALLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media file (Installer only, task must be ACTIVE)' })
  @ApiParam({ name: 'taskId', type: 'string' })
  @ApiParam({ name: 'mediaId', type: 'string' })
  async remove(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser() user: User,
  ) {
    await this.service.remove(mediaId, user.id);
    return { message: 'Media deleted', data: null };
  }
}
