import {
  users,
  moodEntries,
  alerts,
  resources,
  wellnessTips,
  type User,
  type UpsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type Alert,
  type InsertAlert,
  type Resource,
  type InsertResource,
  type WellnessTip,
  type InsertWellnessTip,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, ne } from "drizzle-orm";
import { subDays, startOfDay } from "date-fns";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations for local authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUserGoogleId(userId: string, googleId: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;

  // Mood entry operations
  createMoodEntry(entry: InsertMoodEntry & { aiSentiment?: string; aiInsights?: string }): Promise<MoodEntry>;
  getMoodEntriesByUser(userId: string): Promise<MoodEntry[]>;
  getRecentMoodEntries(limit?: number): Promise<(MoodEntry & { user: User })[]>;
  
  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(): Promise<(Alert & { user: User })[]>;
  getAlertsByUser(userId: string): Promise<Alert[]>;
  markAlertRead(alertId: number): Promise<Alert | undefined>;
  resolveAlert(alertId: number): Promise<Alert | undefined>;

  // Resource operations
  getResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Wellness tip operations
  getWellnessTips(): Promise<WellnessTip[]>;
  getDailyTip(): Promise<WellnessTip | undefined>;
  createWellnessTip(tip: InsertWellnessTip): Promise<WellnessTip>;

  // Admin stats
  getStats(): Promise<{
    totalStudents: number;
    activeToday: number;
    totalAlerts: number;
    urgentAlerts: number;
    avgMood: number;
    avgStress: number;
  }>;

  // Get students with their stats
  getStudentsWithStats(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<User> {
    await db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, userId));
    const user = await this.getUser(userId);
    return user!;
  }

  async createUser(userData: Omit<UpsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await db.insert(users).values(userData);
    const [user] = await db.select().from(users).where(eq(users.email, userData.email!));
    return user!;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // For MySQL, we need to handle upsert manually
    if (userData.id) {
      const existingUser = await this.getUser(userData.id);
      if (existingUser) {
        await db
          .update(users)
          .set({ ...userData, updatedAt: new Date() })
          .where(eq(users.id, userData.id));
        const [user] = await db.select().from(users).where(eq(users.id, userData.id));
        return user!;
      }
    }
    await db.insert(users).values(userData);
    const [user] = await db.select().from(users).where(eq(users.email, userData.email!));
    return user!;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return this.getUser(userId);
  }

  // Mood entry operations
  async createMoodEntry(entry: InsertMoodEntry & { aiSentiment?: string; aiInsights?: string }): Promise<MoodEntry> {
    await db.insert(moodEntries).values(entry);
    const [moodEntry] = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, entry.userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(1);
    return moodEntry!;
  }

  async getMoodEntriesByUser(userId: string): Promise<MoodEntry[]> {
    return db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt));
  }

  async getRecentMoodEntries(limit = 50): Promise<(MoodEntry & { user: User })[]> {
    const entries = await db
      .select()
      .from(moodEntries)
      .innerJoin(users, eq(moodEntries.userId, users.id))
      .orderBy(desc(moodEntries.createdAt))
      .limit(limit);

    return entries.map(({ mood_entries, users }) => ({
      ...mood_entries,
      user: users,
    }));
  }

  // Alert operations
  async createAlert(alert: InsertAlert): Promise<Alert> {
    await db.insert(alerts).values(alert);
    const [newAlert] = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, alert.userId))
      .orderBy(desc(alerts.createdAt))
      .limit(1);
    return newAlert!;
  }

  async getAlerts(): Promise<(Alert & { user: User })[]> {
    const alertsWithUsers = await db
      .select()
      .from(alerts)
      .innerJoin(users, eq(alerts.userId, users.id))
      .orderBy(desc(alerts.createdAt));

    return alertsWithUsers.map(({ alerts, users }) => ({
      ...alerts,
      user: users,
    }));
  }

  async getAlertsByUser(userId: string): Promise<Alert[]> {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }

  async markAlertRead(alertId: number): Promise<Alert | undefined> {
    await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, alertId));
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId));
    return alert;
  }

  async resolveAlert(alertId: number): Promise<Alert | undefined> {
    await db
      .update(alerts)
      .set({ isResolved: true, isRead: true, resolvedAt: new Date() })
      .where(eq(alerts.id, alertId));
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId));
    return alert;
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    return db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    await db.insert(resources).values(resource);
    const [newResource] = await db
      .select()
      .from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(1);
    return newResource!;
  }

  // Wellness tip operations
  async getWellnessTips(): Promise<WellnessTip[]> {
    return db
      .select()
      .from(wellnessTips)
      .where(eq(wellnessTips.isActive, true))
      .orderBy(desc(wellnessTips.createdAt));
  }

  async getDailyTip(): Promise<WellnessTip | undefined> {
    const tips = await db
      .select()
      .from(wellnessTips)
      .where(eq(wellnessTips.isActive, true));

    if (tips.length === 0) return undefined;

    // Use current day to pick a consistent tip for today
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return tips[dayOfYear % tips.length];
  }

  async createWellnessTip(tip: InsertWellnessTip): Promise<WellnessTip> {
    await db.insert(wellnessTips).values(tip);
    const [newTip] = await db
      .select()
      .from(wellnessTips)
      .orderBy(desc(wellnessTips.createdAt))
      .limit(1);
    return newTip!;
  }

  // Admin stats
  async getStats(): Promise<{
    totalStudents: number;
    activeToday: number;
    totalAlerts: number;
    urgentAlerts: number;
    avgMood: number;
    avgStress: number;
  }> {
    const todayStart = startOfDay(new Date());

    // Get total students
    const studentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "student"));
    const totalStudents = studentsResult[0]?.count || 0;

    // Get active today (entries from today)
    const activeResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(moodEntries)
      .where(gte(moodEntries.createdAt, todayStart));
    const activeToday = activeResult[0]?.count || 0;

    // Get unread alerts
    const alertsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(eq(alerts.isRead, false));
    const totalAlerts = alertsResult[0]?.count || 0;

    // Get urgent alerts
    const urgentResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(and(eq(alerts.isRead, false), eq(alerts.alertType, "urgent")));
    const urgentAlerts = urgentResult[0]?.count || 0;

    // Get average mood and stress from last 7 days
    const weekAgo = subDays(new Date(), 7);
    const avgResult = await db
      .select({
        avgMood: sql<number>`coalesce(avg(${moodEntries.moodLevel}), 0)`,
        avgStress: sql<number>`coalesce(avg(${moodEntries.stressLevel}), 0)`,
      })
      .from(moodEntries)
      .where(gte(moodEntries.createdAt, weekAgo));

    return {
      totalStudents,
      activeToday,
      totalAlerts,
      urgentAlerts,
      avgMood: avgResult[0]?.avgMood || 0,
      avgStress: avgResult[0]?.avgStress || 0,
    };
  }

  // Get students with stats
  async getStudentsWithStats(): Promise<any[]> {
    const studentUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"));

    const result = await Promise.all(
      studentUsers.map(async (student) => {
        const entries = await this.getMoodEntriesByUser(student.id);
        const userAlerts = await db
          .select()
          .from(alerts)
          .where(and(eq(alerts.userId, student.id), eq(alerts.isResolved, false)));

        // Calculate streak
        let streak = 0;
        if (entries.length > 0) {
          const sortedEntries = [...entries].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          const today = startOfDay(new Date());
          let currentDate = today;
          
          for (const entry of sortedEntries) {
            const entryDate = startOfDay(new Date(entry.createdAt));
            const diff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diff <= 1) {
              streak++;
              currentDate = entryDate;
            } else {
              break;
            }
          }
        }

        // Calculate averages
        const avgMood = entries.length
          ? entries.reduce((sum, e) => sum + e.moodLevel, 0) / entries.length
          : 0;
        const avgStress = entries.length
          ? entries.reduce((sum, e) => sum + e.stressLevel, 0) / entries.length
          : 0;

        // Calculate trend
        let trend: "up" | "down" | "stable" = "stable";
        if (entries.length >= 6) {
          const recent = entries.slice(0, 3);
          const older = entries.slice(3, 6);
          const recentAvg = recent.reduce((sum, e) => sum + e.moodLevel, 0) / 3;
          const olderAvg = older.reduce((sum, e) => sum + e.moodLevel, 0) / 3;
          const diff = recentAvg - olderAvg;
          if (diff > 0.3) trend = "up";
          else if (diff < -0.3) trend = "down";
        }

        return {
          ...student,
          moodEntries: entries,
          streak,
          avgMood,
          avgStress,
          lastCheckIn: entries[0]?.createdAt || null,
          trend,
          hasAlert: userAlerts.length > 0,
        };
      })
    );

    return result;
  }
}

export const storage = new DatabaseStorage();
