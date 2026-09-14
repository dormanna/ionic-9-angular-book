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

// What the API reads from a typed sentence. null: the
// sentence does not say.
export interface Draft {
  people: number | null;
  date: string | null;
  bus: boolean | null;
  pickUp: string | null;
  language: TourRequest['language'] | null;
  firstName: string | null;
  lastName: string | null;
  time: string | null;
}
