import { describe, expect, it, beforeEach } from "vitest";
import {
  buildIdempotentEmailKey,
  clearSentEmails,
  getAppBaseUrl,
  getEmailDomain,
  getEmailFrom,
  getSentEmails,
  queueEmailNotification,
  sendHouseSettlementEmail,
  sendHouseStaffLinkedEmail,
  sendHouseStatusChangeEmail,
  sendOrderAdjustmentPromptEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredReceiptEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerInvitationEmail,
  sendPartnerRejectionEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../index";

describe("Transactional Email Service & Templates", () => {
  beforeEach(() => {
    clearSentEmails();
  });

  describe("Sender Resolution & Custom Domain", () => {
    it("resolves the configured domain and falls back gracefully", () => {
      const domain = getEmailDomain();
      expect(domain).toBeDefined();
      expect(typeof domain).toBe("string");
      expect(domain.length).toBeGreaterThan(0);
    });

    it("formats clean brand sender headers for contact, sales, partners, and support", () => {
      const domain = getEmailDomain();
      const contactFrom = getEmailFrom("contact");
      const salesFrom = getEmailFrom("sales");
      const partnersFrom = getEmailFrom("partners");
      const supportFrom = getEmailFrom("support");

      expect(salesFrom).toContain(`sales@${domain}`);
      expect(partnersFrom).toContain(`contact@${domain}`);
      expect(supportFrom).toContain(`support@${domain}`);
      expect(contactFrom).toContain(domain);
    });

    it("resolves application base URL for links with priority on NEXT_PUBLIC_APP_URL then BETTER_AUTH_URL", () => {
      const originalNext = process.env.NEXT_PUBLIC_APP_URL;
      const originalAuth = process.env.BETTER_AUTH_URL;

      try {
        process.env.NEXT_PUBLIC_APP_URL = "https://custom.safihub.online";
        process.env.BETTER_AUTH_URL = "https://auth.safihub.online";
        expect(getAppBaseUrl()).toBe("https://custom.safihub.online");

        delete process.env.NEXT_PUBLIC_APP_URL;
        expect(getAppBaseUrl()).toBe("https://auth.safihub.online");
      } finally {
        process.env.NEXT_PUBLIC_APP_URL = originalNext;
        process.env.BETTER_AUTH_URL = originalAuth;
      }
    });
  });

  describe("Auth Templates (Verification & Reset)", () => {
    it("generates branded email verification with CTA button and escapes content", async () => {
      const res = await sendVerificationEmail({
        email: "customer@example.com",
        name: "<script>alert('xss')</script>Amani",
        verificationUrl: "https://safihub.online/api/auth/verify-email?token=xyz123",
        token: "xyz123",
      });

      expect(res.success).toBe(true);

      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      const email = sent[0]!;
      expect(email.to).toBe("customer@example.com");
      expect(email.subject).toContain("Confirmez votre adresse email");
      expect(email.html).toContain("#2824D5"); // SafiHub Royal Indigo brand color
      expect(email.html).not.toContain("<script>");
      expect(email.html).toContain("&lt;script&gt;");
      expect(email.html).toContain("Vérifier mon adresse email");
      expect(email.html).toContain("token=xyz123");
    });

    it("generates branded password reset email with secure link", async () => {
      const res = await sendPasswordResetEmail({
        email: "user@example.com",
        resetUrl: "https://safihub.online/api/auth/reset-password?token=tok999",
        token: "tok999",
      });

      expect(res.success).toBe(true);
      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      const email = sent[0]!;
      expect(email.subject).toContain("Réinitialisation de votre mot de passe");
      expect(email.html).toContain("tok999");
      expect(email.html).toContain("#2824D5");
    });
  });

  describe("Partner House Admin Action Templates", () => {
    it("sends partner invitation with temporary password when approved", async () => {
      const res = await sendPartnerInvitationEmail({
        email: "partner@atelier.cd",
        contactName: "Jean-Luc",
        houseName: "Pressing du Lac",
        inviteUrl: "https://safihub.online/login",
        temporaryPassword: "TempPassword123!",
      });

      expect(res.success).toBe(true);
      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      const email = sent[0]!;
      expect(email.to).toBe("partner@atelier.cd");
      expect(email.subject).toContain("Félicitations");
      expect(email.subject).toContain("Pressing du Lac");
      expect(email.html).toContain("TempPassword123!");
      expect(email.html).toContain("Accéder à mon espace partenaire");
    });

    it("sends rejection notice with admin note when partner application is rejected", async () => {
      const res = await sendPartnerRejectionEmail({
        email: "rejected@atelier.cd",
        contactName: "Patrice",
        houseName: "Pressing Express",
        adminNote: "Capacité électrique insuffisante pour les lave-linges industriels.",
      });

      expect(res.success).toBe(true);
      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      const email = sent[0]!;
      expect(email.to).toBe("rejected@atelier.cd");
      expect(email.subject).toContain("Information concernant votre demande");
      expect(email.html).toContain("Capacité électrique insuffisante");
      expect(email.text).toContain("Capacité électrique insuffisante");
    });

    it("sends house suspension and reactivation notifications", async () => {
      // Suspension
      await sendHouseStatusChangeEmail({
        email: "staff@pressing.cd",
        houseName: "Clean Pro",
        isActive: false,
        reason: "Non-respect des délais de livraison",
      });

      // Reactivation
      await sendHouseStatusChangeEmail({
        email: "staff@pressing.cd",
        houseName: "Clean Pro",
        isActive: true,
      });

      const sent = getSentEmails();
      expect(sent).toHaveLength(2);
      expect(sent[0]!.subject).toContain("Suspension temporaire");
      expect(sent[0]!.html).toContain("Non-respect des délais de livraison");
      expect(sent[1]!.subject).toContain("réactivé");
    });

    it("sends notification when a staff member is linked to a house", async () => {
      await sendHouseStaffLinkedEmail({
        email: "worker@safihub.cd",
        userName: "Bienvenu",
        houseName: "Pressing Bukavu Star",
        houseSlug: "pressing-bukavu-star",
      });

      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0]!.subject).toContain("Vous avez été ajouté à l'équipe");
      expect(sent[0]!.html).toContain("/partner/pressing-bukavu-star");
    });

    it("sends application received acknowledgment and settlement statements", async () => {
      // Application received
      await sendPartnerApplicationReceivedEmail({
        email: "candidate@atelier.cd",
        contactName: "Justin",
        houseName: "Pressing Rapide",
      });

      // Settlement statement
      await sendHouseSettlementEmail({
        email: "manager@atelier.cd",
        houseName: "Pressing Rapide",
        netPayoutAmountCdf: 250000,
        commissionAmountCdf: 35000,
        ordersCount: 14,
        settlementId: "SETTLE-2026-001",
      });

      const sent = getSentEmails();
      expect(sent).toHaveLength(2);
      expect(sent[0]!.subject).toContain("Candidature reçue");
      expect(sent[1]!.subject).toContain("Relevé de versement");
      expect(sent[1]!.html).toContain("250\u202f000 CDF");
    });
  });

  describe("Customer Order Templates", () => {
    it("generates order confirmation email with tracking button and items breakdown", async () => {
      const res = await sendOrderConfirmationEmail({
        email: "client@gmail.com",
        customerName: "Aline",
        orderCode: "ORD-20261108-9999",
        houseName: "Pressing Royale",
        pickupWindow: "08:00 - 10:00",
        deliveryAddress: "Avenue Patrice Lumumba n°45",
        items: [
          { name: "Chemise", quantity: 3, priceCdf: 15000 },
          { name: "Costume 2 pièces", quantity: 1, priceCdf: 25000 },
        ],
        totalAmountCdf: 43000,
        trackingUrl: "https://safihub.online/track/token-abc-123",
      });

      expect(res.success).toBe(true);
      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      const email = sent[0]!;
      expect(email.subject).toContain("ORD-20261108-9999");
      expect(email.html).toContain("Pressing Royale");
      expect(email.html).toContain("Chemise");
      expect(email.html).toContain("43\u202f000 CDF");
      expect(email.html).toContain("/track/token-abc-123");
    });

    it("generates order adjustment prompt and delivery receipt emails", async () => {
      // Adjustment prompt
      await sendOrderAdjustmentPromptEmail({
        email: "client@gmail.com",
        customerName: "Aline",
        orderCode: "ORD-20261108-9999",
        houseName: "Pressing Royale",
        diffAmountCdf: 5000,
        newTotalAmountCdf: 48000,
        reason: "Ajout d'une veste en laine",
        approvalUrl: "https://safihub.online/track/token-abc-123",
      });

      // Delivery receipt
      await sendOrderDeliveredReceiptEmail({
        email: "client@gmail.com",
        customerName: "Aline",
        orderCode: "ORD-20261108-9999",
        houseName: "Pressing Royale",
        totalPaidCdf: 48000,
        totalPaidUsd: 17.14,
        exchangeRate: 2800,
        trackingUrl: "https://safihub.online/track/token-abc-123",
      });

      const sent = getSentEmails();
      expect(sent).toHaveLength(2);
      expect(sent[0]!.subject).toContain("Action requise");
      expect(sent[0]!.html).toContain("Ajout d&#39;une veste en laine");
      expect(sent[1]!.subject).toContain("Reçu de livraison");
      expect(sent[1]!.html).toContain("48\u202f000 CDF");
    });
  });

  describe("Idempotent Email Dispatcher (Background Jobs)", () => {
    it("generates deterministic idempotent keys for background jobs", () => {
      const key1 = buildIdempotentEmailKey({
        kind: "order_confirmation",
        orderId: "ord-123",
        email: "test@example.com",
        customerName: "John",
        orderCode: "ORD-1",
        houseName: "H",
        pickupWindow: "08-10",
        deliveryAddress: "A",
        items: [],
        totalAmountCdf: 10000,
        trackingUrl: "u",
      });

      const key2 = buildIdempotentEmailKey({
        kind: "partner_application_approved",
        applicationId: "app-456",
        email: "p@example.com",
        contactName: "C",
        houseName: "H",
        inviteUrl: "u",
      });

      expect(key1).toBe("email-order-confirmation-ord-123");
      expect(key2).toBe("email-partner-app-approved-app-456");
    });

    it("executes email notifications via queueEmailNotification in test mode", async () => {
      await queueEmailNotification({
        kind: "partner_application_received",
        applicationId: "app-test-99",
        email: "queue@example.com",
        contactName: "Queue Test",
        houseName: "Pressing Test",
      });

      const sent = getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0]!.to).toBe("queue@example.com");
      expect(sent[0]!.subject).toContain("Candidature reçue");
    });
  });
});
