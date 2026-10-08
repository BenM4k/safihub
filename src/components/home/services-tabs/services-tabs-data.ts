export interface TabItem {
  id: string;
  name: string;
  title: string;
  description: string;
  bullets: string[];
  imageUrl: string;
  bgTint: string;
}

export const TABS: TabItem[] = [
  {
    id: "daily",
    name: "Vêtements Quotidien",
    title: "Chemises & Tenues de tous les jours",
    description:
      "Pour vos journées de travail à Bukavu, réunions et sorties. Finition soignée au fer avec contrôle minutieux de chaque couture.",
    bullets: [
      "Détachage ciblé des cols, poignets et aisselles",
      "Repassage vapeur haute précision et cintre adapté",
      "Pliage compact sous housse pour protection poussière",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#BAE6FD]/60",
  },
  {
    id: "suits",
    name: "Costumes & Cérémonie",
    title: "Pressing d'apparat & Matières nobles",
    description:
      "Soin haute précision sans solvants corrosifs pour préserver la forme naturelle des fibres et l'éclat des couleurs.",
    bullets: [
      "Costumes en pure laine, smokings et blazers",
      "Robes de soirée, pagnes brodés et soies précieuses",
      "Livraison sur cintre ergonomique sous housse zippée",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#DDD9FE]/70",
  },
  {
    id: "bedding",
    name: "Linge de lit & Maison",
    title: "Literie, Couettes & Linge d'intérieur",
    description:
      "Machines grande capacité et désinfection thermique 60°C pour éliminer acariens et bactéries en profondeur.",
    bullets: [
      "Couettes grand format, duvets et couvertures volumineuses",
      "Draps, housses et taies calandrés au toucher d’hôtel",
      "Rideaux occultants et nappes de banquet",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#BBF7D0]/60",
  },
  {
    id: "shoes",
    name: "Baskets & Chaussures",
    title: "Restauration de Sneakers & Cuirs",
    description:
      "Brossage minutieux à la main des semelles et empeignes pour redonner une seconde jeunesse à vos paires préférées.",
    bullets: [
      "Nettoyage manuel semelles, lacets et œillets",
      "Désodorisation antibactérienne de la semelle interne",
      "Cirage et imperméabilisation protectrice",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#FED7AA]/60",
  },
];
