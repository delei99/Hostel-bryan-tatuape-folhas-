import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, userAuthorizations, InsertUserAuthorization, rooms, guests, InsertRoom, InsertGuest } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return results[0] || null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(users).values(user).onConflictDoUpdate({
      target: users.openId,
      set: {
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        lastSignedIn: new Date(),
      }
    });
  } catch (error) {
    console.error("[Database] Error upserting user:", error);
  }
}

export async function getUserAuthorization(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(userAuthorizations).where(eq(userAuthorizations.userId, userId)).limit(1);
  return results[0] || null;
}

export async function getUserAuthorizations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userAuthorizations);
}

export async function getPendingAuthorizations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userAuthorizations).where(eq(userAuthorizations.status, "pending"));
}

export async function createUserAuthorization(auth: InsertUserAuthorization | number) {
  const db = await getDb();
  if (!db) return;
  const values = typeof auth === "number" ? { userId: auth, status: "pending" as const } : auth;
  return await db.insert(userAuthorizations).values(values);
}

export async function approveUserAuthorization(authId: number, adminId: number) {
  const db = await getDb();
  if (!db) return;
  return await db.update(userAuthorizations)
    .set({ status: "approved", approvedBy: adminId, approvedAt: new Date() })
    .where(eq(userAuthorizations.id, authId));
}

export async function rejectUserAuthorization(authId: number, adminId: number) {
  const db = await getDb();
  if (!db) return;
  return await db.update(userAuthorizations)
    .set({ status: "rejected", approvedBy: adminId, approvedAt: new Date() })
    .where(eq(userAuthorizations.id, authId));
}

export async function getAllRoomsData() {
  const db = await getDb();
  if (!db) return [];
  
  const allRooms = await db.select().from(rooms);
  const allGuests = await db.select().from(guests);
  
  return allRooms.map(room => ({
    ...room,
    guests: allGuests.filter(g => g.roomId === room.id)
  }));
}

export async function getRoomData(roomNumber: number) {
  const db = await getDb();
  if (!db) return null;
  
  const room = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNumber)).limit(1);
  if (room.length === 0) return null;
  
  const roomGuests = await db.select().from(guests).where(eq(guests.roomId, room[0].id));
  return {
    ...room[0],
    guests: roomGuests
  };
}

export async function updateGuestData(guestData: InsertGuest) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db
    .select()
    .from(guests)
    .where(and(eq(guests.roomId, guestData.roomId!), eq(guests.day, guestData.day!)))
    .limit(1);
    
  if (existing.length > 0) {
    await db.update(guests).set(guestData).where(eq(guests.id, existing[0].id));
  } else {
    await db.insert(guests).values(guestData);
  }
}

export async function saveAllRoomsData(roomsData: any[]) {
  const db = await getDb();
  if (!db) return;

  for (const roomData of roomsData) {
    let room = await db.select().from(rooms).where(eq(rooms.roomNumber, roomData.roomNumber)).limit(1);
    let roomId: number;

    if (room.length === 0) {
      const inserted = await db.insert(rooms).values({ roomNumber: roomData.roomNumber }).returning();
      roomId = inserted[0].id;
    } else {
      roomId = room[0].id;
    }

    for (const guest of roomData.guests) {
      const guestInsert: InsertGuest = {
        roomId,
        day: guest.day,
        firstName: guest.firstName,
        lastName: guest.lastName,
        documentNumber: guest.documentNumber,
        documentFile: guest.documentFile,
        documentFileName: guest.documentFileName,
        photoFile: guest.photoFile,
        photoFileName: guest.photoFileName,
        reservationEngine: guest.reservationEngine,
        daily: guest.daily,
        launch: guest.launch,
        payment: guest.payment,
        finalBalance: guest.finalBalance,
        paymentMethod: guest.paymentMethod,
        entryTime: guest.entryTime,
        exitTime: guest.exitTime,
        cpfValid: guest.cpfValid ? 1 : 0,
      };
      
      const existingGuest = await db
        .select()
        .from(guests)
        .where(and(eq(guests.roomId, roomId), eq(guests.day, guest.day)))
        .limit(1);
        
      if (existingGuest.length > 0) {
        await db.update(guests).set(guestInsert).where(eq(guests.id, existingGuest[0].id));
      } else {
        await db.insert(guests).values(guestInsert);
      }
    }
  }
}
