import { BusinessHour } from '../restaurant/restaurant.types';

export interface ScanQRResponse {
  restaurant: {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contact: {
      phone: string;
      email: string;
    };
    businessHours: BusinessHour[];
    settings: {
      currency: string;
      language: string;
      timezone: string;
    };
    isCurrentlyOpen: boolean;
  };
  table: {
    id: string;
    number: string;
    name: string;
    capacity: number;
  };
} 