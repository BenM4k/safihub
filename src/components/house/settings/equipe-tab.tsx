"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared";
import { validateMemberActionGuardrails } from "@/services/auth/house-permissions";
import { MembersListCard } from "./equipe/members-list-card";
import { InviteModal } from "./equipe/invite-modal";
import { PermissionsCard } from "./equipe/permissions-card";
import type { HouseStaffMemberRecord } from "@/dal";

interface EquipeTabProps {
  staff: HouseStaffMemberRecord[];
  currentUserId: string;
}

export function EquipeTab({ staff, currentUserId }: EquipeTabProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<HouseStaffMemberRecord | null>(null);
  const [guardrailError, setGuardrailError] = useState<string | null>(null);

  function handleInvite(email: string, role: "manager" | "operator") {
    setInviteSuccess(
      `Invitation transmise à ${email} avec le rôle ${role === "manager" ? "Gérant" : "Opérateur"}.`
    );
    setTimeout(() => setInviteSuccess(null), 4000);
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
      callerRole: "owner",
      targetUserId: member.userId,
      isRemoval: true,
    });

    if (!validation.allowed) {
      setGuardrailError(validation.error);
      return;
    }

    setMemberToRemove(member);
  }

  return (
    <div className="space-y-6">
      {inviteSuccess && (
        <div className="p-4 bg-success-soft border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{inviteSuccess}</span>
        </div>
      )}
      {guardrailError && (
        <div className="p-4 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{guardrailError}</span>
        </div>
      )}

      {/* 1. Header and Staff List */}
      <MembersListCard
        staff={staff}
        onOpenInvite={() => setIsInviteOpen(true)}
        onRemoveClick={handleRemoveMemberClick}
      />

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
