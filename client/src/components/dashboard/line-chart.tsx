import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/date-utils";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type LineChartProps = {
  isLoading: boolean;
  transactions?: Transaction[];
  startDate: Date;
  endDate: Date;
};

export function TransactionLineChart({ isLoading, transactions = [], startDate, endDate }: LineChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    
    // Generate array of all days in the date range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize data structure with zeros for all dates
    const dailyData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        displayDate: format(date, 'MMM dd'),
        profit: 0,
        expense: 0
      };
    });
    
    // Aggregate transactions by date
    transactions.forEach(transaction => {
      const dateStr = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
      const dayData = dailyData.find(day => day.date === dateStr);
      
      if (dayData) {
        const amount = Number(transaction.amount);
        if (transaction.type === 'profit') {
          dayData.profit += amount;
        } else {
          dayData.expense += amount;
        }
      }
    });
    
    return dailyData;
  }, [transactions, startDate, endDate]);
  
  if (isLoading) {
    return (
      <Card className="bg-white p-4">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg font-semibold">Monthly Trend</CardTitle>
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
    <Card className="bg-white">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis
              tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#ef4444" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
