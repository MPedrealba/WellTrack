import { sql, relations } from 'drizzle-orm';
import {
  index,
  json,
  mysqlTable,
  timestamp,
  varchar,
  int,
  text,
  boolean,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local authentication
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UUID()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }), // Optional for OAuth users
  googleId: varchar("google_id", { length: 255 }).unique(), // Google OAuth ID
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 20 }).default("student").notNull(), // 'student' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mood entries table for tracking student wellness
export const moodEntries = mysqlTable("mood_entries", {
  id: int("id").primaryKey().autoincrement(),

  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  moodLevel: int("mood_level").notNull(), // 1-5 scale
  stressLevel: int("stress_level").notNull(), // 1-5 scale
  journalEntry: text("journal_entry"), // Optional text entry
  aiSentiment: varchar("ai_sentiment", { length: 50 }), // AI-generated sentiment
  aiInsights: text("ai_insights"), // AI-generated insights
  moodScore: int("mood_score"), // Calculated mood score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alerts table for admin monitoring
export const alerts = mysqlTable("alerts", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  reason: text("reason").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});



// Wellness resources table
export const resources = mysqlTable("resources", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'stress', 'sleep', 'academic', 'crisis'
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  externalUrl: varchar("external_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily wellness tips
export const wellnessTips = mysqlTable("wellness_tips", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  iconName: varchar("icon_name", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  moodEntries: many(moodEntries),
  alerts: many(alerts),
}));

export const moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
  aiSentiment: true,
  aiInsights: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertWellnessTipSchema = createInsertSchema(wellnessTips).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertWellnessTip = z.infer<typeof insertWellnessTipSchema>;
export type WellnessTip = typeof wellnessTips.$inferSelect;

// Extended types with user info for admin views
export type AlertWithUser = Alert & { user: User };
export type MoodEntryWithUser = MoodEntry & { user: User };
