export interface Tour {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  thumbnailUrl: string;
  duration: number;
  maxPersons: number;
  price: number;
  priceForeign: number;
  startingPoint: {
    lat: number;
    lng: number;
    location: string;
  };
}
