import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userAuthorizations = pgTable("user_authorizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  status: text("status").default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roomNumber: integer("roomNumber").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roomId: integer("roomId").notNull(),
  day: varchar("day", { length: 10 }).notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  documentNumber: varchar("documentNumber", { length: 20 }),
  documentFile: text("documentFile"),
  documentFileName: text("documentFileName"),
  photoFile: text("photoFile"),
  photoFileName: text("photoFileName"),
  reservationEngine: text("reservationEngine"),
  daily: varchar("daily", { length: 20 }),
  launch: varchar("launch", { length: 20 }),
  payment: varchar("payment", { length: 20 }),
  finalBalance: varchar("finalBalance", { length: 20 }),
  paymentMethod: text("paymentMethod"),
  entryTime: varchar("entryTime", { length: 10 }),
  exitTime: varchar("exitTime", { length: 10 }),
  cpfValid: integer("cpfValid").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserAuthorization = typeof userAuthorizations.$inferSelect;
export type InsertUserAuthorization = typeof userAuthorizations.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;
