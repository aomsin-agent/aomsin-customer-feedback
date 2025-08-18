export default function TrendTracking() {
  return (
    <div className="w-full p-4 md:p-6 lg:pl-72 xl:pl-80">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          การติดตามแนวโน้ม
        </h1>
        <p className="text-muted-foreground">
          วิเคราะห์แนวโน้มการให้บริการและข้อร้องเรียนของลูกค้าตามช่วงเวลา
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะแสดงกราฟแนวโน้ม การเปรียบเทียบข้อมูลย้อนหลัง และการพยากรณ์
        </p>
      </div>
    </div>
  );
}