import { Module } from '@nestjs/common';
import { TicketmasterModule } from './ticketmaster/ticketmaster.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), TicketmasterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
