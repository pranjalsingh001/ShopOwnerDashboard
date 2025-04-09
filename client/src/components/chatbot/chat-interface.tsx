import { useState, useRef, useEffect } from "react";
import { Send, AlertCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hi! I'm your business assistant. Ask me anything about your shop's performance, sales trends, or for business advice.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Generate a unique message ID
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Reset error state
    setError(null);
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateId(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Send message to backend
      const response = await apiRequest("POST", "/api/chatbot", {
        message: userMessage.content,
      });
      
      const data = await response.json();
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: generateId(),
        content: data.reply,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Display a more user-friendly error message
      const errorMsg = "The AI service is currently unavailable. Your data is still being tracked, but personalized insights cannot be generated at this time.";
      setError(errorMsg);
      
      toast({
        title: "AI Service Unavailable",
        description: "Please try again later or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single message
  const renderMessage = (message: Message) => {
    return (
      <div
        key={message.id}
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        } mb-3 md:mb-4`}
      >
        <div
          className={`flex items-start ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} ${
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          } gap-1 md:gap-2`}
        >
          {message.role === "assistant" ? (
            <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                <Bot className="h-3 w-3 md:h-4 md:w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
              <AvatarFallback className="text-xs md:text-sm">YOU</AvatarFallback>
            </Avatar>
          )}
          <div
            className={`px-3 py-2 md:px-4 md:py-2 rounded-lg ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <p className="text-[10px] md:text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${isMobile ? 'h-[calc(100vh-140px)]' : 'h-[600px]'} flex flex-col`}>
      <CardHeader className="py-3 md:py-6">
        <CardTitle className="flex items-center text-base md:text-lg">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 md:h-8 md:w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Business Assistant</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0 relative">
        {error && (
          <Alert variant="destructive" className="mx-3 my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <ScrollArea 
          className={`${isMobile ? 'h-[calc(100vh-250px)]' : 'h-[450px]'} p-3 md:p-4`} 
          ref={scrollAreaRef as any}
        >
          <div className="space-y-3 md:space-y-4">
            {messages.map(renderMessage)}
          </div>
          
          {isLoading && (
            <div className="flex justify-center my-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 md:p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow text-sm md:text-base"
          />
          <Button 
            type="submit" 
            size={isMobile ? "sm" : "default"} 
            className="px-3"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}