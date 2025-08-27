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
    title: "ผลการดำเนินงานรายพื้นที่",
    shortTitle: "รายพื้นที่",
    url: "/regional-performance",
    icon: MapPin,
  },
  {
    title: "ความคิดเห็น",
    shortTitle: "ความเห็น",
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
    const baseClasses = "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-all duration-200 min-w-0 flex-1 min-h-12";
    if (isActive(path)) {
      return `${baseClasses} bg-pink-100 text-pink-700 font-medium border-b-2 border-pink-500`;
    }
    return `${baseClasses} text-gray-600 hover:text-pink-600 hover:bg-pink-50`;
  };

  return (
    <nav className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={getNavClassName(item.url)}
          >
            <item.icon className="h-4 w-4 flex-shrink-0 mb-1" />
            <span className="truncate text-xs leading-tight max-w-12 overflow-hidden text-ellipsis whitespace-nowrap" title={item.shortTitle}>
              {item.shortTitle}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}