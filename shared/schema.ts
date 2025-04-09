import { pgTable, text, serial, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
});

// Transactions table schema - Let's fix this first to get the app working
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["profit", "expense"] }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({
    id: true,
    userId: true,
  })
  .extend({
    // Fix the timestamp issue by allowing it to be a Date or a string
    timestamp: z.union([z.string(), z.date()]).optional(),
    // Fix the amount handling to ensure it's properly parsed as a number
    amount: z.preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val) : val),
      z.number().min(0.01, "Amount must be greater than 0")
    ),
    // Ensure type is accepted as string only with proper values
    type: z.enum(["profit", "expense"]),
  });

// Select types
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
