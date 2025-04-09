import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/billing", label: "Billing System", icon: "bi-receipt" },
    { path: "/transactions", label: "Transactions", icon: "bi-list-ul" },
    { path: "/reports", label: "Reports", icon: "bi-bar-chart" },
    { path: "/chatbot", label: "AI Assistant", icon: "bi-robot" },
    { path: "/settings", label: "Settings", icon: "bi-gear" },
  ];

  return (
    <div 
      className={cn(
        "bg-gray-900 text-white w-64 fixed inset-y-0 left-0 z-30 lg:translate-x-0 transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Shop Dashboard</h1>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-gray-400 hover:text-white focus:outline-none focus:text-white lg:hidden"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="px-2 space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div
                  className={cn(
                    "flex items-center w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700 transition-colors cursor-pointer",
                    location === item.path ? "bg-blue-600" : ""
                  )}
                >
                  <i className={cn("bi", item.icon, "mr-3")}></i>
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
        >
          <i className="bi bi-box-arrow-left mr-3"></i>
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
