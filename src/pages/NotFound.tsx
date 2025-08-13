import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">ไม่พบหน้าที่คุณต้องการ</p>
        <a 
          href="/" 
          className="text-primary hover:text-primary-dark underline font-medium"
        >
          กลับสู่หน้าหลัก
        </a>
      </div>
    </div>
  );
};

export default NotFound;
