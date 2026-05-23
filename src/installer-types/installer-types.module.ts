import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallerType } from './installer-type.entity';
import { InstallerTypesService } from './installer-types.service';
import { InstallerTypesController } from './installer-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstallerType])],
  controllers: [InstallerTypesController],
  providers: [InstallerTypesService],
  exports: [InstallerTypesService],
})
export class InstallerTypesModule {}
