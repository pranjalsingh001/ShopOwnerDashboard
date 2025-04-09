import { users, type User, type InsertUser, 
         transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Define the interface for our storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  updateTransaction(id: number, transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Statistics and summary
  getTransactionSummary(userId: number): Promise<{
    totalProfit: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  }>;

  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    // Create session table manually since the createTableIfMissing flag doesn't seem to work
    pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `).catch(err => console.error('Error creating session table:', err));
    
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      tableName: 'session'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  // Transaction operations
  async createTransaction(userId: number, insertTransaction: InsertTransaction): Promise<Transaction> {
    // Process timestamp if it's a string by converting to Date
    let finalData: any = { ...insertTransaction };
    
    // Remove userId from the insertTransaction as we'll add it separately
    if ('userId' in finalData) {
      delete finalData.userId;
    }
    
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...finalData,
        userId: userId,
        timestamp: insertTransaction.timestamp 
          ? new Date(insertTransaction.timestamp) 
          : new Date()
      })
      .returning();
    
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    
    return transaction || undefined;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
      
    // Ensure we're returning a proper array of Transaction objects
    return Array.isArray(results) ? results : [];
  }

  async updateTransaction(id: number, updateData: InsertTransaction): Promise<Transaction> {
    // Process timestamp if it's a string
    let finalData: any = { ...updateData };
    
    // Remove userId from the updateData as it shouldn't be modified
    if ('userId' in finalData) {
      delete finalData.userId;
    }
    
    // Convert timestamp to Date if it exists
    if (updateData.timestamp) {
      finalData.timestamp = new Date(updateData.timestamp);
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set(finalData)
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db
      .delete(transactions)
      .where(eq(transactions.id, id));
  }

  // Statistics and summary
  async getTransactionSummary(userId: number): Promise<{
    totalProfit: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  }> {
    // Get all transactions for the user and calculate summary in JavaScript
    const userTransactions = await this.getTransactionsByUserId(userId);
    
    let totalProfit = 0;
    let totalExpense = 0;
    
    userTransactions.forEach(transaction => {
      const amount = Number(transaction.amount);
      
      if (transaction.type === 'profit') {
        totalProfit += amount;
      } else if (transaction.type === 'expense') {
        totalExpense += amount;
      }
    });
    
    return {
      totalProfit,
      totalExpense,
      netBalance: totalProfit - totalExpense,
      transactionCount: userTransactions.length
    };
  }
}

export const storage = new DatabaseStorage();
