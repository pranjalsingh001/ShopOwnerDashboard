import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTransactionSchema, Transaction } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type EditTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
};

// Create schema for the form (extending the insert schema)
const formSchema = insertTransactionSchema
  .extend({
    timestamp: z.coerce.date(),
  })
  .refine((data) => {
    // Amount must be greater than 0
    return Number(data.amount) > 0;
  }, {
    message: "Amount must be greater than 0",
    path: ["amount"],
  });

export function EditTransactionDialog({ isOpen, onClose, transaction }: EditTransactionDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "profit",
      amount: "",
      category: "Sales",
      description: "",
      timestamp: new Date(),
    },
  });
  
  // Update form values when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type as "profit" | "expense",
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || "",
        timestamp: new Date(transaction.timestamp),
      });
      setSelectedType(transaction.type as "profit" | "expense");
    }
  }, [transaction, form]);
  
  const categories = {
    profit: ["Sales", "Investment", "Refund", "Other"],
    expense: ["Rent", "Utilities", "Inventory", "Salary", "Food", "Marketing", "Miscellaneous"],
  };
  
  const [selectedType, setSelectedType] = useState<"profit" | "expense">("profit");
  
  // Handle type change to update category options
  const onTypeChange = (value: "profit" | "expense") => {
    setSelectedType(value);
    // Reset category if current selection is not valid for new type
    if (!categories[value].includes(form.getValues("category"))) {
      form.setValue("category", categories[value][0]);
    }
  };
  
  const updateTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!transaction) throw new Error("No transaction to update");
      const res = await apiRequest("PUT", `/api/transactions/${transaction.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/summary"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateTransactionMutation.mutate(data);
  };
  
  if (!transaction) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: "profit" | "expense") => {
                        field.onChange(value);
                        onTypeChange(value);
                      }}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="profit" id="edit-profit" />
                        <label htmlFor="edit-profit">Profit</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="edit-expense" />
                        <label htmlFor="edit-expense">Expense</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories[selectedType].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateTransactionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
