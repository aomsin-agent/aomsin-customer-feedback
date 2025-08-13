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
  ChevronDown,
  ChevronRight
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "w-full justify-start text-left transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-sidebar-accent text-sidebar-primary border-r-2 border-sidebar-primary font-medium`;
    }
    return `${baseClasses} text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50`;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar-background shadow-soft`}
      collapsible="icon"
    >
      <SidebarContent className="p-2">
        <Collapsible open={isGroupOpen} onOpenChange={setIsGroupOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-between p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent/50 ${collapsed ? "px-2" : "px-2"}`}
              >
                <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-sidebar-foreground font-medium`}>
                  เมนูหลัก
                </SidebarGroupLabel>
                {!collapsed && (
                  isGroupOpen ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                  )
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
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
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}