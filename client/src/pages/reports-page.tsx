import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 lg:ml-64">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
              <p className="text-gray-600">Detailed financial reports and analytics</p>
            </div>
            
            <Card className="bg-white rounded-lg shadow-sm p-6">
              <CardContent className="p-0 flex items-center justify-center min-h-[300px] text-center">
                <div>
                  <i className="bi bi-bar-chart-line text-5xl text-gray-300"></i>
                  <p className="mt-2 text-lg text-gray-500">Reports section is coming soon!</p>
                  <p className="text-sm text-gray-400">Check back later for detailed financial reports.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
