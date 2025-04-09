import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { getBusinessInsights } from "./groq";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    try {
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(userId, validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const transactionId = parseInt(req.params.id);
    
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    try {
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to modify this transaction" });
      }
      
      const validatedData = insertTransactionSchema.parse(req.body);
      const updatedTransaction = await storage.updateTransaction(transactionId, validatedData);
      res.json(updatedTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const transactionId = parseInt(req.params.id);
    
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    try {
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this transaction" });
      }
      
      await storage.deleteTransaction(transactionId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Summary statistics
  app.get("/api/stats/summary", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    try {
      const summary = await storage.getTransactionSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary statistics" });
    }
  });

  // Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const { message } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message format" });
    }
    
    try {
      // Get user's transactions for context
      const transactions = await storage.getTransactionsByUserId(userId);
      const summary = await storage.getTransactionSummary(userId);
      
      // Process transactions to extract insights
      const recentTransactions = transactions.slice(0, 10); // Last 10 transactions
      
      // Group transactions by category for expense summary
      const expenseSummary = transactions
        .filter(t => t.type === "expense")
        .reduce((acc: any[], t) => {
          const existingCategory = acc.find(item => item.category === t.category);
          const amount = parseFloat(t.amount);
          
          if (existingCategory) {
            existingCategory.total += amount;
          } else {
            acc.push({ category: t.category, total: amount });
          }
          
          return acc;
        }, [])
        .sort((a, b) => b.total - a.total)
        .slice(0, 5); // Top 5 expense categories
      
      // Extract product info from descriptions (basic approach)
      const productRegex = /Sale of (\d+) (.+?) @/;
      const topProducts = transactions
        .filter(t => t.type === "profit" && typeof t.description === 'string')
        .filter(t => productRegex.test(t.description as string))
        .reduce((acc: any[], t) => {
          // At this point, we know t.description is a string
          const matches = (t.description as string).match(productRegex);
          if (matches) {
            const quantity = parseInt(matches[1]);
            const productName = matches[2];
            const revenue = parseFloat(t.amount);
            
            const existingProduct = acc.find(item => item.name === productName);
            
            if (existingProduct) {
              existingProduct.quantity += quantity;
              existingProduct.revenue += revenue;
            } else {
              acc.push({ name: productName, quantity, revenue });
            }
          }
          return acc;
        }, [])
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5 products
      
      // Get AI insights based on shop data and user query
      const shopData = {
        salesData: transactions.filter(t => t.type === "profit"),
        topProducts,
        expenseSummary,
        recentTransactions,
        totalStats: summary
      };
      
      const reply = await getBusinessInsights(userId, message, shopData);
      res.json({ reply });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Failed to process chatbot request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
