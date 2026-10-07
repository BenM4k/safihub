import {
  CheckCircle2,
  Sparkles,
  Smartphone,
  Bike,
  CheckCheck,
} from "lucide-react";

interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Smartphone;
  badge: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Commandez en ligne en 2 minutes",
    subtitle: "Sélection simple et transparente",
    description:
      "Indiquez votre quartier à Bukavu et choisissez vos articles. Les prix en Francs Congolais (CDF) et USD sont calculés en temps réel avec un identifiant unique anti-doublon optimisé pour les connexions 3G.",
    icon: Smartphone,
    badge: "1. Déclaration Client",
  },
  {
    number: "02",
    title: "Collecte & Double comptage contradictoire",
    subtitle: "Vérification directe à votre porte",
    description:
      "Notre coursier certifié se présente chez vous avec un sac étanche. Vous recomptez ensemble les pièces et validez l'état des tissus. Les photos d'état sont enregistrées pour éliminer tout risque de litige.",
    icon: Bike,
    badge: "2. Recomptage Coursier",
  },
  {
    number: "03",
    title: "Pressing soigné & Paiement à réception",
    subtitle: "Linge impeccable livré sous 24h à 48h",
    description:
      "Le pressing partenaire lave, détache et repasse vos habits selon les règles de l'art. Vous êtes livré chez vous sous housse protectrice et ne payez en cash qu'après avoir inspecté vos vêtements propres.",
    icon: CheckCheck,
    badge: "3. Réception Pressing & CoD",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-surface/50 overflow-hidden"
    >
      <div className="container-page">
        {/* Section title */}
        <div className="stack gap-3 text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow mx-auto">Protocole Garanti</span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading tracking-tight">
            Comment fonctionne SafiHub ?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Un processus en 3 étapes conçu pour la réalité de Bukavu :
            ponctualité, protection météo et vérification systématique.
          </p>
        </div>

        {/* 3 Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="card card-interactive bg-card border border-border p-7 sm:p-8 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Step header */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-extrabold text-3xl text-primary/30 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <span className="eyebrow bg-primary-soft text-primary font-bold text-xs">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="icon-tile size-12! mb-4 bg-primary text-white shadow-soft group-hover:scale-105 transition-transform">
                    <Icon className="size-6 text-white" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-heading mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-primary mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-border/60 flex items-center gap-1.5 text-xs text-heading font-semibold">
                  <CheckCircle2 className="size-4 text-success" />
                  <span>Conformité garantie sans frais cachés</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance banner below */}
        <div className="mt-10 card bg-surface border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-heading">
                La règle des 3 points de contrôle SafiHub
              </h4>
              <p className="text-xs text-muted-foreground">
                Déclaration client ➔ Recomptage seuil par le coursier ➔
                Validation réception pressing. Zéro vêtement égaré.
              </p>
            </div>
          </div>
          <span className="eyebrow text-xs shrink-0 font-bold">
            100% Transparent
          </span>
        </div>
      </div>
    </section>
  );
}
