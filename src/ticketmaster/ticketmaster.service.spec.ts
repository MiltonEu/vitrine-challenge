import { TicketMasterService } from './ticketmaster.service';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';

describe(TicketMasterService.name, () => {
  let ticketMasterService: TicketMasterService;
  let httpService: HttpService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketMasterService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketMasterService = module.get<TicketMasterService>(TicketMasterService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe(TicketMasterService.prototype.exportEventsToCsv.name, () => {
    it('should search for events with correct parameters', async () => {
      const getMethod = jest.spyOn(httpService, 'get');

      await ticketMasterService.exportEventsToCsv(
        '2025-02-01T00:00:00Z',
        '2025-06-30T23:59:59Z',
        'QC',
        'Music',
      );

      expect(getMethod).toHaveBeenNthCalledWith(
        1,
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: undefined,
            endDateTime: '2025-02-08T00:00:00Z',
            page: 0,
            segmentName: 'Music',
            size: 50,
            startDateTime: '2025-02-01T00:00:00Z',
            stateCode: 'QC',
          },
        },
      );
    });
  });
});
