export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: "Economy" | "SUV" | "Luxury" | "Van" | "Minibus";
  transmission: "Manual" | "Automatic";
  fuel: "Gasoline" | "Diesel" | "Electric";
  seats: number;
  doors: number;
  ac: boolean;
  trunkLiters: number;
  pricePerDay: number;
  pricePerWeek: number;
  available: boolean;
  images: string[];
  description: string;
  features: string[];
  location: {
    zone: string;
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
}
