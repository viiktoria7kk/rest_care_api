import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class PermissionsModule {}
