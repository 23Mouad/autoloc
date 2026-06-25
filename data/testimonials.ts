export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Yassine B.",
    rating: 5,
    text: "Service impeccable ! La voiture était propre, en parfait état, et livrée à l'heure. Je recommande AutoLoc à tous mes amis à Annaba.",
    date: "2025-01-15",
  },
  {
    id: "2",
    name: "Meriem K.",
    rating: 5,
    text: "J'ai loué une Tucson pour un week-end à Seraïdi. Expérience formidable, prix raisonnable et équipe très professionnelle.",
    date: "2025-02-20",
  },
  {
    id: "3",
    name: "Hichem L.",
    rating: 4,
    text: "Très bon rapport qualité-prix. Le processus de réservation est simple et rapide. La livraison gratuite en centre-ville est un vrai plus !",
    date: "2025-03-05",
  },
];
