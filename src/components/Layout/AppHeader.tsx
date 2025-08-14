import { Button } from "@/components/ui/button";
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

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes} น.`;
  };

  return (
    <header className="bg-gradient-header border-b border-white/20 shadow-medium">
      <div className="flex items-center justify-between min-h-16 px-4 sm:px-6 py-3 gap-2 sm:gap-4">
        {/* Left side - Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
            Dashboard ข้อเสนอแนะ ข้อร้องเรียน การใช้บริการสาขา
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1 hidden sm:block">
            ระบบติดตามและวิเคราะห์ข้อร้องเรียนลูกค้าธนาคารออมสิน
          </p>
        </div>

        {/* Right side - Last updated and Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Last updated info */}
          <div className="hidden md:block text-xs text-white/80 mr-2">
            <div>อัพเดทล่าสุด:</div>
            <div className="font-mono">{getCurrentDateTime()}</div>
          </div>
          
          {/* Icon buttons */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg"
          >
            <Info className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg px-2 sm:px-3 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <LogOut className="h-4 w-4 mr-1 sm:mr-2" strokeWidth={1.5} />
            <span className="hidden sm:inline">ออกจากระบบ</span>
            <span className="sm:hidden">ออก</span>
          </Button>
        </div>
      </div>
    </header>
  );
}