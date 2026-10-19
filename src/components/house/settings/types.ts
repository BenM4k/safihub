import type {
  HouseRecord,
  HouseExclusionRecord,
  MasterItemRecord,
  MasterFabricRecord,
  HouseCatalogueItemRecord,
  HouseStaffMemberRecord,
  UserSessionDTO,
} from "@/dal";
import type { AuthenticatedUser } from "@/services/auth";

export type SettingsSection =
  | "profil"
  | "commandes"
  | "exclusions"
  | "paiement"
  | "notifications"
  | "equipe"
  | "securite"
  | "preferences";

export interface SettingsPageData {
  house: HouseRecord;
  exclusions: HouseExclusionRecord[];
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  catalogueItems: HouseCatalogueItemRecord[];
  staff: HouseStaffMemberRecord[];
  todayOrdersCount: number;
  sessions: UserSessionDTO[];
  user: AuthenticatedUser;
}
