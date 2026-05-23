import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { InstallerTypesService } from './installer-types.service';
import { CreateInstallerTypeDto } from './dto/create-installer-type.dto';
import { UpdateInstallerTypeDto } from './dto/update-installer-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Installer Types (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('installer-types')
export class InstallerTypesController {
  constructor(private readonly service: InstallerTypesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create installer type (Admin only)' })
  async create(@Body() dto: CreateInstallerTypeDto) {
    const data = await this.service.create(dto);
    return { message: 'Installer type created', data };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'List all installer types' })
  async findAll() {
    const data = await this.service.findAll();
    return { message: 'Installer types fetched', data };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get installer type by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Installer type fetched', data };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update installer type (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstallerTypeDto,
  ) {
    const data = await this.service.update(id, dto);
    return { message: 'Installer type updated', data };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete installer type (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { message: 'Installer type deleted', data: null };
  }
}
