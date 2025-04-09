import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/date-utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type PieChartProps = {
  isLoading: boolean;
  transactions?: Transaction[];
  type: "profit" | "expense";
};

export function CategoryPieChart({ isLoading, transactions = [], type }: PieChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Process data for chart
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    
    // Filter transactions by type
    const filteredTransactions = transactions.filter(t => t.type === type);
    
    // Group by category
    const categoryMap = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const amount = Number(transaction.amount);
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + amount);
    });
    
    // Convert map to array of objects
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [transactions, type]);
  
  const title = type === 'expense' ? 'Expense by Category' : 'Profit by Category';
  
  if (isLoading) {
    return (
      <Card className="bg-white p-4">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-lg border">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-blue-600">
            {formatCurrency(payload[0].value)} ({((payload[0].value / chartData.reduce((sum, entry) => sum + entry.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No {type} transactions to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
