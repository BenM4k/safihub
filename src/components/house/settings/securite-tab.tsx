"use client";

import { PasswordCard } from "./securite/password-card";
import { TwoFactorCard } from "./securite/two-factor-card";
import { SessionsCard } from "./securite/sessions-card";
import type { UserSessionDTO } from "@/dal";

interface SecuriteTabProps {
  sessions: UserSessionDTO[];
  currentSessionId?: string;
}

export function SecuriteTab({ sessions, currentSessionId }: SecuriteTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Change Password */}
      <PasswordCard />

      {/* 2. Two-Factor Authentication Status */}
      <TwoFactorCard />

      {/* 3. Active Sessions */}
      <SessionsCard sessions={sessions} currentSessionId={currentSessionId} />
    </div>
  );
}
