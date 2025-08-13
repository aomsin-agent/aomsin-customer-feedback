export default function Documents() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          เอกสารอ้างอิง
        </h1>
        <p className="text-muted-foreground">
          รวบรวมเอกสาร นโยบาย และคู่มือที่เกี่ยวข้องกับการจัดการข้อร้องเรียน
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะแสดงเอกสารอ้างอิง นโยบาย และคู่มือการใช้งานระบบ
        </p>
      </div>
    </div>
  );
}