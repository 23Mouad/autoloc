export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  { id: "centre-ville", name: "Centre-ville Annaba", lat: 36.9042, lng: 7.7668 },
  { id: "aeroport", name: "Aéroport Annaba-Rabah Bitat", lat: 36.8222, lng: 7.8092 },
  { id: "gare", name: "Gare Ferroviaire d'Annaba", lat: 36.9003, lng: 7.7599 },
  { id: "seraidi", name: "Seraïdi", lat: 36.9617, lng: 7.6783 },
  { id: "el-bouni", name: "El Bouni", lat: 36.8979, lng: 7.7472 },
  { id: "sidi-amar", name: "Sidi Amar", lat: 36.8761, lng: 7.7281 },
];
