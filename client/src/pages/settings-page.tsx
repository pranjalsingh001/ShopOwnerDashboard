import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: user?.name || "",
    email: user?.username || "",
    shopName: "My Shop",
    phone: "+91 9876543210",
    emailNotifications: true,
    currency: "inr",
    darkMode: false,
  });
  
  const handleChange = (name: string, value: string | boolean) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit settings changes (not implemented in this example)
    alert("Settings updated successfully!");
  };
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 lg:ml-64">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Account Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formValues.name}
                        onChange={e => handleChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formValues.email}
                        onChange={e => handleChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopName">Shop Name</Label>
                      <Input
                        id="shopName"
                        value={formValues.shopName}
                        onChange={e => handleChange("shopName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formValues.phone}
                        onChange={e => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-800">Preferences</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive daily summary emails</p>
                      </div>
                      <Switch
                        checked={formValues.emailNotifications}
                        onCheckedChange={value => handleChange("emailNotifications", value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Default Currency</h3>
                        <p className="text-sm text-gray-500">Select your primary currency</p>
                      </div>
                      <Select
                        value={formValues.currency}
                        onValueChange={value => handleChange("currency", value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">₹ - Indian Rupee</SelectItem>
                          <SelectItem value="usd">$ - US Dollar</SelectItem>
                          <SelectItem value="eur">€ - Euro</SelectItem>
                          <SelectItem value="gbp">£ - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Use dark theme for the dashboard</p>
                      </div>
                      <Switch
                        checked={formValues.darkMode}
                        onCheckedChange={value => handleChange("darkMode", value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button type="button" variant="outline" className="mr-2">
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
