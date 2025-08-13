import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

// Layout Components
import { AppHeader } from "@/components/Layout/AppHeader";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { AppFooter } from "@/components/Layout/AppFooter";
import { BackToTop } from "@/components/BackToTop";
import { MobileNavigation } from "@/components/MobileNavigation";

// Page Components
import MonthlyOverview from "./pages/MonthlyOverview";
import TrendTracking from "./pages/TrendTracking";
import RegionalPotential from "./pages/RegionalPotential";
import CustomerFeedback from "./pages/CustomerFeedback";
import SevereComplaints from "./pages/SevereComplaints";
import AiChat from "./pages/AiChat";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col w-full bg-gradient-subtle">
            <AppHeader />
            
            <div className="flex flex-1 w-full">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                <AppSidebar />
              </div>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto pb-16 lg:pb-0">
                <Routes>
                  <Route path="/" element={<MonthlyOverview />} />
                  <Route path="/trends" element={<TrendTracking />} />
                  <Route path="/regional" element={<RegionalPotential />} />
                  <Route path="/feedback" element={<CustomerFeedback />} />
                  <Route path="/severe-complaints" element={<SevereComplaints />} />
                  <Route path="/ai-chat" element={<AiChat />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            <AppFooter />
            
            {/* Mobile Navigation */}
            <MobileNavigation />
            
            {/* Back to Top Button */}
            <BackToTop />
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
