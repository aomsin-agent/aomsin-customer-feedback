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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
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
    const baseClasses = "w-full justify-start text-left transition-all duration-200 px-4 py-3 rounded-lg";
    if (isActive(path)) {
      return `${baseClasses} bg-gray-200 text-gray-900 border-r-4 border-pink-500 font-medium`;
    }
    return `${baseClasses} text-gray-700 hover:text-gray-900 hover:bg-gray-100`;
  };

  return (
    <>
      {/* Drawer Trigger Button */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-16 w-6 rounded-r-lg rounded-l-none bg-gray-100 hover:bg-gray-200 border-l-0 border-gray-300 flex items-center justify-center shadow-md"
            >
              <Menu className="h-4 w-4 text-gray-600" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full w-80 bg-gray-50/95 backdrop-blur-sm border-r border-gray-200">
            <div className="flex h-full flex-col">
              <DrawerHeader className="border-b border-gray-200 bg-white/50">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-lg font-semibold text-gray-900">
                    เมนูหลัก
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              
              <div className="flex-1 overflow-auto p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={getNavClassName(item.url)}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-sm">{item.title}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}