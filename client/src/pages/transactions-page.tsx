import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { Transaction } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/date-utils";

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  
  // Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Apply filters to transactions
  const filteredTransactions = transactions?.filter(transaction => {
    // Type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Search query
    if (searchQuery && !transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Date filter would go here, but needs more implementation
    
    return true;
  });
  
  // Handle edit transaction
  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };
  
  // Handle delete transaction
  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };
  
  // Get unique categories from transactions
  const categories = transactions 
    ? Array.from(new Set(transactions.map(t => t.category)))
    : [];
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 lg:ml-64">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
              <p className="text-gray-600">Manage your expenses and profits</p>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <Select defaultValue={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select defaultValue={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="profit">Profit</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select defaultValue={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <Input
                    type="text"
                    placeholder="Search by description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full md:w-64"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFilter("all");
                      setTypeFilter("all");
                      setCategoryFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {filteredTransactions?.length || 0} transactions
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center"
                >
                  <i className="bi bi-plus mr-1"></i>
                  Add Transaction
                </Button>
                <Button variant="outline" className="flex items-center">
                  <i className="bi bi-download mr-1"></i>
                  Export
                </Button>
              </div>
            </div>
            
            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          Loading transactions...
                        </td>
                      </tr>
                    ) : filteredTransactions && filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'profit' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'profit' ? 'Profit' : 'Expense'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.description || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'profit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'profit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(transaction)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(transaction)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination (simplified version) */}
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">
                      {filteredTransactions?.length || 0}
                    </span> of <span className="font-medium">
                      {filteredTransactions?.length || 0}
                    </span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button variant="outline" size="sm" disabled className="rounded-l-md">
                      <span className="sr-only">Previous</span>
                      <i className="bi bi-chevron-left"></i>
                    </Button>
                    <Button variant="default" size="sm" className="relative inline-flex items-center px-4 py-2">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled className="rounded-r-md">
                      <span className="sr-only">Next</span>
                      <i className="bi bi-chevron-right"></i>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Dialogs */}
      <AddTransactionDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      <EditTransactionDialog
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        transaction={selectedTransaction}
      />
      
      <DeleteTransactionDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
