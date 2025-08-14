export function AppFooter() {
  return (
    <footer className="bg-muted border-t border-border py-4 sm:py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="whitespace-nowrap">&copy; 2024 Customer Dashboard. สงวนลิขสิทธิ์.</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="hover:text-primary cursor-pointer whitespace-nowrap">นโยบายความเป็นส่วนตัว</span>
              <span className="hover:text-primary cursor-pointer whitespace-nowrap">เงื่อนไขการใช้งาน</span>
              <span className="hover:text-primary cursor-pointer whitespace-nowrap">ติดต่อเรา</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <p className="text-xs sm:text-sm whitespace-nowrap">เวอร์ชัน 2.1.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}