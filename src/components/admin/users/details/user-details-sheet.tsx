"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, Shield, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoleBadgeInfo, getUserInitials } from "@/lib/user-formatters";
import { UserTabProfile } from "./user-tab-profile";
import { UserTabPermissions } from "./user-tab-permissions";
import { UserTabActivity } from "./user-tab-activity";
import { UserDetailsFooter } from "./user-details-footer";
import type { UserDetailsTab, UserRow } from "../types";

interface UserDetailsSheetProps {
  user: UserRow | null;
  initialTab?: UserDetailsTab;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  hasOverlay?: boolean;
  onClose: () => void;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UserDetailsSheet({
  user,
  initialTab = "profile",
  currentUserId,
  isAdmin,
  activeAdminsCount,
  onClose,
  onChangeRole,
  onResetPassword,
  onToggleBlock,
}: UserDetailsSheetProps) {
  const t = useTranslations("admin.users");
  const [tab, setTab] = useState<UserDetailsTab>(initialTab);

  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setTab(initialTab);
  }

  if (!user) return null;

  const roleInfo = getRoleBadgeInfo(user.role);
  const isSelf = Boolean(currentUserId && currentUserId === user.id);

  return (
    <Sheet open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full p-0 flex flex-col border-l border-border bg-background"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center gap-3.5 px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-12 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="size-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-base flex items-center justify-center shrink-0">
              {getUserInitials(user.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2 truncate leading-tight">
              <span className="truncate">{user.name}</span>
              {isSelf && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                  {t("selfBadge")}
                </span>
              )}
            </SheetTitle>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.badgeClass}`}
              >
                <span className={`size-1.5 rounded-full ${roleInfo.dotClass}`} />
                <span>{roleInfo.label}</span>
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs & Content */}
        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as UserDetailsTab)}
          className="flex-1 flex flex-col min-h-0 gap-0"
        >
          <div className="px-6 pt-3 pb-0 shrink-0">
            <TabsList className="h-auto p-0 gap-6 bg-transparent border-0 rounded-none justify-start">
              <TabsTrigger
                value="profile"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <User className="size-3.5" />
                <span>{t("tabProfile")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="permissions"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <Shield className="size-3.5" />
                <span>{t("tabPermissions")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="activity"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <Activity className="size-3.5" />
                <span>{t("tabActivity")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="profile" className="mt-0">
              <UserTabProfile user={user} />
            </TabsContent>
            <TabsContent value="permissions" className="mt-0">
              <UserTabPermissions user={user} />
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <UserTabActivity user={user} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Quick Actions Footer */}
        {isAdmin && (
          <UserDetailsFooter
            user={user}
            activeAdminsCount={activeAdminsCount}
            onChangeRole={onChangeRole}
            onResetPassword={onResetPassword}
            onToggleBlock={onToggleBlock}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
