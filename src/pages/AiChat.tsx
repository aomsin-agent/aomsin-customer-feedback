export default function AiChat() {
  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AI Chat ช่วยวิเคราะห์
        </h1>
        <p className="text-muted-foreground">
          ใช้ปัญญาประดิษฐ์ในการวิเคราะห์ข้อมูลและให้คำแนะนำเชิงลึก
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะเป็นระบบแชทบอทที่ช่วยวิเคราะห์ข้อมูลและตอบคำถามเกี่ยวกับข้อร้องเรียน
        </p>
      </div>
    </div>
  );
}