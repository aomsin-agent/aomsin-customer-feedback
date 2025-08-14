import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-primary hover:bg-primary-dark shadow-strong text-white border-2 border-white/30 transition-all duration-300 hover:scale-110 animate-fade-in"
      size="icon"
      aria-label="กลับสู่ด้านบน"
    >
      <ChevronUp className="h-6 w-6 stroke-2" />
    </Button>
  );
}