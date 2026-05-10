import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userAuthorizations, InsertUserAuthorization, rooms, guests, InsertRoom, InsertGuest } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funções de autorização de usuários
export async function getUserAuthorization(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userAuthorizations)
    .where(eq(userAuthorizations.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserAuthorization(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const auth: InsertUserAuthorization = {
    userId,
    status: "pending",
  };
  
  await db.insert(userAuthorizations).values(auth);
  return auth;
}

export async function approveUserAuthorization(authId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db
    .update(userAuthorizations)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedBy,
    })
    .where(eq(userAuthorizations.id, authId));
}

export async function rejectUserAuthorization(authId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db
    .update(userAuthorizations)
    .set({ status: "rejected" })
    .where(eq(userAuthorizations.id, authId));
}

export async function getPendingAuthorizations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(userAuthorizations)
    .where(eq(userAuthorizations.status, "pending"));
}

// Funções para quartos e hóspedes
export async function getAllRoomsData() {
  const db = await getDb();
  if (!db) return [];
  
  const allRooms = await db.select().from(rooms);
  const allGuests = await db.select().from(guests);
  
  return allRooms.map(room => ({
    ...room,
    guests: allGuests.filter(guest => guest.roomId === room.id)
  }));
}

export async function getRoomData(roomNumber: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const room = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNumber)).limit(1);
  if (room.length === 0) return undefined;
  
  const roomGuests = await db.select().from(guests).where(eq(guests.roomId, room[0].id));
  
  return {
    ...room[0],
    guests: roomGuests
  };
}

export async function updateGuestData(guestData: InsertGuest) {
  const db = await getDb();
  if (!db) return;
  
  // Usar day + roomId como identificador único para o hóspede no dia
  const existing = await db
    .select()
    .from(guests)
    .where(eq(guests.roomId, guestData.roomId!))
    .limit(1)
    .then(results => results.filter(r => r.day === guestData.day));
    
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
    // 1. Upsert room
    const existingRoom = await db.select().from(rooms).where(eq(rooms.roomNumber, roomData.roomNumber)).limit(1);
    let roomId: number;
    
    if (existingRoom.length > 0) {
      roomId = existingRoom[0].id;
    } else {
      const result = await db.insert(rooms).values({ roomNumber: roomData.roomNumber });
      roomId = (result[0] as any).insertId;
    }
    
    // 2. Upsert guests
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
        .where(eq(guests.roomId, roomId))
        .limit(1)
        .then(results => results.filter(r => r.day === guest.day));
        
      if (existingGuest.length > 0) {
        await db.update(guests).set(guestInsert).where(eq(guests.id, existingGuest[0].id));
      } else {
        await db.insert(guests).values(guestInsert);
      }
    }
  }
}
