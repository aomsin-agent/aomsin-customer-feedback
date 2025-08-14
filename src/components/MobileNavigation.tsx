import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Bot,
  FileText
} from "lucide-react";

const navigationItems = [
  {
    title: "ภาพรวม",
    shortTitle: "ภาพรวม",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "แนวโน้ม",
    shortTitle: "แนวโน้ม",
    url: "/trends",
    icon: TrendingUp,
  },
  {
    title: "พื้นที่",
    shortTitle: "พื้นที่",
    url: "/regional",
    icon: MapPin,
  },
  {
    title: "ความคิดเห็น",
    shortTitle: "ความคิดเห็น",
    url: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "ร้องเรียน",
    shortTitle: "ร้องเรียน",
    url: "/severe-complaints",
    icon: AlertTriangle,
  },
  {
    title: "AI Chat",
    shortTitle: "AI",
    url: "/ai-chat",
    icon: Bot,
  },
  {
    title: "เอกสาร",
    shortTitle: "เอกสาร",
    url: "/documents",
    icon: FileText,
  },
];

export function MobileNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "flex items-center justify-center p-2 text-xs rounded-lg transition-all duration-200 min-w-0 flex-1";
    if (isActive(path)) {
      return `${baseClasses} bg-pink-100 text-pink-700 font-medium border-b-2 border-pink-500`;
    }
    return `${baseClasses} text-gray-600 hover:text-pink-600 hover:bg-pink-50`;
  };

  return (
    <nav className="lg:hidden fixed left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30" style={{ top: 'calc(5rem)' }}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={getNavClassName(item.url)}
          >
            <item.icon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate text-xs">{item.shortTitle}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}