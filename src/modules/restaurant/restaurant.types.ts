export interface BusinessHour {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  open: string;
  close: string;
  isClosed: boolean;
}

export interface RestaurantSettings {
  currency?: string;
  language?: string;
  timezone?: string;
  tableCount?: number;
}

export interface UpdateRestaurantDto {
  name?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
  };
  businessHours?: BusinessHour[];
  settings?: RestaurantSettings;
} 