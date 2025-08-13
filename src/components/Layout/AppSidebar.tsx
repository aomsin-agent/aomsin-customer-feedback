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

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "w-full justify-start text-left";
    if (isActive(path)) {
      return `${baseClasses} bg-primary/10 text-primary border-r-2 border-primary font-medium`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent/50`;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-card shadow-soft`}
      collapsible="icon"
    >
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-muted-foreground font-medium px-2 py-2`}>
            เมนูหลัก
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className={`${collapsed ? "mr-0" : "mr-3"} h-5 w-5 flex-shrink-0`} />
                      {!collapsed && (
                        <span className="truncate text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}