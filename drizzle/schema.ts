import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de autorização de usuários
export const userAuthorizations = mysqlTable("user_authorizations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAuthorization = typeof userAuthorizations.$inferSelect;
export type InsertUserAuthorization = typeof userAuthorizations.$inferInsert;

// Tabela de quartos
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomNumber: int("roomNumber").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Tabela de hóspedes
export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  day: varchar("day", { length: 10 }).notNull(), // "01", "02", etc.
  firstName: text("firstName"),
  lastName: text("lastName"),
  documentNumber: varchar("documentNumber", { length: 20 }),
  documentFile: text("documentFile"), // URL do arquivo no S3
  documentFileName: text("documentFileName"),
  photoFile: text("photoFile"), // URL do arquivo no S3
  photoFileName: text("photoFileName"),
  reservationEngine: text("reservationEngine"),
  daily: varchar("daily", { length: 20 }),
  launch: varchar("launch", { length: 20 }),
  payment: varchar("payment", { length: 20 }),
  finalBalance: varchar("finalBalance", { length: 20 }),
  paymentMethod: text("paymentMethod"),
  entryTime: varchar("entryTime", { length: 10 }),
  exitTime: varchar("exitTime", { length: 10 }),
  cpfValid: int("cpfValid").default(0), // 0 ou 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;