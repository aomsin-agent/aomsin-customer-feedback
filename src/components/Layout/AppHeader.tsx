import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Info, 
  RefreshCw, 
  Settings, 
  LogOut 
} from "lucide-react";

export function AppHeader() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    // Logout logic here
    console.log("Logout clicked");
  };

  return (
    <header className="bg-gradient-header border-b border-border shadow-soft">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Sidebar trigger and title */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:text-primary" />
          <h1 className="text-xl font-semibold text-foreground">
            Dashboard ข้อเสนอและข้อร้องเรียนของลูกค้า
          </h1>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-foreground hover:text-primary hover:bg-white/50"
          >
            <Info className="h-4 w-4 mr-2" />
            About Us
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            className="text-foreground hover:text-primary hover:bg-white/50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-foreground hover:text-primary hover:bg-white/50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-foreground hover:text-destructive hover:bg-white/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </header>
  );
}