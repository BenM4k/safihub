export interface ProductItem {
  id: string;
  name: string;
  category: "clothing" | "suits" | "bedding" | "delicate" | "shoes";
  priceCdf: number;
  priceUsd: number;
  turnaroundHours: number;
  fabric: string;
  description: string;
  imageUrl: string;
  tag?: string;
  popular?: boolean;
}

export interface CollectionCategory {
  id: string;
  name: string;
  count: number;
  description: string;
}

export interface LaundryHouse {
  id: string;
  name: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  turnaroundAvg: string;
  badge: string;
  isOpen: boolean;
}

export interface CoverageZone {
  id: string;
  commune: string;
  neighborhoods: string[];
  baseFeeCdf: number;
  estimatedDeliveryMin: string;
  courierAvailability: "Élevée" | "Normale" | "Sur demande";
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  neighborhood: string;
  comment: string;
  rating: number;
  avatarUrl: string;
  serviceUsed: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const SAMPLE_COLLECTIONS: CollectionCategory[] = [
  {
    id: "all",
    name: "Tous les articles",
    count: 24,
    description: "Catalogue complet de pressing et blanchisserie",
  },
  {
    id: "clothing",
    name: "Chemises & Hauts",
    count: 8,
    description: "Nettoyage quotidien et repassage impeccable pour vos vêtements",
  },
  {
    id: "suits",
    name: "Costumes & Vestes",
    count: 5,
    description: "Pressing à sec haute précision et remise en forme",
  },
  {
    id: "bedding",
    name: "Linge de lit & Maison",
    count: 6,
    description: "Traitement assainissant grand volume pour couettes et draps",
  },
  {
    id: "delicate",
    name: "Soie & Matières Délicates",
    count: 3,
    description: "Soin doux sans solvants agressifs pour étoffes précieuses",
  },
  {
    id: "shoes",
    name: "Baskets & Chaussures",
    count: 2,
    description: "Rénovation, brossage manuel et désodorisation antibactérienne",
  },
];

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Chemise classique sur cintre",
    category: "clothing",
    priceCdf: 3500,
    priceUsd: 1.25,
    turnaroundHours: 24,
    fabric: "Coton / Lin",
    description: "Lavage délicat, détachage cols et poignets, repassage vapeur haute précision.",
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    tag: "Le plus commandé",
    popular: true,
  },
  {
    id: "prod-2",
    name: "Costume 2 pièces complet",
    category: "suits",
    priceCdf: 14000,
    priceUsd: 5.0,
    turnaroundHours: 48,
    fabric: "Laine / Laine froide",
    description: "Nettoyage à sec éco-responsable, défroissage sous vide et housse respirante.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    tag: "Soin Premium",
    popular: true,
  },
  {
    id: "prod-3",
    name: "Robe de cérémonie / Soirée",
    category: "delicate",
    priceCdf: 12500,
    priceUsd: 4.5,
    turnaroundHours: 48,
    fabric: "Soie / Dentelle / Mousseline",
    description: "Bain de trempage neutre, protection des broderies et repassage basse température.",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    tag: "Haute Délicatesse",
  },
  {
    id: "prod-4",
    name: "Pantalon de costume / Jean brut",
    category: "clothing",
    priceCdf: 4000,
    priceUsd: 1.45,
    turnaroundHours: 24,
    fabric: "Coton / Gabardine / Denim",
    description: "Fixation des couleurs, pli marqué au fer traditionnel et contrôle des boutons.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prod-5",
    name: "Couette grand lit & Duvet",
    category: "bedding",
    priceCdf: 18000,
    priceUsd: 6.5,
    turnaroundHours: 48,
    fabric: "Plumes / Synthétique",
    description: "Désinfection anti-acariens, séchage thermodynamique et pliage compact sous film.",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    tag: "Grand Format",
    popular: true,
  },
  {
    id: "prod-6",
    name: "Parure de lit 2 places (Drap + Taies)",
    category: "bedding",
    priceCdf: 7000,
    priceUsd: 2.5,
    turnaroundHours: 24,
    fabric: "Percale de coton / Satin",
    description: "Lavage antibactérien 60°C, calandrage soigné pour un toucher doux d'hôtel.",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prod-7",
    name: "Baskets & Sneakers premium",
    category: "shoes",
    priceCdf: 9500,
    priceUsd: 3.4,
    turnaroundHours: 36,
    fabric: "Cuir / Toile / Mesh",
    description: "Désoxydation des semelles, lavage intérieur antibactérien et cirage protecteur.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    tag: "Rénovation",
  },
  {
    id: "prod-8",
    name: "Blazer sport / Veste mi-saison",
    category: "suits",
    priceCdf: 8500,
    priceUsd: 3.0,
    turnaroundHours: 36,
    fabric: "Tweed / Velours / Laine",
    description: "Brossage des fibres, assainissement à la vapeur sous pression et cintre en bois.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  },
];

export const SAMPLE_HOUSES: LaundryHouse[] = [
  {
    id: "house-1",
    name: "Pressing du Lac Kivu",
    neighborhood: "Ibanda (La Botte)",
    rating: 4.9,
    reviewCount: 312,
    turnaroundAvg: "24h express",
    badge: "Partenaire Platine",
    isOpen: true,
  },
  {
    id: "house-2",
    name: "Kivu Clean Express",
    neighborhood: "Nguba",
    rating: 4.8,
    reviewCount: 240,
    turnaroundAvg: "24h - 36h",
    badge: "Certifié Éco-Doux",
    isOpen: true,
  },
  {
    id: "house-3",
    name: "Étoile Pressing Kadutu",
    neighborhood: "Kadutu Centre",
    rating: 4.7,
    reviewCount: 189,
    turnaroundAvg: "24h - 48h",
    badge: "Meilleur Rapport Prix",
    isOpen: true,
  },
  {
    id: "house-4",
    name: "Blanchisserie Pro Muhumba",
    neighborhood: "Muhumba Résidentiel",
    rating: 4.95,
    reviewCount: 420,
    turnaroundAvg: "24h garanti",
    badge: "Haute Blanchisserie",
    isOpen: true,
  },
];

export const SAMPLE_ZONES: CoverageZone[] = [
  {
    id: "zone-ibanda",
    commune: "Commune d'Ibanda",
    neighborhoods: ["La Botte", "Nguba", "Muhumba", "Nyarwizimya", "Panzi"],
    baseFeeCdf: 2500,
    estimatedDeliveryMin: "25 - 40 min",
    courierAvailability: "Élevée",
  },
  {
    id: "zone-kadutu",
    commune: "Commune de Kadutu",
    neighborhoods: ["Nkafu", "Kasali", "Cimpunda", "Kajangu"],
    baseFeeCdf: 3000,
    estimatedDeliveryMin: "35 - 50 min",
    courierAvailability: "Normale",
  },
  {
    id: "zone-bagira",
    commune: "Commune de Bagira",
    neighborhoods: ["Lumumba", "Nyakavogo", "Kasha", "Chai"],
    baseFeeCdf: 4000,
    estimatedDeliveryMin: "45 - 65 min",
    courierAvailability: "Sur demande",
  },
];

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    author: "Marcella Nabintu",
    role: "Directrice d'agence bancaire",
    neighborhood: "Nguba, Bukavu",
    comment:
      "Avec SafiHub, mes tailleurs et chemises sont récupérés chez moi à 7h30 et reviennent le lendemain impeccablement repassés. Le double comptage avec le coursier donne une sérénité totale.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    serviceUsed: "Costumes & Chemises sur cintre",
  },
  {
    id: "test-2",
    author: "Dr. Patrick Cikuru",
    role: "Médecin chef de clinique",
    neighborhood: "Muhumba",
    comment:
      "La clarté des prix en Francs Congolais et le paiement à la livraison après inspection des vêtements propres font toute la différence. Le meilleur service numérique à Bukavu.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    serviceUsed: "Blouses blanches & Parures de lit",
  },
  {
    id: "test-3",
    author: "Aimé Bisimwa",
    role: "Gérant Hôtel du Lac",
    neighborhood: "La Botte",
    comment:
      "Nous confions les draps et nappes de banquet à la Blanchisserie Pro via SafiHub. Les délais de 24h sont toujours respectés, même en cas de pluie grâce à leurs sacs étanches scellés.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    serviceUsed: "Linge de lit grand volume",
  },
];

export const SAMPLE_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "Paiement & Tarifs",
    question: "Comment s'effectue le paiement (CDF ou USD) ?",
    answer:
      "Vous payez directement en espèces (Cash on Delivery) à notre coursier une fois vos vêtements propres livrés et vérifiés. Nous acceptons les Francs Congolais (CDF) et les Dollars Américains (USD) au taux officiel du jour, gelé dès la création de votre commande.",
  },
  {
    id: "faq-2",
    category: "Comptage & Sécurité",
    question: "Que se passe-t-il si le nombre d'articles diffère lors de la collecte ?",
    answer:
      "Notre système applique un comptage contradictoire en 3 points : votre déclaration en ligne, le recomptage sur place devant vous par le coursier, puis la validation finale par le pressing. Si une différence ou un tissu particulier est détecté, le prix s'ajuste et vous recevez une notification d'approbation avant tout lavage.",
  },
  {
    id: "faq-3",
    category: "Délais",
    question: "Quels sont les délais de traitement et de livraison ?",
    answer:
      "Le délai standard est de 24h à 48h selon le type de vêtement et le pressing partenaire sélectionné. Pour les urgences professionnelles, notre formule Express livre vos chemises et tenues en 18h chrono.",
  },
  {
    id: "faq-4",
    category: "Zones & Collecte",
    question: "Quels quartiers de Bukavu sont actuellement desservis ?",
    answer:
      "Nous couvrons l'ensemble d'Ibanda (La Botte, Nguba, Muhumba, Nyawera, Ndendere), Kadutu centre, et Bagira. Nos coursiers utilisent des sacs isothermes étanches pour protéger vos habits contre la poussière et la pluie.",
  },
  {
    id: "faq-5",
    category: "Soin & Tissus",
    question: "Prenez-vous en charge les tissus délicats et traditionnels ?",
    answer:
      "Oui ! Les soies, pagnes cirés brodés, velours, lin fin et costumes en pure laine bénéficient d'un traitement spécialisé sans solvant agressif, avec repassage à température régulée et cintres ergonomiques sous housse.",
  },
];
