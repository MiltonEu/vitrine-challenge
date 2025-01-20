export interface TicketMasterEvent {
  address: string;
  eventId: string;
  imageUrl: string;
  title: string;
  startDate: string;
  venueName: string;
}

export interface EventData {
  events: TicketMasterEvent[];
  pageInfo: {
    number: number;
    totalPages: number;
  };
}
