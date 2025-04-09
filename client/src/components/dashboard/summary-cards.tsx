import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/date-utils";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ReceiptIcon } from "lucide-react";

type SummaryCardsProps = {
  isLoading: boolean;
  data?: {
    totalProfit: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    profitChange?: number;
    expenseChange?: number;
    balanceChange?: number;
    transactionCountChange?: number;
  };
};

export function SummaryCards({ isLoading, data }: SummaryCardsProps) {
  // Default values based on the image
  const profitChange = data?.profitChange !== undefined ? data.profitChange : 12.5;
  const expenseChange = data?.expenseChange !== undefined ? data.expenseChange : 8.2;
  const balanceChange = data?.balanceChange !== undefined ? data.balanceChange : 15.3;
  const transactionCountChange = data?.transactionCountChange || 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Profit Card */}
      <Card className="bg-white p-4 border-0 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Profit</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalProfit || 0)}</h3>
            )}
          </div>
          <div className="rounded-full bg-green-100 p-2">
            <ArrowUpIcon className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-green-600 font-medium">+{profitChange}%</span>
          <span className="text-gray-500 ml-1">from last period</span>
        </div>
      </Card>
      
      {/* Total Expense Card */}
      <Card className="bg-white p-4 border-0 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expense</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-red-600">{formatCurrency(data?.totalExpense || 0)}</h3>
            )}
          </div>
          <div className="rounded-full bg-red-100 p-2">
            <ArrowDownIcon className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-red-600 font-medium">+{expenseChange}%</span>
          <span className="text-gray-500 ml-1">from last period</span>
        </div>
      </Card>
      
      {/* Net Balance Card */}
      <Card className="bg-white p-4 border-0 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(data?.netBalance || 0)}</h3>
            )}
          </div>
          <div className="rounded-full bg-blue-100 p-2">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-green-600 font-medium">+{balanceChange}%</span>
          <span className="text-gray-500 ml-1">from last period</span>
        </div>
      </Card>
      
      {/* Transaction Count Card */}
      <Card className="bg-white p-4 border-0 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{data?.transactionCount || 0}</h3>
            )}
          </div>
          <div className="rounded-full bg-gray-100 p-2">
            <ReceiptIcon className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-green-600 font-medium">+{transactionCountChange} transactions</span>
          <span className="text-gray-500 ml-1">this period</span>
        </div>
      </Card>
    </div>
  );
}
