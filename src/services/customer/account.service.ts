import "server-only";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  getUserById,
  getUserConsents,
  recordConsent,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
  type ConsentDocumentType,
  type CustomerAddressRecord,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";

export async function getCustomerAccountData(userId: string): Promise<
  Result<{
    user: {
      id: string;
      name: string;
      email: string;
      contactPhone: string | null;
      role: string | null;
      createdAt: Date;
    };
    addresses: CustomerAddressRecord[];
    consents: Array<{
      id: string;
      document: ConsentDocumentType;
      version: string;
      acceptedAt: Date;
    }>;
  }>
> {
  const user = await getUserById(userId);
  if (!user) {
    return err("Utilisateur introuvable.");
  }

  const [addresses, consents] = await Promise.all([
    getCustomerAddresses(userId),
    getUserConsents(userId),
  ]);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      contactPhone: user.contactPhone,
      role: user.role,
      createdAt: user.createdAt,
    },
    addresses,
    consents,
  });
}

export async function updateCustomerProfileInfo(
  userId: string,
  data: { name?: string; contactPhone?: string }
): Promise<Result<void>> {
  if (data.name !== undefined && data.name.trim().length === 0) {
    return err("Le nom ne peut pas être vide.");
  }
  if (data.contactPhone !== undefined && data.contactPhone.trim().length === 0) {
    return err("Le numéro de téléphone ne peut pas être vide.");
  }

  try {
    await updateCustomerProfile(userId, {
      name: data.name?.trim(),
      contactPhone: data.contactPhone?.trim(),
    });
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil."
    );
  }
}

export async function addCustomerAddress(
  userId: string,
  data: {
    label?: string | null;
    neighborhoodId: string;
    landmark: string;
    phone: string;
    isDefault?: boolean;
  }
): Promise<Result<CustomerAddressRecord>> {
  if (!data.landmark.trim()) {
    return err("Le point de repère (avenue / numéro) est obligatoire.");
  }
  if (!data.phone.trim()) {
    return err("Le numéro de contact pour l'adresse est obligatoire.");
  }
  if (!data.neighborhoodId) {
    return err("Veuillez sélectionner un quartier.");
  }

  try {
    const created = await createCustomerAddress({
      userId,
      label: data.label?.trim() || null,
      neighborhoodId: data.neighborhoodId,
      landmark: data.landmark.trim(),
      phone: data.phone.trim(),
      isDefault: data.isDefault,
    });
    return ok(created);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de l'ajout de l'adresse."
    );
  }
}

export async function editCustomerAddress(
  userId: string,
  addressId: string,
  data: {
    label?: string | null;
    neighborhoodId?: string;
    landmark?: string;
    phone?: string;
    isDefault?: boolean;
  }
): Promise<Result<void>> {
  try {
    await updateCustomerAddress(addressId, userId, data);
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de la modification de l'adresse."
    );
  }
}

export async function removeCustomerAddress(
  userId: string,
  addressId: string
): Promise<Result<void>> {
  try {
    await deleteCustomerAddress(addressId, userId);
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de la suppression de l'adresse."
    );
  }
}

export async function makeDefaultCustomerAddress(
  userId: string,
  addressId: string
): Promise<Result<void>> {
  try {
    await setDefaultCustomerAddress(addressId, userId);
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de la mise par défaut."
    );
  }
}

export async function saveCustomerConsent(
  userId: string,
  document: ConsentDocumentType,
  version: string = "1.0"
): Promise<Result<void>> {
  const res = await recordConsent({ userId, document, version });
  if (!res.ok) {
    return err(res.error);
  }
  return ok(undefined);
}
