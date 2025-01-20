import { lastValueFrom } from 'rxjs';
import { EventData, TicketMasterEvent } from './ticketmaster.const';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { sleep } from '../utils/promise.utils';
import * as fastCsv from 'fast-csv';
import { createWriteStream } from 'fs';

const eventsBaseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
const pageSizeDefaultValue = 200;

@Injectable()
export class TicketMasterService {
  constructor(private readonly httpService: HttpService) {}

  public async exportEventsToCsv(
    startDateTime: string,
    endDateTime: string,
    stateCode: string,
    segmentName: string | undefined,
  ): Promise<void> {
    const events = await this.searchEvents(
      startDateTime,
      endDateTime,
      stateCode,
      segmentName,
    );

    return this.buildCsv(events);
  }

  private buildAddress(event: any): string {
    return [
      event._embedded?.venues?.[0]?.address?.line1,
      event._embedded?.venues?.[0]?.city?.name,
      event._embedded?.venues?.[0]?.state?.name,
      event._embedded?.venues?.[0]?.country?.name,
    ]
      .filter((part) => part)
      .join(', ');
  }

  private buildCsv(events: TicketMasterEvent[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = './events.csv';
      const csvStream = fastCsv.format({ headers: true, writeBOM: true });

      const writableStream = createWriteStream(filePath, { encoding: 'utf-8' });

      writableStream.on('finish', () => {
        console.log(`CSV file has been written to ${filePath}`);
        resolve();
      });

      writableStream.on('error', (error) => {
        console.error('Error writing CSV file:', error);
        reject(error);
      });

      csvStream.pipe(writableStream);

      events.forEach((event) => {
        csvStream.write({
          eventId: event.eventId,
          title: event.title,
          startDate: event.startDate,
          address: event.address,
          imageUrl: event.imageUrl,
        });
      });

      csvStream.end();
    });
  }

  private buildDate(event: any): string {
    return (
      [event.dates?.start?.localDate, event.dates?.start?.localTime]
        .filter((part) => part)
        .join(' ') || null
    );
  }

  private async fetchEventsForInterval(
    interval: { start: string; end: string },
    stateCode: string,
    segmentName: string | undefined,
    currentPage: number,
  ): Promise<EventData> {
    const response = await lastValueFrom(
      this.httpService.get(eventsBaseUrl, {
        params: {
          startDateTime: interval.start,
          endDateTime: interval.end,
          segmentName,
          apikey: process.env.TICKETMASTER_API_KEY,
          stateCode,
          size: pageSizeDefaultValue,
          page: currentPage,
        },
      }),
    );
    return this.extractEventData(response);
  }

  private extractEventData(response: any): EventData {
    const data = response.data;
    const events = (data._embedded?.events || []).map((event: any) => ({
      eventId: event.id,
      title: event.name,
      startDate: this.buildDate(event),
      venueName: event._embedded?.venues?.[0]?.name || null,
      address: this.buildAddress(event),
      imageUrl: this.getLargestImage(event),
    }));
    const pageInfo = data.page || {};

    return { events, pageInfo };
  }

  private getDateIntervals(
    startDateTime: string,
    endDateTime: string,
    intervalGapInDays: string,
  ): { start: string; end: string }[] {
    const intervals: { start: string; end: string }[] = [];
    let start = new Date(startDateTime);
    const end = new Date(endDateTime);

    const intervalDuration =
      parseInt(intervalGapInDays, 10) * 24 * 60 * 60 * 1000;

    while (start < end) {
      const intervalEnd = new Date(
        Math.min(start.getTime() + intervalDuration, end.getTime()),
      );
      intervals.push({
        start: start.toISOString().split('.')[0] + 'Z',
        end: intervalEnd.toISOString().split('.')[0] + 'Z',
      });
      start = new Date(intervalEnd.getTime() + 1);
    }

    return intervals;
  }

  private getLargestImage(event: any): string | null {
    if (!event.images || event.images.length === 0) {
      return null;
    }

    const largestImage = event.images.reduce((largest: any, current: any) => {
      const currentWidth = current?.width || 0;
      const largestWidth = largest?.width || 0;

      return currentWidth > largestWidth ? current : largest;
    }, null);

    return largestImage?.url || null;
  }

  private async searchEvents(
    startDateTime: string,
    endDateTime: string,
    stateCode: string,
    segmentName: string | undefined,
  ): Promise<TicketMasterEvent[]> {
    const allEvents: TicketMasterEvent[] = [];
    const dateIntervals = this.getDateIntervals(
      startDateTime,
      endDateTime,
      '7',
    );

    for (const interval of dateIntervals) {
      let currentPage = 0;
      let totalPages = 1;

      while (currentPage < totalPages) {
        try {
          const { events, pageInfo } = await this.fetchEventsForInterval(
            interval,
            stateCode,
            segmentName,
            currentPage,
          );

          allEvents.push(...events);

          currentPage = pageInfo.number + 1;
          totalPages = pageInfo.totalPages;

          console.log(
            `Fetched page ${currentPage}/${totalPages} for range ${interval.start} to ${interval.end}`,
          );

          await sleep(1000);
        } catch (error) {
          if (
            error?.response?.data?.fault?.errorcode ===
            'policies.ratelimit.SpikeArrestViolation'
          ) {
            console.error('Rate limit exceeded. Waiting before retrying');
            await sleep(1000);
            continue;
          } else {
            console.error(
              `Error fetching page ${currentPage} for range ${interval.start} to ${interval.end}:`,
              error.response?.data || error.message,
            );
            break;
          }
        }
      }
    }

    return allEvents;
  }
}
