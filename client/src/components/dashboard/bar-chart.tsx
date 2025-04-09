import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/date-utils";
import { format, parseISO, subMonths, eachMonthOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type BarChartProps = {
  isLoading: boolean;
  transactions?: Transaction[];
};

export function MonthlyBarChart({ isLoading, transactions = [] }: BarChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    
    // Generate last 6 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // 6 months including current
    
    // Generate array of all months in the date range
    const monthRange = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize data structure with zeros for all months
    const monthlyData = monthRange.map(date => {
      const monthStr = format(date, 'yyyy-MM');
      return {
        month: monthStr,
        displayMonth: format(date, 'MMM'),
        profit: 0,
        expense: 0,
        net: 0
      };
    });
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const txDate = new Date(transaction.timestamp);
      const monthStr = format(txDate, 'yyyy-MM');
      const monthData = monthlyData.find(m => m.month === monthStr);
      
      if (monthData) {
        const amount = Number(transaction.amount);
        if (transaction.type === 'profit') {
          monthData.profit += amount;
          monthData.net += amount;
        } else {
          monthData.expense += amount;
          monthData.net -= amount;
        }
      }
    });
    
    return monthlyData;
  }, [transactions]);
  
  if (isLoading) {
    return (
      <Card className="bg-white p-4 col-span-full">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg font-semibold">Month-over-Month Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-lg border">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <Card className="bg-white col-span-full">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Month-over-Month Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayMonth" />
            <YAxis
              tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="profit" name="Profit" fill="#22c55e" />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" />
            <Bar dataKey="net" name="Net" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
