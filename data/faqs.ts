export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "Comment réserver une voiture ?",
    answer: "Vous pouvez réserver directement sur notre site en choisissant votre voiture, vos dates et votre lieu de prise en charge. Vous pouvez aussi nous contacter par téléphone ou WhatsApp.",
  },
  {
    id: "2",
    question: "La livraison est-elle gratuite ?",
    answer: "Oui, la livraison est gratuite dans le centre-ville d'Annaba. Des frais supplémentaires peuvent s'appliquer pour les zones éloignées.",
  },
  {
    id: "3",
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons le paiement en espèces et par CCP. Le paiement se fait à la prise en charge du véhicule.",
  },
  {
    id: "4",
    question: "Les véhicules sont-ils assurés ?",
    answer: "Oui, tous nos véhicules sont assurés tous risques. Une franchise peut s'appliquer en cas de sinistre responsable.",
  },
  {
    id: "5",
    question: "Quelle est la durée minimale de location ?",
    answer: "La durée minimale de location est de 24 heures. Des tarifs dégressifs sont proposés pour les locations longue durée.",
  },
];
