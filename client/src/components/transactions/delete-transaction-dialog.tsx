import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/date-utils";

type DeleteTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
};

export function DeleteTransactionDialog({ isOpen, onClose, transaction }: DeleteTransactionDialogProps) {
  const { toast } = useToast();
  
  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {
      if (!transaction) throw new Error("No transaction to delete");
      await apiRequest("DELETE", `/api/transactions/${transaction.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/summary"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = () => {
    deleteTransactionMutation.mutate();
  };
  
  if (!transaction) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span className={`${transaction.type === 'profit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'profit' ? 'Profit' : 'Expense'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Category:</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className={`font-medium ${transaction.type === 'profit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'profit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{formatDate(transaction.timestamp)}</span>
            </div>
            {transaction.description && (
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span className="text-right">{transaction.description}</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteTransactionMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTransactionMutation.isPending}
          >
            {deleteTransactionMutation.isPending ? "Deleting..." : "Delete Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
