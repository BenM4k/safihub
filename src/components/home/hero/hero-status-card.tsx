import Image from "next/image";
import {
  CheckCircle2,
  Video,
  FileText,
  Trash2,
  Mic,
  PhoneOff,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroStatusCard() {
  return (
    <div className="relative mx-auto w-full max-w-132.5">
      {/* Background lavender/periwinkle canvas container (from reference) */}
      <div className="rounded-[2.25rem] bg-[#E1DEFE]/70 p-4 sm:p-7 relative">
        {/* Main Floating Application Window (white card) */}
        <div className="rounded-2xl bg-white border border-slate-200/60 shadow-lg p-4 sm:p-5 relative z-10">
          {/* Top action bar with acknowledgement button */}
          <div className="text-center mb-3">
            <Button
              type="button"
              variant="primary"
              size="pill-sm"
              className="text-[11px] min-h-0 h-auto py-1 px-3.5 font-semibold"
            >
              Valider et approuver le comptage
            </Button>
          </div>

          {/* Center split view: Document preview (left) + Video/Contact tiles (right) */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            {/* Left side: Document preview */}
            <div className="col-span-7 rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <span className="text-[11px] font-bold text-heading">
                    Fiche de réception
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    #SH-2849
                  </span>
                </div>
                {/* Skeleton invoice lines */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-200/80 rounded" />
                  <div className="h-2 w-5/6 bg-slate-200/80 rounded" />
                  <div className="h-2 w-3/4 bg-slate-200/60 rounded" />
                  <div className="h-2 w-4/5 bg-slate-200/60 rounded" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-heading">
                <span>Total articles : 6</span>
                <span className="text-primary">41 000 CDF</span>
              </div>
            </div>

            {/* Right side: 2 Video / Avatar tiles */}
            <div className="col-span-5 flex flex-col gap-2">
              {/* Tile 1: Laundry House */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=300&q=80"
                  alt="Pressing"
                  fill
                  sizes="140px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Pressing du Lac
                </span>
              </div>

              {/* Tile 2: Courier */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                  alt="Coursier"
                  fill
                  sizes="140px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Coursier Christian
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Call Controls & Timer Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <span>Contrôle contradictoire</span>
            <span className="font-mono tabular">00:03:00</span>
            <div className="flex items-center gap-1.5">
              <span className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Mic className="size-3" />
              </span>
              <span className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Video className="size-3" />
              </span>
              <span className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <MessageSquare className="size-3" />
              </span>
              <span className="size-6 rounded-full bg-rose-500 flex items-center justify-center text-white">
                <PhoneOff className="size-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Lower floating elements (matching reference screenshot) */}
        <div className="mt-3 space-y-2 relative z-20">
          {/* Row 1: File pill + Green Camera tile */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl p-2.5 shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-heading leading-tight">
                    Fiche_reception_Muhumba.pdf
                  </p>
                  <p className="text-[10px] text-slate-400">
                    200 KB — 100% conforme
                  </p>
                </div>
              </div>
              <CheckCircle2 className="size-4 text-primary fill-primary/10 shrink-0" />
            </div>

            {/* Vibrant green square button */}
            <div className="size-11 rounded-xl bg-[#32D583] text-white flex items-center justify-center shadow-sm shrink-0">
              <Video className="size-5" />
            </div>
          </div>

          {/* Row 2: Progress pill + Blue File tile */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl p-2.5 shadow-sm border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 w-full pr-2">
                <div className="size-7 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-heading leading-tight">
                    Photos_etat_vetements.zip
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-primary rounded-full" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 tabular">
                      100%
                    </span>
                  </div>
                </div>
              </div>
              <Trash2 className="size-3.5 text-slate-400 shrink-0 hover:text-rose-500" />
            </div>

            {/* Vibrant blue square button with red notification dot */}
            <div className="size-11 rounded-xl bg-[#389BF2] text-white flex items-center justify-center shadow-sm shrink-0 relative">
              <FileText className="size-5" />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
