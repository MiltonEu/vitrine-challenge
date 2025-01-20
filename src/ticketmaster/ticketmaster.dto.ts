import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ExportEventsDto {
  @IsDateString()
  @IsOptional()
  startDateTime: string = '2025-02-01T00:00:00Z';

  @IsDateString()
  @IsOptional()
  endDateTime: string = '2025-06-30T23:59:59Z';

  @IsString()
  @IsOptional()
  stateCode: string = 'QC';

  @IsString()
  @IsOptional()
  segmentName: string;
}
