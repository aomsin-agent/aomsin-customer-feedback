import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Bot,
  FileText,
  Menu,
  X
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "สรุปภาพรวมประจำเดือน",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "การติดตามแนวโน้ม",
    url: "/trends",
    icon: TrendingUp,
  },
  {
    title: "ศักยภาพรายพื้นที่",
    url: "/regional",
    icon: MapPin,
  },
  {
    title: "ข้อคิดเห็นของลูกค้า",
    url: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "ข้อร้องเรียนที่รุนแรง",
    url: "/severe-complaints",
    icon: AlertTriangle,
  },
  {
    title: "AI Chat ช่วยวิเคราะห์",
    url: "/ai-chat",
    icon: Bot,
  },
  {
    title: "เอกสารอ้างอิง",
    url: "/documents",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "flex items-center w-full justify-start text-left transition-all duration-200 px-3 py-2.5 rounded-lg group";
    if (isActive(path)) {
      return `${baseClasses} bg-pink-100 text-pink-800 border-l-4 border-pink-500 font-medium shadow-sm`;
    }
    return `${baseClasses} text-gray-700 hover:text-pink-700 hover:bg-pink-50 hover:shadow-sm`;
  };

  return (
    <>
      {/* Mini Sidebar - Always visible on desktop when closed */}
      <div className="hidden lg:flex fixed left-0 w-16 bg-gray-50/95 backdrop-blur-sm border-r border-gray-200 flex-col items-center py-4 z-20" style={{ top: 'max(5rem, calc(5rem + 1vh))', bottom: 'max(4rem, calc(4rem + 1vh))' }}>
        {/* Drawer Toggle Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 mb-3 bg-white hover:bg-gray-100 border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md flex-shrink-0"
            >
              <Menu className="h-4 w-4 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-80 bg-gray-50/95 backdrop-blur-sm border-r border-gray-200 p-0 data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left"
          >
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-gray-200 bg-white/50 p-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-semibold text-gray-900">
                    เมนูหลัก
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-auto p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={getNavClassName(item.url)}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-3 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {item.title}
                      </span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mini Navigation Icons */}
        <nav className="flex flex-col space-y-1 w-full flex-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 group relative flex-shrink-0 ${
                isActive(item.url)
                  ? "bg-pink-100 text-pink-700 shadow-sm border-2 border-pink-300"
                  : "text-gray-600 hover:text-pink-700 hover:bg-pink-50 hover:shadow-sm"
              }`}
              title={item.title}
            >
              <item.icon className="h-4 w-4 transition-transform group-hover:scale-110 flex-shrink-0" />
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.title}
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Sheet Trigger Button */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-16 w-6 rounded-r-lg rounded-l-none bg-gray-100 hover:bg-gray-200 border-l-0 border-gray-300 flex items-center justify-center shadow-md transition-all duration-200 hover:w-8 hover:shadow-lg"
            >
              <Menu className="h-4 w-4 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-80 bg-gray-50/95 backdrop-blur-sm border-r border-gray-200 p-0 data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left"
          >
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-gray-200 bg-white/50 p-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-semibold text-gray-900">
                    เมนูหลัก
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-auto p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={getNavClassName(item.url)}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-3 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {item.title}
                      </span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}