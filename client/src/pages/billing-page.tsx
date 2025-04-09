import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/date-utils";
import { useLocation } from "wouter";

// Form validation schema
const billingSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  purchasePrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.01, "Purchase price must be greater than 0")
  ),
  sellingPrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.01, "Selling price must be greater than 0")
  ),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Quantity must be at least 1")
  ),
  margin: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Margin cannot be negative").optional()
  ),
});

type BillingFormData = z.infer<typeof billingSchema>;

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [calculatedMargin, setCalculatedMargin] = useState(0);
  const [profit, setProfit] = useState(0);
  const [total, setTotal] = useState(0);
  
  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      productName: "",
      purchasePrice: 0, // Initialize with 0 instead of undefined to avoid NaN
      sellingPrice: 0, // Initialize with 0 instead of undefined to avoid NaN
      quantity: 1,
      margin: 20, // Default margin percentage
    },
  });
  
  // Watch form values for calculations
  const purchasePrice = form.watch("purchasePrice");
  const sellingPrice = form.watch("sellingPrice");
  const quantity = form.watch("quantity") || 1;
  const margin = form.watch("margin");

  // Calculate margin and profit when values change
  useEffect(() => {
    // Ensure we don't work with NaN or zero values that would cause division issues
    if (purchasePrice && sellingPrice && purchasePrice > 0) {
      // Calculate margin percentage
      const calculatedMarginPct = ((sellingPrice - purchasePrice) / purchasePrice) * 100;
      setCalculatedMargin(parseFloat(calculatedMarginPct.toFixed(2)));
      
      // Calculate profit
      const profitPerItem = sellingPrice - purchasePrice;
      const totalProfit = profitPerItem * quantity;
      setProfit(parseFloat(totalProfit.toFixed(2)));
      
      // Calculate total sale value
      const totalSale = sellingPrice * quantity;
      setTotal(parseFloat(totalSale.toFixed(2)));
    } else {
      // Reset values when inputs are invalid
      setCalculatedMargin(0);
      setProfit(0);
      setTotal(0);
    }
  }, [purchasePrice, sellingPrice, quantity]);

  // Handle margin changes
  const updatePriceFromMargin = (marginValue: number) => {
    // Check for valid purchase price and margin value
    if (purchasePrice > 0 && !isNaN(marginValue)) {
      // Calculate new selling price based on margin
      const newSellingPrice = purchasePrice * (1 + marginValue / 100);
      // Ensure we have a valid number and format it properly
      if (!isNaN(newSellingPrice)) {
        form.setValue("sellingPrice", parseFloat(newSellingPrice.toFixed(2)));
      }
    }
  };

  // Create billing mutation
  const billingMutation = useMutation({
    mutationFn: async (data: BillingFormData) => {
      // Calculate profit and total values
      const totalCost = data.purchasePrice! * data.quantity!;
      const totalSale = data.sellingPrice! * data.quantity!;
      const totalProfit = totalSale - totalCost;
      
      // First create a transaction for the expense (purchase)
      await apiRequest("POST", "/api/transactions", {
        type: "expense",
        amount: totalCost.toString(), // Convert to string to ensure proper handling
        category: "Inventory",
        description: `Purchase of ${data.quantity} ${data.productName} @ ${formatCurrency(data.purchasePrice!)} each`,
        timestamp: new Date(),
      });
      
      // Then create a transaction for the profit
      return await apiRequest("POST", "/api/transactions", {
        type: "profit",
        amount: totalSale.toString(), // Convert to string to ensure proper handling
        category: "Sales",
        description: `Sale of ${data.quantity} ${data.productName} @ ${formatCurrency(data.sellingPrice!)} each (profit: ${formatCurrency(totalProfit)})`,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sale recorded successfully",
        description: "The purchase and sale have been recorded to your transactions.",
      });
      
      // Reset form
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/summary"] });
      
      // Navigate to dashboard
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record sale",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BillingFormData) => {
    billingMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Billing System</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Sale</CardTitle>
            <CardDescription>
              Enter product details to record a sale. This will automatically create profit and expense transactions.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (margin !== undefined) {
                                updatePriceFromMargin(margin);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            step="1"
                            placeholder="1" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="margin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Margin (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            min="0"
                            placeholder="20" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              updatePriceFromMargin(parseFloat(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={billingMutation.isPending}
                >
                  {billingMutation.isPending ? "Processing..." : "Record Sale"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
              <CardDescription>
                Overview of the current transaction
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {purchasePrice && sellingPrice ? (
                <>
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-medium">{formatCurrency(purchasePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Selling Price:</span>
                    <span className="font-medium">{formatCurrency(sellingPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-medium">{calculatedMargin}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg">
                    <span>Total Purchase Cost:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(purchasePrice * quantity)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg">
                    <span>Total Sale Value:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xl mt-4 pt-4 border-t">
                    <span>Total Profit:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Enter product details to see the summary
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Understanding the automatic transaction recording
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">When you record a sale:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>An expense transaction is created for the purchase cost</li>
                  <li>A profit transaction is created for the sale amount</li>
                  <li>Both are automatically added to your dashboard</li>
                  <li>Graphs and statistics are immediately updated</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}