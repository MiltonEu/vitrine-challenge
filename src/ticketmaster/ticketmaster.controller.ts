import { Body, Controller, Post } from '@nestjs/common';
import { ExportEventsDto } from './ticketmaster.dto';
import { TicketMasterService } from './ticketmaster.service';

@Controller('ticketmaster')
export class TicketmasterController {
  constructor(private readonly ticketMasterService: TicketMasterService) {}

  @Post('export-csv')
  public async generateCsv(@Body() body: ExportEventsDto) {
    this.ticketMasterService.exportEventsToCsv(
      body.startDateTime,
      body.endDateTime,
      body.stateCode,
      body.segmentName,
    );
  }
}
