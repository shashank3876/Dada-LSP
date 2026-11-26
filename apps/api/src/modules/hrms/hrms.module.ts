import { Module } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { HrmsController } from './hrms.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [HrmsController],
  providers: [HrmsService, PrismaService],
  exports: [HrmsService],
})
export class HrmsModule {}
