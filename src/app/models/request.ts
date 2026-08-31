export interface TourRequest {
  date: string | null;
  people: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  language: 'de' | 'en' | 'fr' | 'es';
  bus: boolean;
  pickUp: string;
}
