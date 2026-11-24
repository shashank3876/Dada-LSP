import { Module } from '@nestjs/common';
import { NbfcService } from './nbfc.service';
import { NbfcController } from './nbfc.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [NbfcController],
  providers: [NbfcService, PrismaService],
  exports: [NbfcService],
})
export class NbfcModule {}
