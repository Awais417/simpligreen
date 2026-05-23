import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { message: 'User created', data: this.usersService.sanitize(user) };
  }

  @Get()
  @ApiOperation({ summary: 'List all users, optionally filter by role (Admin only)' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  async findAll(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);
    return { message: 'Users fetched', data: users.map(u => this.usersService.sanitize(u)) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return { message: 'User fetched', data: this.usersService.sanitize(user) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    return { message: 'User updated', data: this.usersService.sanitize(user) };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active/suspended status (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.toggleStatus(id);
    return {
      message: `User ${user.isActive ? 'activated' : 'suspended'}`,
      data: this.usersService.sanitize(user),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted', data: null };
  }
}
