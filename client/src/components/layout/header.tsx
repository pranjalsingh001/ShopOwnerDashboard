import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  toggleSidebar: () => void;
};

export function Header({ toggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center z-20 sticky top-0">
      <div className="px-4 flex justify-between items-center w-full">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 focus:outline-none lg:hidden"
        >
          <i className="bi bi-list text-2xl"></i>
        </button>
        
        <div className="flex items-center">
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <i className="bi bi-person text-gray-600"></i>
              </div>
              <span className="hidden md:inline-block font-medium">{user?.name || "User"}</span>
              <i className="bi bi-chevron-down text-xs text-gray-500"></i>
            </button>
            
            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <button 
                  onClick={() => {
                    setUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
