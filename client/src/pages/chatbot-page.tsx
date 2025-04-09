import { ChatInterface } from "@/components/chatbot/chat-interface";

export default function ChatbotPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Business Assistant</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="col-span-2 xl:col-span-1">
          <ChatInterface />
        </div>
        
        <div className="space-y-6 col-span-2 xl:col-span-1">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">How can I help you?</h2>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Business Insights</h3>
                <p className="text-sm text-muted-foreground">
                  "What are my top selling products this month?"
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Financial Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  "What's my profit margin trend over the last quarter?"
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Strategy Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  "How can I improve my shop's profitability?"
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Expense Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  "What are my biggest expense categories?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}