export default function MonthlyOverview() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          สรุปภาพรวมประจำเดือน
        </h1>
        <p className="text-muted-foreground">
          ภาพรวมข้อมูลการให้บริการและข้อร้องเรียนของลูกค้าในเดือนปัจจุบัน
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะแสดงข้อมูลสรุปภาพรวมประจำเดือน รวมถึงกราฟและตัวเลขสำคัญต่างๆ
        </p>
      </div>
    </div>
  );
}