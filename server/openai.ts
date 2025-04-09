import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to get business insights based on shop data and user query
export async function getBusinessInsights(
  userId: number,
  userQuery: string,
  shopData: {
    salesData: any[];
    topProducts: any[];
    expenseSummary: any[];
    recentTransactions: any[];
    totalStats: {
      totalProfit: number;
      totalExpense: number;
      netBalance: number;
      transactionCount: number;
    };
  }
) {
  try {
    // Create a prompt that includes shop data and user query
    const systemPrompt = `
You are an intelligent business assistant for a shop owner's dashboard. 
The owner has the following metrics for their shop:

SALES SUMMARY:
- Total Profit: ${shopData.totalStats.totalProfit.toFixed(2)}
- Total Expenses: ${shopData.totalStats.totalExpense.toFixed(2)}
- Net Balance: ${shopData.totalStats.netBalance.toFixed(2)}
- Total Transactions: ${shopData.totalStats.transactionCount}

RECENT TRANSACTIONS:
${shopData.recentTransactions
  .map(
    (t) =>
      `- ${t.type.toUpperCase()}: ${t.amount} (${t.category}) - ${t.description}`
  )
  .join("\n")}

TOP PRODUCTS (if available):
${
  shopData.topProducts.length > 0
    ? shopData.topProducts
        .map((p) => `- ${p.name}: ${p.quantity} units, ${p.revenue} revenue`)
        .join("\n")
    : "No product data available yet"
}

EXPENSE BREAKDOWN:
${
  shopData.expenseSummary.length > 0
    ? shopData.expenseSummary
        .map((e) => `- ${e.category}: ${e.total}`)
        .join("\n")
    : "No categorized expense data available yet"
}

Based on this data, provide insightful business advice, answer questions, or suggest strategies for improvement.
Your answers should be specific, actionable, and directly related to the data provided.
Use your knowledge of business management principles to offer valuable insights.
If you cannot answer a question based on the data provided, acknowledge that limitation and suggest what data might be needed.
Keep responses concise, informative, and focused on practical advice.
`;

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Check for specific API errors
    if (error.status === 429) {
      if (error.code === 'insufficient_quota') {
        return "I apologize, but the AI service is currently unavailable due to quota limits. Your shop data has been analyzed, but the AI couldn't generate personalized insights. Please try again later or contact support to upgrade your plan.";
      } else {
        return "The AI service is experiencing high demand right now. Please try again in a few moments.";
      }
    } else if (error.status === 401 || error.status === 403) {
      return "There seems to be an authentication issue with the AI service. Please contact support.";
    } else {
      return "I apologize, but I'm having trouble analyzing your data right now. Please try again later.";
    }
  }
}