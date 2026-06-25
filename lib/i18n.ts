export type Locale = "en" | "fr" | "ar";

export interface Translations {
  // Navbar
  nav_home: string;
  nav_cars: string;
  nav_services: string;
  nav_about: string;
  nav_contact: string;
  // Hero
  hero_title_1: string;
  hero_title_2: string;
  hero_stat_vehicles: string;
  hero_stat_vehicles_label: string;
  hero_stat_clients: string;
  hero_stat_clients_label: string;
  hero_description: string;
  hero_cta: string;
  // Search
  search_location: string;
  search_location_all: string;
  search_pickup: string;
  search_return: string;
  search_btn: string;
  // Featured
  featured_title: string;
  featured_subtitle: string;
  featured_book: string;
  // How it works
  how_title: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;
  // Why us
  why_title: string;
  why_1: string;
  why_1_desc: string;
  why_2: string;
  why_2_desc: string;
  why_3: string;
  why_3_desc: string;
  why_4: string;
  why_4_desc: string;
  // CTA
  cta_title: string;
  cta_subtitle: string;
  cta_btn: string;
  cta_phone: string;
  // Car Card
  card_available: string;
  card_unavailable: string;
  card_seats: string;
  card_per_day: string;
  card_details: string;
  card_book: string;
  // Filters
  filter_category: string;
  filter_price: string;
  filter_transmission: string;
  filter_all: string;
  filter_seats: string;
  filter_available_only: string;
  filter_sort: string;
  filter_reset: string;
  sort_popular: string;
  sort_price_asc: string;
  sort_price_desc: string;
  sort_newest: string;
  // Car Detail
  detail_back: string;
  detail_specs: string;
  detail_features: string;
  detail_per_day: string;
  detail_per_week: string;
  detail_book_btn: string;
  detail_unavailable: string;
  detail_booking_sent: string;
  detail_similar: string;
  // About
  about_title: string;
  about_subtitle: string;
  about_hero_heading: string;
  about_hero_sub: string;
  about_story_title: string;
  about_story: string;
  about_story_p2: string;
  about_numbers_title: string;
  about_stat_vehicles: string;
  about_stat_clients: string;
  about_stat_years: string;
  about_stat_zones: string;
  about_team_title: string;
  about_team_subtitle: string;
  about_values_title: string;
  about_val1_title: string;
  about_val1_text: string;
  about_val2_title: string;
  about_val2_text: string;
  about_val3_title: string;
  about_val3_text: string;
  // Cars browse
  cars_page_title: string;
  cars_page_subtitle: string;
  cars_filters_btn: string;
  // Contact
  contact_title: string;
  contact_subtitle: string;
  contact_form_title: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_subject: string;
  contact_message: string;
  contact_send: string;
  contact_success: string;
  contact_whatsapp: string;
  contact_hours_weekday: string;
  contact_hours_weekend: string;
  contact_address: string;
  // Map
  map_filter: string;
  map_all: string;
  map_available_only: string;
  map_view_details: string;
  map_book: string;
  map_close: string;
  map_per_day: string;
  // Footer
  footer_tagline: string;
  footer_links: string;
  footer_cars: string;
  footer_contact: string;
  footer_rights: string;
  // Testimonials
  testimonials_title: string;
  // Theme
  theme_dark: string;
  theme_light: string;
  // Misc
  currency: string;
  verified_client: string;
  // Auth
  auth_login: string;
  auth_signup: string;
  auth_login_title: string;
  auth_login_email: string;
  auth_login_password: string;
  auth_login_btn: string;
  auth_login_forgot: string;
  auth_no_account: string;
  auth_has_account: string;
  auth_register_title: string;
  auth_role_renter: string;
  auth_role_renter_desc: string;
  auth_role_customer: string;
  auth_role_customer_desc: string;
  auth_renter_type_title: string;
  auth_renter_store: string;
  auth_renter_store_desc: string;
  auth_renter_own: string;
  auth_renter_own_desc: string;
  auth_coming_soon: string;
  auth_form_firstname: string;
  auth_form_lastname: string;
  auth_form_phone: string;
  auth_form_email: string;
  auth_form_password: string;
  auth_form_wilaya: string;
  auth_form_store_location: string;
  auth_form_store_placeholder: string;
  auth_form_register_btn: string;
  auth_back: string;
  auth_step: string;
  auth_or: string;
}

export const en: Translations = {
  nav_home: "Home",
  nav_cars: "Cars",
  nav_services: "Our Services",
  nav_about: "About",
  nav_contact: "Contact Us",
  hero_title_1: "Rent the best",
  hero_title_2: "cars",
  hero_stat_vehicles: "20+",
  hero_stat_vehicles_label: "Types of vehicles",
  hero_stat_clients: "1.2k+",
  hero_stat_clients_label: "Clients served",
  hero_description: "We want you to have a stress-free rental experience, so we make it easy to hire a car — by providing simple search tools, customer reviews and plenty of pick-up locations across Annaba.",
  hero_cta: "Open Catalog",
  search_location: "Choose a location",
  search_location_all: "All zones",
  search_pickup: "Pick-up date",
  search_return: "Return date",
  search_btn: "Search",
  featured_title: "Top Picks in Annaba",
  featured_subtitle: "Our most popular vehicles, ready for delivery.",
  featured_book: "Book Now",
  how_title: "How It Works",
  how_step1_title: "Choose Your Car",
  how_step1_desc: "Browse our collection and find the perfect vehicle for your trip.",
  how_step2_title: "Book Online",
  how_step2_desc: "Select your dates and complete the reservation in minutes.",
  how_step3_title: "Pick Up & Drive",
  how_step3_desc: "Collect at the chosen location or we deliver to you for free.",
  why_title: "Why Choose Us",
  why_1: "Free Delivery",
  why_1_desc: "Free delivery and pickup in Annaba city center.",
  why_2: "24/7 Support",
  why_2_desc: "Our team is available around the clock for any emergency.",
  why_3: "Best Prices",
  why_3_desc: "Competitive rates with no hidden fees.",
  why_4: "Well-Maintained Fleet",
  why_4_desc: "All cars are regularly serviced and cleaned.",
  cta_title: "Ready to Hit the Road?",
  cta_subtitle: "Book your car today and enjoy a premium driving experience in Annaba.",
  cta_btn: "Browse Cars",
  cta_phone: "Or call us",
  card_available: "Available",
  card_unavailable: "Unavailable",
  card_seats: "seats",
  card_per_day: "DZD / day",
  card_details: "Details",
  card_book: "Book",
  filter_category: "Category",
  filter_price: "Price Range",
  filter_transmission: "Transmission",
  filter_all: "All",
  filter_seats: "Min Seats",
  filter_available_only: "Available only",
  filter_sort: "Sort by",
  filter_reset: "Reset Filters",
  sort_popular: "Most Popular",
  sort_price_asc: "Price: Low → High",
  sort_price_desc: "Price: High → Low",
  sort_newest: "Newest",
  detail_back: "Back to cars",
  detail_specs: "Specifications",
  detail_features: "Features",
  detail_per_day: "Per day",
  detail_per_week: "Per week",
  detail_book_btn: "Book this vehicle",
  detail_unavailable: "Not available",
  detail_booking_sent: "Booking request sent! We'll contact you soon.",
  detail_similar: "Similar vehicles",
  about_title: "About",
  about_subtitle: "AutoLoc Annaba",
  about_hero_heading: "Your trusted partner in Annaba",
  about_hero_sub: "Since 2019, we make premium car rental accessible to everyone.",
  about_story_title: "Our Story",
  about_story: "Founded in 2019 in the heart of Annaba, AutoLoc was born from a simple vision: make premium car rental accessible to every citizen — from the boulevards of the city center to the heights of Seraïdi.",
  about_story_p2: "Today, with over 20 vehicles and 6 pickup points, we are the reference for car rental in the wilaya of Annaba. Our commitment: quality, transparency and personalized service.",
  about_numbers_title: "By the Numbers",
  about_stat_vehicles: "Vehicles",
  about_stat_clients: "Happy clients",
  about_stat_years: "Years of service",
  about_stat_zones: "Pickup zones",
  about_team_title: "Our Team",
  about_team_subtitle: "The people behind AutoLoc Annaba",
  about_values_title: "Our Values",
  about_val1_title: "Transparency",
  about_val1_text: "No hidden fees, no surprises. Our prices are clear and conditions are simple.",
  about_val2_title: "Quality",
  about_val2_text: "Recent, clean and perfectly maintained vehicles for every rental.",
  about_val3_title: "Local Pride",
  about_val3_text: "We are proud to serve Annaba and contribute to the development of our beautiful city.",
  cars_page_title: "Our Cars",
  cars_page_subtitle: "Discover our fleet of vehicles available in Annaba.",
  cars_filters_btn: "Filters",
  contact_title: "Contact",
  contact_subtitle: "Have a question? Don't hesitate to reach out.",
  contact_form_title: "Send us a message",
  contact_name: "Full name",
  contact_email: "Email",
  contact_phone: "Phone (optional)",
  contact_subject: "Subject",
  contact_message: "Message",
  contact_send: "Send message",
  contact_success: "Your message has been sent ✓",
  contact_whatsapp: "Chat on WhatsApp",
  contact_hours_weekday: "Mon–Sat: 08:00–19:00",
  contact_hours_weekend: "Sun: 09:00–14:00",
  contact_address: "Address",
  map_filter: "Filter",
  map_all: "All",
  map_available_only: "Available only",
  map_view_details: "View details",
  map_book: "Book",
  map_close: "Close",
  map_per_day: "/ day",
  footer_tagline: "Premium car rental in Annaba. Free delivery in city center.",
  footer_links: "Quick Links",
  footer_cars: "Our Cars",
  footer_contact: "Contact",
  footer_rights: "All rights reserved.",
  testimonials_title: "What Our Clients Say",
  theme_dark: "Dark mode",
  theme_light: "Light mode",
  currency: "DZD",
  verified_client: "Verified client",
  auth_login: "Log In",
  auth_signup: "Sign Up",
  auth_login_title: "Welcome back",
  auth_login_email: "Email",
  auth_login_password: "Password",
  auth_login_btn: "Log In",
  auth_login_forgot: "Forgot password?",
  auth_no_account: "Don't have an account?",
  auth_has_account: "Already have an account?",
  auth_register_title: "Create your account",
  auth_role_renter: "Register as Renter",
  auth_role_renter_desc: "List your vehicles and earn money by renting them out.",
  auth_role_customer: "Register as Customer",
  auth_role_customer_desc: "Browse and book vehicles for your next trip.",
  auth_renter_type_title: "What kind of renter are you?",
  auth_renter_store: "You own a store (official)",
  auth_renter_store_desc: "You have an official car rental business with a physical location.",
  auth_renter_own: "You own your own car",
  auth_renter_own_desc: "Rent out your personal vehicle when you're not using it.",
  auth_coming_soon: "Coming Soon",
  auth_form_firstname: "First name",
  auth_form_lastname: "Last name",
  auth_form_phone: "Phone number",
  auth_form_email: "Email",
  auth_form_password: "Password",
  auth_form_wilaya: "Wilaya",
  auth_form_store_location: "Store location",
  auth_form_store_placeholder: "Paste Google Maps link or search for your store",
  auth_form_register_btn: "Create Account",
  auth_back: "Back",
  auth_step: "Step",
  auth_or: "or",
};

export const fr: Translations = {
  nav_home: "Accueil",
  nav_cars: "Voitures",
  nav_services: "Nos Services",
  nav_about: "À propos",
  nav_contact: "Contactez-nous",
  hero_title_1: "Louez les meilleures",
  hero_title_2: "voitures",
  hero_stat_vehicles: "20+",
  hero_stat_vehicles_label: "Types de véhicules",
  hero_stat_clients: "1.2k+",
  hero_stat_clients_label: "Clients servis",
  hero_description: "Nous voulons que vous ayez une expérience de location sans stress, c'est pourquoi nous facilitons la location — avec des outils de recherche simples, des avis clients et de nombreux points de retrait à Annaba.",
  hero_cta: "Voir le catalogue",
  search_location: "Choisir un lieu",
  search_location_all: "Toutes les zones",
  search_pickup: "Date de départ",
  search_return: "Date de retour",
  search_btn: "Rechercher",
  featured_title: "Nos meilleurs véhicules",
  featured_subtitle: "Nos véhicules les plus populaires, prêts à être livrés.",
  featured_book: "Réserver",
  how_title: "Comment ça marche",
  how_step1_title: "Choisissez votre voiture",
  how_step1_desc: "Parcourez notre collection et trouvez le véhicule parfait pour votre trajet.",
  how_step2_title: "Réservez en ligne",
  how_step2_desc: "Sélectionnez vos dates et complétez la réservation en quelques minutes.",
  how_step3_title: "Récupérez & Conduisez",
  how_step3_desc: "Récupérez au point choisi ou nous livrons gratuitement chez vous.",
  why_title: "Pourquoi nous choisir",
  why_1: "Livraison gratuite",
  why_1_desc: "Livraison et récupération gratuites dans le centre-ville d'Annaba.",
  why_2: "Support 24/7",
  why_2_desc: "Notre équipe est disponible jour et nuit pour toute urgence.",
  why_3: "Meilleurs prix",
  why_3_desc: "Tarifs compétitifs sans frais cachés.",
  why_4: "Flotte bien entretenue",
  why_4_desc: "Toutes les voitures sont régulièrement entretenues et nettoyées.",
  cta_title: "Prêt à prendre la route ?",
  cta_subtitle: "Réservez votre voiture aujourd'hui et profitez d'une expérience de conduite premium à Annaba.",
  cta_btn: "Voir les voitures",
  cta_phone: "Ou appelez-nous",
  card_available: "Disponible",
  card_unavailable: "Indisponible",
  card_seats: "places",
  card_per_day: "DZD / jour",
  card_details: "Détails",
  card_book: "Réserver",
  filter_category: "Catégorie",
  filter_price: "Gamme de prix",
  filter_transmission: "Transmission",
  filter_all: "Tous",
  filter_seats: "Sièges min",
  filter_available_only: "Disponibles uniquement",
  filter_sort: "Trier par",
  filter_reset: "Réinitialiser",
  sort_popular: "Plus populaires",
  sort_price_asc: "Prix: Bas → Haut",
  sort_price_desc: "Prix: Haut → Bas",
  sort_newest: "Plus récents",
  detail_back: "Retour aux voitures",
  detail_specs: "Spécifications",
  detail_features: "Équipements",
  detail_per_day: "Par jour",
  detail_per_week: "Par semaine",
  detail_book_btn: "Réserver ce véhicule",
  detail_unavailable: "Non disponible",
  detail_booking_sent: "Demande de réservation envoyée ! Nous vous contacterons bientôt.",
  detail_similar: "Véhicules similaires",
  about_title: "À propos",
  about_subtitle: "AutoLoc Annaba",
  about_hero_heading: "Votre partenaire de confiance à Annaba",
  about_hero_sub: "Depuis 2019, nous rendons la location de voitures premium accessible à tous.",
  about_story_title: "Notre histoire",
  about_story: "Fondée en 2019 au cœur d'Annaba, AutoLoc est née d'une vision simple : rendre la location de voitures premium accessible à chaque Annabi — des boulevards du Centre-Ville aux hauteurs de Seraïdi.",
  about_story_p2: "Aujourd'hui, avec plus de 20 véhicules et 6 points de retrait, nous sommes la référence de la location automobile dans la wilaya d'Annaba. Notre engagement : qualité, transparence et service personnalisé.",
  about_numbers_title: "En chiffres",
  about_stat_vehicles: "Véhicules",
  about_stat_clients: "Clients satisfaits",
  about_stat_years: "Années de service",
  about_stat_zones: "Zones de retrait",
  about_team_title: "Notre équipe",
  about_team_subtitle: "Les personnes derrière AutoLoc Annaba",
  about_values_title: "Nos valeurs",
  about_val1_title: "Transparence",
  about_val1_text: "Pas de frais cachés, pas de surprises. Nos prix sont clairs et nos conditions sont simples.",
  about_val2_title: "Qualité",
  about_val2_text: "Des véhicules récents, propres et parfaitement entretenus pour chaque location.",
  about_val3_title: "Fierté Locale",
  about_val3_text: "Nous sommes fiers de servir Annaba et de contribuer au développement de notre belle ville.",
  cars_page_title: "Nos Voitures",
  cars_page_subtitle: "Découvrez notre flotte de véhicules disponibles à Annaba.",
  cars_filters_btn: "Filtres",
  contact_title: "Contactez-nous",
  contact_subtitle: "Une question ? N'hésitez pas à nous écrire.",
  contact_form_title: "Envoyez-nous un message",
  contact_name: "Nom complet",
  contact_email: "Email",
  contact_phone: "Téléphone (optionnel)",
  contact_subject: "Sujet",
  contact_message: "Message",
  contact_send: "Envoyer le message",
  contact_success: "Votre message a été envoyé ✓",
  contact_whatsapp: "Écrire sur WhatsApp",
  contact_hours_weekday: "Lun–Sam: 08h00–19h00",
  contact_hours_weekend: "Dim: 09h00–14h00",
  contact_address: "Adresse",
  map_filter: "Filtrer",
  map_all: "Tous",
  map_available_only: "Disponibles uniquement",
  map_view_details: "Voir détails",
  map_book: "Réserver",
  map_close: "Fermer",
  map_per_day: "/ jour",
  footer_tagline: "Location de voitures premium à Annaba. Livraison gratuite en centre-ville.",
  footer_links: "Liens rapides",
  footer_cars: "Nos voitures",
  footer_contact: "Contact",
  footer_rights: "Tous droits réservés.",
  testimonials_title: "Ce que disent nos clients",
  theme_dark: "Mode sombre",
  theme_light: "Mode clair",
  currency: "DZD",
  verified_client: "Client vérifié",
  auth_login: "Se connecter",
  auth_signup: "S'inscrire",
  auth_login_title: "Bon retour",
  auth_login_email: "Email",
  auth_login_password: "Mot de passe",
  auth_login_btn: "Se connecter",
  auth_login_forgot: "Mot de passe oublié ?",
  auth_no_account: "Pas encore de compte ?",
  auth_has_account: "Déjà un compte ?",
  auth_register_title: "Créez votre compte",
  auth_role_renter: "S'inscrire en tant que loueur",
  auth_role_renter_desc: "Listez vos véhicules et gagnez de l'argent en les louant.",
  auth_role_customer: "S'inscrire en tant que client",
  auth_role_customer_desc: "Parcourez et réservez des véhicules pour votre prochain voyage.",
  auth_renter_type_title: "Quel type de loueur êtes-vous ?",
  auth_renter_store: "Vous possédez un magasin (officiel)",
  auth_renter_store_desc: "Vous avez une agence de location avec un local physique.",
  auth_renter_own: "Vous possédez votre propre voiture",
  auth_renter_own_desc: "Louez votre véhicule personnel quand vous ne l'utilisez pas.",
  auth_coming_soon: "Bientôt disponible",
  auth_form_firstname: "Prénom",
  auth_form_lastname: "Nom de famille",
  auth_form_phone: "Numéro de téléphone",
  auth_form_email: "Email",
  auth_form_password: "Mot de passe",
  auth_form_wilaya: "Wilaya",
  auth_form_store_location: "Emplacement du magasin",
  auth_form_store_placeholder: "Collez le lien Google Maps ou recherchez votre magasin",
  auth_form_register_btn: "Créer un compte",
  auth_back: "Retour",
  auth_step: "Étape",
  auth_or: "ou",
};

export const ar: Translations = {
  nav_home: "الرئيسية",
  nav_cars: "السيارات",
  nav_services: "خدماتنا",
  nav_about: "من نحن",
  nav_contact: "اتصل بنا",
  hero_title_1: "استأجر أفضل",
  hero_title_2: "السيارات",
  hero_stat_vehicles: "+20",
  hero_stat_vehicles_label: "نوع من المركبات",
  hero_stat_clients: "+1.2k",
  hero_stat_clients_label: "عميل تمت خدمته",
  hero_description: "نريدك أن تحصل على تجربة تأجير خالية من المتاعب، لذلك نسهل عليك استئجار سيارة — من خلال أدوات بحث بسيطة، تقييمات العملاء ونقاط استلام عديدة في عنابة.",
  hero_cta: "تصفح الكتالوج",
  search_location: "اختر الموقع",
  search_location_all: "جميع المناطق",
  search_pickup: "تاريخ الاستلام",
  search_return: "تاريخ الإرجاع",
  search_btn: "بحث",
  featured_title: "أفضل الخيارات في عنابة",
  featured_subtitle: "أكثر المركبات شعبية، جاهزة للتسليم.",
  featured_book: "احجز الآن",
  how_title: "كيف يعمل",
  how_step1_title: "اختر سيارتك",
  how_step1_desc: "تصفح مجموعتنا وجد السيارة المثالية لرحلتك.",
  how_step2_title: "احجز عبر الإنترنت",
  how_step2_desc: "حدد التواريخ وأكمل الحجز في دقائق.",
  how_step3_title: "استلم و انطلق",
  how_step3_desc: "استلم من النقطة المحددة أو نوصلها إليك مجاناً.",
  why_title: "لماذا تختارنا",
  why_1: "توصيل مجاني",
  why_1_desc: "توصيل واسترجاع مجاني في وسط مدينة عنابة.",
  why_2: "دعم على مدار الساعة",
  why_2_desc: "فريقنا متاح على مدار الساعة لأي حالة طارئة.",
  why_3: "أفضل الأسعار",
  why_3_desc: "أسعار تنافسية بدون رسوم مخفية.",
  why_4: "أسطول مُعتنى به",
  why_4_desc: "جميع السيارات تخضع للصيانة والتنظيف بانتظام.",
  cta_title: "مستعد للانطلاق؟",
  cta_subtitle: "احجز سيارتك اليوم واستمتع بتجربة قيادة متميزة في عنابة.",
  cta_btn: "تصفح السيارات",
  cta_phone: "أو اتصل بنا",
  card_available: "متاح",
  card_unavailable: "غير متاح",
  card_seats: "مقاعد",
  card_per_day: "دج / يوم",
  card_details: "التفاصيل",
  card_book: "احجز",
  filter_category: "الفئة",
  filter_price: "نطاق السعر",
  filter_transmission: "ناقل الحركة",
  filter_all: "الكل",
  filter_seats: "أقل عدد مقاعد",
  filter_available_only: "المتاحة فقط",
  filter_sort: "ترتيب حسب",
  filter_reset: "إعادة تعيين",
  sort_popular: "الأكثر شعبية",
  sort_price_asc: "السعر: من الأقل",
  sort_price_desc: "السعر: من الأعلى",
  sort_newest: "الأحدث",
  detail_back: "العودة للسيارات",
  detail_specs: "المواصفات",
  detail_features: "المميزات",
  detail_per_day: "في اليوم",
  detail_per_week: "في الأسبوع",
  detail_book_btn: "احجز هذه السيارة",
  detail_unavailable: "غير متاح",
  detail_booking_sent: "تم إرسال طلب الحجز! سنتواصل معك قريباً.",
  detail_similar: "سيارات مشابهة",
  about_title: "من نحن",
  about_subtitle: "أوتولوك عنابة",
  about_hero_heading: "شريكك الموثوق في عنابة",
  about_hero_sub: "منذ 2019، نجعل تأجير السيارات المتميز في متناول الجميع.",
  about_story_title: "قصتنا",
  about_story: "تأسست أوتولوك في 2019 في قلب عنابة، وُلدت من رؤية بسيطة: جعل تأجير السيارات المتميز في متناول كل مواطن — من شوارع وسط المدينة إلى مرتفعات سرايدي.",
  about_story_p2: "اليوم، مع أكثر من 20 مركبة و6 نقاط استلام، نحن المرجع في تأجير السيارات في ولاية عنابة. التزامنا: الجودة والشفافية والخدمة الشخصية.",
  about_numbers_title: "بالأرقام",
  about_stat_vehicles: "مركبة",
  about_stat_clients: "عميل سعيد",
  about_stat_years: "سنوات خدمة",
  about_stat_zones: "نقاط استلام",
  about_team_title: "فريقنا",
  about_team_subtitle: "الأشخاص وراء أوتولوك عنابة",
  about_values_title: "قيمنا",
  about_val1_title: "الشفافية",
  about_val1_text: "لا رسوم مخفية ولا مفاجآت. أسعارنا واضحة وشروطنا بسيطة.",
  about_val2_title: "الجودة",
  about_val2_text: "مركبات حديثة ونظيفة ومصانة بشكل مثالي لكل عملية تأجير.",
  about_val3_title: "فخر محلي",
  about_val3_text: "نحن فخورون بخدمة عنابة والمساهمة في تطوير مدينتنا الجميلة.",
  cars_page_title: "سياراتنا",
  cars_page_subtitle: "اكتشف أسطول المركبات المتاحة لدينا في عنابة.",
  cars_filters_btn: "تصفية",
  contact_title: "اتصل بنا",
  contact_subtitle: "لديك سؤال؟ لا تتردد في التواصل معنا.",
  contact_form_title: "أرسل لنا رسالة",
  contact_name: "الاسم الكامل",
  contact_email: "البريد الإلكتروني",
  contact_phone: "الهاتف (اختياري)",
  contact_subject: "الموضوع",
  contact_message: "الرسالة",
  contact_send: "إرسال الرسالة",
  contact_success: "تم إرسال رسالتك ✓",
  contact_whatsapp: "تواصل عبر واتساب",
  contact_hours_weekday: "الإثنين–السبت: 08:00–19:00",
  contact_hours_weekend: "الأحد: 09:00–14:00",
  contact_address: "العنوان",
  map_filter: "تصفية",
  map_all: "الكل",
  map_available_only: "المتاحة فقط",
  map_view_details: "عرض التفاصيل",
  map_book: "احجز",
  map_close: "إغلاق",
  map_per_day: "/ يوم",
  footer_tagline: "تأجير سيارات متميز في عنابة. توصيل مجاني لوسط المدينة.",
  footer_links: "روابط سريعة",
  footer_cars: "سياراتنا",
  footer_contact: "اتصل بنا",
  footer_rights: "جميع الحقوق محفوظة.",
  testimonials_title: "ماذا يقول عملاؤنا",
  theme_dark: "الوضع الداكن",
  theme_light: "الوضع الفاتح",
  currency: "دج",
  verified_client: "عميل موثق",
  auth_login: "تسجيل الدخول",
  auth_signup: "إنشاء حساب",
  auth_login_title: "مرحباً بعودتك",
  auth_login_email: "البريد الإلكتروني",
  auth_login_password: "كلمة المرور",
  auth_login_btn: "تسجيل الدخول",
  auth_login_forgot: "نسيت كلمة المرور؟",
  auth_no_account: "ليس لديك حساب؟",
  auth_has_account: "لديك حساب بالفعل؟",
  auth_register_title: "أنشئ حسابك",
  auth_role_renter: "التسجيل كمؤجر",
  auth_role_renter_desc: "اعرض مركباتك واكسب المال من تأجيرها.",
  auth_role_customer: "التسجيل كعميل",
  auth_role_customer_desc: "تصفح واحجز المركبات لرحلتك القادمة.",
  auth_renter_type_title: "ما نوع المؤجر الذي أنت؟",
  auth_renter_store: "تملك محلاً (رسمي)",
  auth_renter_store_desc: "لديك وكالة تأجير سيارات رسمية بموقع فعلي.",
  auth_renter_own: "تملك سيارتك الخاصة",
  auth_renter_own_desc: "أجّر سيارتك الشخصية عندما لا تستخدمها.",
  auth_coming_soon: "قريباً",
  auth_form_firstname: "الاسم الأول",
  auth_form_lastname: "اسم العائلة",
  auth_form_phone: "رقم الهاتف",
  auth_form_email: "البريد الإلكتروني",
  auth_form_password: "كلمة المرور",
  auth_form_wilaya: "الولاية",
  auth_form_store_location: "موقع المحل",
  auth_form_store_placeholder: "الصق رابط خرائط جوجل أو ابحث عن محلك",
  auth_form_register_btn: "إنشاء حساب",
  auth_back: "رجوع",
  auth_step: "خطوة",
  auth_or: "أو",
};

export const dictionaries: Record<Locale, Translations> = { en, fr, ar };
