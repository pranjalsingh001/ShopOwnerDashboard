import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionLineChart } from "@/components/dashboard/line-chart";
import { CategoryPieChart } from "@/components/dashboard/pie-chart";
import { MonthlyBarChart } from "@/components/dashboard/bar-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { Transaction } from "@shared/schema";
import { PeriodType, DateRange, getDateRangeFromPeriod } from "@/lib/date-utils";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>("month");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPeriod("month"));
  const [showAddModal, setShowAddModal] = useState(false);

  // Update date range when period changes
  const handlePeriodChange = (period: PeriodType) => {
    setCurrentPeriod(period);
    if (period !== "custom") {
      setDateRange(getDateRangeFromPeriod(period));
    }
  };

  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Fetch summary stats
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["/api/stats/summary"],
  });

  // Filter transactions by date range
  const filteredTransactions = transactions?.filter(transaction => {
    const txDate = new Date(transaction.timestamp);
    return txDate >= dateRange.startDate && txDate <= dateRange.endDate;
  });

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 lg:ml-64">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Overview of your shop's financial performance</p>
            </div>
            
            {/* Period Filter */}
            <PeriodFilter
              currentPeriod={currentPeriod}
              onPeriodChange={handlePeriodChange}
            />
            
            {/* Custom Date Picker (shown only when "Custom" is selected) */}
            {currentPeriod === "custom" && (
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onApply={() => {/* Apply filters */}}
              />
            )}
            
            {/* Summary Cards */}
            <SummaryCards
              isLoading={isLoadingSummary}
              data={summary}
            />
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Line Chart */}
              <TransactionLineChart
                isLoading={isLoadingTransactions}
                transactions={filteredTransactions}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
              />
              
              {/* Pie Chart */}
              <CategoryPieChart
                isLoading={isLoadingTransactions}
                transactions={filteredTransactions}
                type="expense"
              />
              
              {/* Bar Chart */}
              <MonthlyBarChart
                isLoading={isLoadingTransactions}
                transactions={transactions}
              />
            </div>
            
            {/* Recent Transactions */}
            <RecentTransactions
              isLoading={isLoadingTransactions}
              transactions={transactions}
            />
            
            {/* Action Button (Add Transaction) */}
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-14 h-14 rounded-full shadow-lg"
                size="icon"
              >
                <i className="bi bi-plus text-xl"></i>
              </Button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
