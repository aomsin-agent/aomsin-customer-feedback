export default function SevereComplaints() {
  return (
    <div className="w-full p-4 md:p-6 lg:px-4 xl:px-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ข้อร้องเรียนที่รุนแรง
        </h1>
        <p className="text-muted-foreground">
          ติดตามและจัดการข้อร้องเรียนที่มีความรุนแรงสูงและต้องการความสนใจเป็นพิเศษ
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะแสดงรายการข้อร้องเรียนที่รุนแรง สถานะการดำเนินการ และมาตรการแก้ไข
        </p>
      </div>
    </div>
  );
}