import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallerType } from './installer-type.entity';
import { CreateInstallerTypeDto } from './dto/create-installer-type.dto';
import { UpdateInstallerTypeDto } from './dto/update-installer-type.dto';

@Injectable()
export class InstallerTypesService {
  constructor(
    @InjectRepository(InstallerType)
    private readonly repo: Repository<InstallerType>,
  ) {}

  async create(dto: CreateInstallerTypeDto): Promise<InstallerType> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Installer type already exists');
    const type = this.repo.create(dto);
    return this.repo.save(type);
  }

  findAll(): Promise<InstallerType[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<InstallerType> {
    const type = await this.repo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Installer type not found');
    return type;
  }

  async update(id: string, dto: UpdateInstallerTypeDto): Promise<InstallerType> {
    const type = await this.findOne(id);
    Object.assign(type, dto);
    return this.repo.save(type);
  }

  async remove(id: string): Promise<void> {
    const type = await this.findOne(id);
    await this.repo.remove(type);
  }
}
