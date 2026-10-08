export const SEED_SETTINGS = {
  id: 1,
  defaultCommissionBps: 2000, // 20%
  acceptanceDelayMinutes: 45,
  acceptanceReminderPercent: 50,
  acceptanceEscalationPercent: 75,
  receptionWindowMinutes: 60,
  slotLengthMinutes: 120,
  maxCoverageDistanceLevel: 2,
  defaultCashCeiling: 100000, // 100,000 CDF
  defaultCourierPayPerLeg: 2000, // 2,000 CDF per leg
  firstOrderScreening: false,
  maxOpenOrdersPerCustomer: 2,
  maxItemsPerOrder: 50,
  maxFreeTextLines: 1,
  failedPickupBlockThreshold: 2,
  photoRetentionDays: 90,
  timezone: "Africa/Lubumbashi",
};

export const SEED_ZONES = [
  { name: "Commune d'Ibanda", sortOrder: 1 },
  { name: "Commune de Kadutu", sortOrder: 2 },
  { name: "Commune de Bagira", sortOrder: 3 },
];

export const SEED_NEIGHBORHOODS = [
  // Ibanda
  { name: "La Botte", zoneName: "Commune d'Ibanda", sortOrder: 1 },
  { name: "Nguba", zoneName: "Commune d'Ibanda", sortOrder: 2 },
  { name: "Muhumba", zoneName: "Commune d'Ibanda", sortOrder: 3 },
  { name: "Nyarwizimya", zoneName: "Commune d'Ibanda", sortOrder: 4 },
  { name: "Panzi", zoneName: "Commune d'Ibanda", sortOrder: 5 },
  // Kadutu
  { name: "Kadutu Centre", zoneName: "Commune de Kadutu", sortOrder: 6 },
  { name: "Nyamugo", zoneName: "Commune de Kadutu", sortOrder: 7 },
  { name: "Cimpunda", zoneName: "Commune de Kadutu", sortOrder: 8 },
  // Bagira
  { name: "Bagira Centre", zoneName: "Commune de Bagira", sortOrder: 9 },
  { name: "Lumumba", zoneName: "Commune de Bagira", sortOrder: 10 },
];

export const SEED_SERVICES = [
  {
    slug: "wash",
    nameFr: "Lavage & Pliage",
    nameSw: "Kufua na Kukunja",
    sortOrder: 1,
  },
  {
    slug: "iron",
    nameFr: "Repassage uniquement",
    nameSw: "Kupiga pasi tu",
    sortOrder: 2,
  },
  {
    slug: "dry_clean",
    nameFr: "Nettoyage à sec",
    nameSw: "Usafi kavu",
    sortOrder: 3,
  },
  {
    slug: "express",
    nameFr: "Lavage Express (24h)",
    nameSw: "Huduma ya haraka (24h)",
    sortOrder: 4,
  },
];

export const SEED_FABRICS = [
  { nameFr: "Standard", nameSw: "Ya kawaida", sortOrder: 1 },
  { nameFr: "Coton / Lin", nameSw: "Pamba / Kitani", sortOrder: 2 },
  { nameFr: "Laine / Cachemire", nameSw: "Manyoya", sortOrder: 3 },
  { nameFr: "Soie / Matières délicates", nameSw: "Hariri", sortOrder: 4 },
  { nameFr: "Synthétique / Denim", nameSw: "Kisasa / Denim", sortOrder: 5 },
];

export const SEED_ITEMS = [
  {
    nameFr: "Chemise classique",
    nameSw: "Shati ya kawaida",
    category: "tops",
    sortOrder: 1,
  },
  {
    nameFr: "Pantalon de costume / Jean",
    nameSw: "Suruali / Jean",
    category: "bottoms",
    sortOrder: 2,
  },
  {
    nameFr: "Costume 2 pièces complet",
    nameSw: "Suti ya vipande viwili",
    category: "suits",
    sortOrder: 3,
  },
  {
    nameFr: "Robe de soirée / Cérémonie",
    nameSw: "Gauni ya sherehe",
    category: "dresses",
    sortOrder: 4,
  },
  {
    nameFr: "Parure de lit 2 places",
    nameSw: "Shuka za kitanda",
    category: "bedding",
    sortOrder: 5,
  },
  {
    nameFr: "Couette & Duvet grand format",
    nameSw: "Blanketi nzito",
    category: "bedding",
    sortOrder: 6,
  },
  {
    nameFr: "Baskets & Sneakers",
    nameSw: "Viatu vya michezo",
    category: "shoes",
    sortOrder: 7,
  },
];

export const SEED_USERS = [
  {
    id: "usr_admin_001",
    name: "SafiHub Admin",
    email: "admin@safihub.cd",
    role: "admin",
    contactPhone: "+243999000001",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_customer_001",
    name: "Amani Baraka",
    email: "customer@safihub.cd",
    role: "customer",
    contactPhone: "+243999000002",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_customer_002",
    name: "Zawadi Neema",
    email: "zawadi@safihub.cd",
    role: "customer",
    contactPhone: "+243999000005",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_courier_001",
    name: "Jean-Pierre Mugisho",
    email: "courier@safihub.cd",
    role: "courier",
    contactPhone: "+243999000003",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_courier_002",
    name: "Bahati Christian",
    email: "bahati@safihub.cd",
    role: "courier",
    contactPhone: "+243999000006",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_house_001",
    name: "Gerant Pressing Lac",
    email: "house@safihub.cd",
    role: "house",
    contactPhone: "+243999000004",
    status: "active",
    isGuest: false,
  },
  {
    id: "usr_house_002",
    name: "Gerant Etoile Kadutu",
    email: "kadutu@safihub.cd",
    role: "house",
    contactPhone: "+243999000007",
    status: "active",
    isGuest: false,
  },
];
