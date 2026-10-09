import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  sendNotification,
  getUserInbox,
  markAsRead,
  markAllAsRead,
  renderNotificationTemplate,
  interpolateTemplate,
} from "../index";
import type { NotificationRecord } from "@/dal";

// In-memory mock store for notifications
let mockNotifications: NotificationRecord[] = [];

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    createNotification: vi.fn(async (input) => {
      const record: NotificationRecord = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: input.userId ?? null,
        phone: input.phone ?? null,
        orderId: input.orderId ?? null,
        channel: input.channel,
        templateKey: input.templateKey,
        locale: input.locale || "fr",
        title: input.title ?? null,
        body: input.body,
        status: input.status || "pending",
        error: input.error ?? null,
        sentAt: input.sentAt ?? new Date(),
        readAt: null,
        createdAt: new Date(),
      };
      mockNotifications.push(record);
      return record;
    }),
    getNotificationsByUser: vi.fn(async (userId: string, limit = 50, offset = 0) => {
      const userItems = mockNotifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const items = userItems.slice(offset, offset + limit);
      const unreadCount = userItems.filter((n) => !n.readAt).length;
      return { items, unreadCount };
    }),
    getNotificationById: vi.fn(async (id: string) => {
      return mockNotifications.find((n) => n.id === id) ?? null;
    }),
    markNotificationAsRead: vi.fn(async (id: string, userId: string) => {
      const item = mockNotifications.find((n) => n.id === id && n.userId === userId);
      if (item && !item.readAt) {
        item.readAt = new Date();
        return true;
      }
      return false;
    }),
    markAllNotificationsAsRead: vi.fn(async (userId: string) => {
      let count = 0;
      for (const item of mockNotifications) {
        if (item.userId === userId && !item.readAt) {
          item.readAt = new Date();
          count++;
        }
      }
      return count;
    }),
  };
});

describe("Notifications Service & Inbox (Task 9.1)", () => {
  beforeEach(() => {
    mockNotifications = [];
    vi.clearAllMocks();
  });

  describe("Template Rendering & Localization", () => {
    it("interpolates parameters into templates correctly", () => {
      const text = "Commande #{orderIdShort} chez {houseName}";
      const interpolated = interpolateTemplate(text, {
        orderIdShort: "ORD-123",
        houseName: "Pressing Muhumba",
      });
      expect(interpolated).toBe("Commande #ORD-123 chez Pressing Muhumba");
    });

    it("renders French templates by default", () => {
      const rendered = renderNotificationTemplate("order_accepted", "fr", {
        orderIdShort: "ORD-001",
        houseName: "Pressing Nyawera",
      });
      expect(rendered.title).toBe("Commande acceptée");
      expect(rendered.body).toContain("a été acceptée par Pressing Nyawera");
    });

    it("renders Swahili templates when requested", () => {
      const rendered = renderNotificationTemplate("order_accepted", "sw", {
        orderIdShort: "ORD-001",
        houseName: "Pressing Nyawera",
      });
      expect(rendered.title).toBe("Agizo limekubaliwa");
      expect(rendered.body).toContain("limekubaliwa na Pressing Nyawera");
    });

    it("renders English templates when requested", () => {
      const rendered = renderNotificationTemplate("order_created", "en", {
        orderIdShort: "ORD-999",
        houseName: "Clean Express",
      });
      expect(rendered.title).toBe("New order");
      expect(rendered.body).toBe("New order #ORD-999 placed at Clean Express.");
    });
  });

  describe("sendNotification", () => {
    it("creates an in-app notification for a user with rendered template", async () => {
      const res = await sendNotification({
        userId: "user-alice",
        orderId: "ord-abc",
        templateKey: "order_created",
        locale: "fr",
        params: {
          orderIdShort: "ABC",
          houseName: "Pressing Kivu",
        },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.userId).toBe("user-alice");
        expect(res.value.channel).toBe("in_app");
        expect(res.value.title).toBe("Nouvelle commande");
        expect(res.value.body).toContain("chez Pressing Kivu");
        expect(res.value.status).toBe("sent");
        expect(res.value.readAt).toBeNull();
      }
    });

    it("rejects notification creation when recipient (userId or phone) is absent", async () => {
      const res = await sendNotification({
        templateKey: "order_created",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Recipient missing");
      }
    });
  });

  describe("User Inbox Access & Isolation", () => {
    it("ensures a user can only read their own notifications", async () => {
      // Alice has 2 notifications
      await sendNotification({
        userId: "user-alice",
        templateKey: "order_created",
        locale: "fr",
        params: { orderIdShort: "A1", houseName: "House 1" },
      });
      await sendNotification({
        userId: "user-alice",
        templateKey: "washing",
        locale: "fr",
        params: { houseName: "House 1" },
      });

      // Bob has 1 notification
      await sendNotification({
        userId: "user-bob",
        templateKey: "order_created",
        locale: "fr",
        params: { orderIdShort: "B1", houseName: "House 2" },
      });

      // Fetch Alice's inbox
      const aliceInbox = await getUserInbox("user-alice");
      expect(aliceInbox.ok).toBe(true);
      if (aliceInbox.ok) {
        expect(aliceInbox.value.items).toHaveLength(2);
        expect(aliceInbox.value.unreadCount).toBe(2);
        // All items belong to Alice
        expect(aliceInbox.value.items.every((n) => n.userId === "user-alice")).toBe(true);
      }

      // Fetch Bob's inbox
      const bobInbox = await getUserInbox("user-bob");
      expect(bobInbox.ok).toBe(true);
      if (bobInbox.ok) {
        expect(bobInbox.value.items).toHaveLength(1);
        expect(bobInbox.value.unreadCount).toBe(1);
        expect(bobInbox.value.items[0].userId).toBe("user-bob");
      }
    });

    it("allows a user to mark their notification as read", async () => {
      const res = await sendNotification({
        userId: "user-alice",
        templateKey: "order_created",
        locale: "fr",
        params: { orderIdShort: "A1" },
      });
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const notifId = res.value.id;

      // Alice marks her notification as read
      const markRes = await markAsRead(notifId, "user-alice");
      expect(markRes.ok).toBe(true);
      if (markRes.ok) {
        expect(markRes.value).toBe(true);
      }

      const aliceInbox = await getUserInbox("user-alice");
      if (aliceInbox.ok) {
        expect(aliceInbox.value.unreadCount).toBe(0);
        expect(aliceInbox.value.items[0].readAt).not.toBeNull();
      }
    });

    it("prevents Bob from marking Alice's notification as read", async () => {
      const res = await sendNotification({
        userId: "user-alice",
        templateKey: "order_created",
        locale: "fr",
        params: { orderIdShort: "A1" },
      });
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const notifId = res.value.id;

      // Bob tries to mark Alice's notification
      const markRes = await markAsRead(notifId, "user-bob");
      expect(markRes.ok).toBe(true);
      if (markRes.ok) {
        expect(markRes.value).toBe(false);
      }

      // Alice's notification remains unread
      const aliceInbox = await getUserInbox("user-alice");
      if (aliceInbox.ok) {
        expect(aliceInbox.value.unreadCount).toBe(1);
        expect(aliceInbox.value.items[0].readAt).toBeNull();
      }
    });

    it("marks all notifications as read for a specific user only", async () => {
      await sendNotification({
        userId: "user-alice",
        templateKey: "order_created",
        locale: "fr",
      });
      await sendNotification({
        userId: "user-alice",
        templateKey: "order_accepted",
        locale: "fr",
      });
      await sendNotification({
        userId: "user-bob",
        templateKey: "order_created",
        locale: "fr",
      });

      const markAllRes = await markAllAsRead("user-alice");
      expect(markAllRes.ok).toBe(true);
      if (markAllRes.ok) {
        expect(markAllRes.value).toBe(2);
      }

      const aliceInbox = await getUserInbox("user-alice");
      if (aliceInbox.ok) {
        expect(aliceInbox.value.unreadCount).toBe(0);
      }

      // Bob's unread count must remain 1
      const bobInbox = await getUserInbox("user-bob");
      if (bobInbox.ok) {
        expect(bobInbox.value.unreadCount).toBe(1);
      }
    });
  });
});
