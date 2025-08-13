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
    const baseClasses = "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-colors";
    if (isActive(path)) {
      return `${baseClasses} bg-primary/10 text-primary font-medium`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent/50`;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-strong z-40">
      <div className="grid grid-cols-7 gap-1 p-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={getNavClassName(item.url)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="truncate">{item.shortTitle}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}