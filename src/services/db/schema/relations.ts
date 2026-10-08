import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import { fabrics, items, services } from "./catalog";
import { courierZones, neighborhoods, zones } from "./coverage";
import {
  houseClosures,
  houseCoverage,
  houseExclusions,
  houseHours,
  houseItems,
  houseMembers,
  houses,
} from "./house";
import { courierProfiles, courierShifts, missions } from "./mission";
import { cashLedger, orderPhotos } from "./ops";
import { disputes, orderEvents, orderItems, orders } from "./order";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const zonesRelations = relations(zones, ({ many }) => ({
  neighborhoods: many(neighborhoods),
}));

export const neighborhoodsRelations = relations(
  neighborhoods,
  ({ one, many }) => ({
    zone: one(zones, {
      fields: [neighborhoods.zoneId],
      references: [zones.id],
    }),
    houses: many(houses),
    coverage: many(houseCoverage),
  })
);

export const housesRelations = relations(houses, ({ one, many }) => ({
  neighborhood: one(neighborhoods, {
    fields: [houses.neighborhoodId],
    references: [neighborhoods.id],
  }),
  members: many(houseMembers),
  hours: many(houseHours),
  closures: many(houseClosures),
  coverage: many(houseCoverage),
  items: many(houseItems),
  exclusions: many(houseExclusions),
  orders: many(orders),
}));

export const houseMembersRelations = relations(houseMembers, ({ one }) => ({
  house: one(houses, {
    fields: [houseMembers.houseId],
    references: [houses.id],
  }),
  user: one(user, { fields: [houseMembers.userId], references: [user.id] }),
}));

export const houseHoursRelations = relations(houseHours, ({ one }) => ({
  house: one(houses, { fields: [houseHours.houseId], references: [houses.id] }),
}));

export const houseClosuresRelations = relations(houseClosures, ({ one }) => ({
  house: one(houses, {
    fields: [houseClosures.houseId],
    references: [houses.id],
  }),
}));

export const houseCoverageRelations = relations(houseCoverage, ({ one }) => ({
  house: one(houses, {
    fields: [houseCoverage.houseId],
    references: [houses.id],
  }),
  neighborhood: one(neighborhoods, {
    fields: [houseCoverage.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));

export const houseItemsRelations = relations(houseItems, ({ one }) => ({
  house: one(houses, { fields: [houseItems.houseId], references: [houses.id] }),
  service: one(services, {
    fields: [houseItems.serviceId],
    references: [services.id],
  }),
  item: one(items, { fields: [houseItems.itemId], references: [items.id] }),
  fabric: one(fabrics, {
    fields: [houseItems.fabricId],
    references: [fabrics.id],
  }),
}));

export const houseExclusionsRelations = relations(
  houseExclusions,
  ({ one }) => ({
    house: one(houses, {
      fields: [houseExclusions.houseId],
      references: [houses.id],
    }),
    item: one(items, {
      fields: [houseExclusions.itemId],
      references: [items.id],
    }),
    fabric: one(fabrics, {
      fields: [houseExclusions.fabricId],
      references: [fabrics.id],
    }),
  })
);

export const courierProfilesRelations = relations(
  courierProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [courierProfiles.userId],
      references: [user.id],
    }),
    shifts: many(courierShifts),
    zones: many(courierZones),
  })
);

export const courierShiftsRelations = relations(courierShifts, ({ one }) => ({
  profile: one(courierProfiles, {
    fields: [courierShifts.courierId],
    references: [courierProfiles.userId],
  }),
}));

export const courierZonesRelations = relations(courierZones, ({ one }) => ({
  profile: one(courierProfiles, {
    fields: [courierZones.courierId],
    references: [courierProfiles.userId],
  }),
  zone: one(zones, { fields: [courierZones.zoneId], references: [zones.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(user, { fields: [orders.customerId], references: [user.id] }),
  house: one(houses, { fields: [orders.houseId], references: [houses.id] }),
  neighborhood: one(neighborhoods, {
    fields: [orders.neighborhoodId],
    references: [neighborhoods.id],
  }),
  items: many(orderItems),
  events: many(orderEvents),
  missions: many(missions),
  photos: many(orderPhotos),
  disputes: many(disputes),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  houseItem: one(houseItems, {
    fields: [orderItems.houseItemId],
    references: [houseItems.id],
  }),
  service: one(services, {
    fields: [orderItems.serviceId],
    references: [services.id],
  }),
  item: one(items, { fields: [orderItems.itemId], references: [items.id] }),
  fabric: one(fabrics, {
    fields: [orderItems.fabricId],
    references: [fabrics.id],
  }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
  actor: one(user, { fields: [orderEvents.actorId], references: [user.id] }),
  onBehalfOfHouse: one(houses, {
    fields: [orderEvents.onBehalfOfHouseId],
    references: [houses.id],
  }),
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  order: one(orders, { fields: [missions.orderId], references: [orders.id] }),
  courier: one(user, { fields: [missions.courierId], references: [user.id] }),
  photos: many(orderPhotos),
}));

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  order: one(orders, { fields: [disputes.orderId], references: [orders.id] }),
  photos: many(orderPhotos),
}));

export const orderPhotosRelations = relations(orderPhotos, ({ one }) => ({
  order: one(orders, {
    fields: [orderPhotos.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [orderPhotos.orderItemId],
    references: [orderItems.id],
  }),
  mission: one(missions, {
    fields: [orderPhotos.missionId],
    references: [missions.id],
  }),
  dispute: one(disputes, {
    fields: [orderPhotos.disputeId],
    references: [disputes.id],
  }),
}));

export const cashLedgerRelations = relations(cashLedger, ({ one }) => ({
  order: one(orders, { fields: [cashLedger.orderId], references: [orders.id] }),
  mission: one(missions, {
    fields: [cashLedger.missionId],
    references: [missions.id],
  }),
  house: one(houses, { fields: [cashLedger.houseId], references: [houses.id] }),
  courier: one(user, { fields: [cashLedger.courierId], references: [user.id] }),
}));
