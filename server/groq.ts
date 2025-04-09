import { Transaction, User } from "@shared/schema";
import { OpenAI } from "openai";

// Initialize the client with the Groq API key but using the OpenAI-compatible API base URL
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// The model to use for completions - use Llama 3 which is available on Groq
const MODEL = "llama3-70b-8192";

type ShopData = {
  salesData: Transaction[];
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  expenseSummary: Array<{ category: string; total: number }>;
  recentTransactions: Transaction[];
  totalStats: {
    totalProfit: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  };
};

/**
 * Gets business insights from Groq API based on shop data and user query
 */
export async function getBusinessInsights(
  userId: number,
  userQuery: string,
  shopData: ShopData
): Promise<string> {
  try {
    // Format the input data for the AI
    const totalProfit = shopData.totalStats.totalProfit.toFixed(2);
    const totalExpense = shopData.totalStats.totalExpense.toFixed(2);
    const netBalance = shopData.totalStats.netBalance.toFixed(2);
    
    // Get top 3 products by revenue
    const topProductsString = shopData.topProducts
      .slice(0, 3)
      .map(p => `${p.name}: ${p.quantity} units, $${p.revenue.toFixed(2)} revenue`)
      .join("\n");
    
    // Get top 3 expense categories
    const topExpensesString = shopData.expenseSummary
      .slice(0, 3)
      .map(e => `${e.category}: $${e.total.toFixed(2)}`)
      .join("\n");
    
    // Format recent transactions, handling the string amount type
    const recentTransactionsString = shopData.recentTransactions
      .slice(0, 5)
      .map(t => {
        // Convert string amount to number for formatting
        const amount = typeof t.amount === 'string' ? parseFloat(String(t.amount)) : Number(t.amount);
        // Format the date using the timestamp field
        const date = new Date(t.timestamp).toLocaleDateString();
        return `- ${t.type.toUpperCase()}: $${amount.toFixed(2)} - ${t.description || 'No description'} (${date})`;
      })
      .join("\n");
    
    // Create context for the AI
    const prompt = `
You are an expert business advisor for a shop owner. 
Based on the following business data, please provide insightful and helpful advice responding to the owner's question.

SHOP FINANCIAL SUMMARY:
- Total Profit: $${totalProfit}
- Total Expenses: $${totalExpense}
- Net Balance: $${netBalance}
- Total Transactions: ${shopData.totalStats.transactionCount}

TOP SELLING PRODUCTS:
${topProductsString}

TOP EXPENSE CATEGORIES:
${topExpensesString}

RECENT TRANSACTIONS (LAST 5):
${recentTransactionsString}

SHOP OWNER'S QUESTION: "${userQuery}"

Please provide a helpful, concise response with actionable advice based on the data. If the question is not related to the shop's financial data, politely explain that you can only provide insights based on the shop's financial information.
`;

    // Make the API call to Groq using the OpenAI-compatible API
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful business assistant that provides insights and advice based on shop data.",
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again with a more specific question.";
  } catch (error: any) {
    console.error("Groq API error:", error);
    
    // Check for specific API errors
    if (error.status === 429) {
      return "I apologize, but the AI service is currently experiencing high demand. Please try again in a few moments.";
    } else if (error.status === 401 || error.status === 403) {
      return "There seems to be an authentication issue with the AI service. Please contact support.";
    } else {
      return "I apologize, but I'm having trouble analyzing your data right now. Please try again later.";
    }
  }
}