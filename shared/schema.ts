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

// 1. Session storage for Authentication
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire)
  ]
);

// 2. User Table (Modified to handle both local and Google Auth)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`), // Fixed UUID syntax for MySQL
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }), 
  googleId: varchar("google_id", { length: 255 }).unique(), 
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 20 }).default("student").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(), // Auto-updates on changes
});

// 3. Mood Tracking Table
export const moodEntries = mysqlTable("mood_entries", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  moodLevel: int("mood_level").notNull(), 
  stressLevel: int("stress_level").notNull(), 
  journalEntry: text("journal_entry"), 
  aiSentiment: varchar("ai_sentiment", { length: 50 }), 
  aiInsights: text("ai_insights"), 
  moodScore: int("mood_score"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Admin Alerts
export const alerts = mysqlTable("alerts", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  reason: text("reason").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// 5. Wellness Tips Table
export const wellnessTips = mysqlTable("wellness_tips", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Resources Table
export const resources = mysqlTable("resources", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  link: varchar("link", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// 7. Relations Definitions
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

// 8. Zod Schemas for Validation
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({ id: true, createdAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertWellnessTipSchema = createInsertSchema(wellnessTips).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });


// 9. Type Exports
export type User = typeof users.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type WellnessTip = typeof wellnessTips.$inferSelect;
export type Resource = typeof resources.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;
export type InsertAlert = typeof alerts.$inferInsert;
export type InsertWellnessTip = typeof wellnessTips.$inferInsert;
export type InsertResource = typeof resources.$inferInsert;
