"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared";
import { normalizeStaffRole, validateMemberActionGuardrails } from "@/services/auth/house-permissions";
import { MembersListCard } from "./equipe/members-list-card";
import { InviteModal } from "./equipe/invite-modal";
import { PermissionsCard } from "./equipe/permissions-card";
import type { HouseStaffMemberRecord } from "@/dal";

interface EquipeTabProps {
  staff: HouseStaffMemberRecord[];
  currentUserId: string;
  currentUserRole?: string;
}

export function EquipeTab({ staff, currentUserId, currentUserRole }: EquipeTabProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<HouseStaffMemberRecord | null>(null);
  const [guardrailError, setGuardrailError] = useState<string | null>(null);

  const callerRole = normalizeStaffRole(currentUserRole ?? "operator");

  function handleInvite() {
    setGuardrailError("Le système d'invitation par email/téléphone sera disponible dans une prochaine mise à jour.");
  }

  function handleRemoveMemberClick(member: HouseStaffMemberRecord) {
    setGuardrailError(null);

    const validation = validateMemberActionGuardrails({
      staffList: staff.map((s) => ({
        userId: s.userId,
        name: s.name,
        email: s.email,
        role: s.role ?? "operator",
      })),
      callerUserId: currentUserId,
      callerRole,
      targetUserId: member.userId,
      isRemoval: true,
    });

    if (!validation.allowed) {
      setGuardrailError(validation.error);
      return;
    }

    setGuardrailError("La gestion des membres d'équipe sera activée avec les actions serveur dédiées.");
  }

  return (
    <div className="space-y-6">
      {guardrailError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive-soft/30 p-3 sm:p-4 text-xs font-semibold text-destructive flex items-center gap-2.5 break-words"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{guardrailError}</span>
        </div>
      )}

      {/* 1. Header and Staff List */}
      <MembersListCard staff={staff} onRemoveClick={handleRemoveMemberClick} />

      <Separator />

      {/* 2. Matrice des rôles & permissions */}
      <PermissionsCard />

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={async () => {
          setMemberToRemove(null);
        }}
        title="Retirer le collaborateur"
        description={`Êtes-vous sûr de vouloir retirer ${memberToRemove?.name} de l'équipe du pressing ? Cette personne perdra immédiatement son accès au portail.`}
        confirmLabel="Retirer le membre"
        cancelLabel="Annuler"
        variant="destructive"
      />
    </div>
  );
}
