import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TicketMasterService } from './ticketmaster.service';
import { TicketmasterController } from './ticketmaster.controller';

@Module({
  imports: [HttpModule],
  providers: [TicketMasterService],
  exports: [TicketMasterService],
  controllers: [TicketmasterController],
})
export class TicketmasterModule {}
