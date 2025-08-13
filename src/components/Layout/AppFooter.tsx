export function AppFooter() {
  return (
    <footer className="bg-muted border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>&copy; 2024 Customer Dashboard. สงวนลิขสิทธิ์.</p>
            <div className="flex gap-4">
              <span>นโยบายความเป็นส่วนตัว</span>
              <span>เงื่อนไขการใช้งาน</span>
              <span>ติดต่อเรา</span>
            </div>
          </div>
          <div>
            <p>เวอร์ชัน 2.1.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}