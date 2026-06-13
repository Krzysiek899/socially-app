import type { DiscoverCategoryCode, DiscoverEvent } from '../../discover/domain/discoverModels.ts';

export type AuthoredEvent = DiscoverEvent;

export type CreateEventPayload = {
  title: string;
  description: string;
  dateTime: string;
  category: DiscoverCategoryCode;
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  price: {
    amount: number;
    currency: 'PLN';
    isFree: boolean;
  };
};

export type GeocodeResult = {
  id: string;
  label: string;
  location: {
    lat: number;
    lng: number;
  };
  address: {
    city: string;
    street: string;
    buildingNumber: string;
    postalCode?: string;
  };
};
