export default function CustomerFeedback() {
  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ข้อคิดเห็นของลูกค้า
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-4 md:p-8 text-center">
        <div className="text-4xl md:text-6xl mb-4">💬</div>
        <h2 className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          ส่วนนี้จะแสดงความคิดเห็นของลูกค้า การจัดกลุ่มความคิดเห็น และการวิเคราะห์ความรู้สึก
        </p>
      </div>
    </div>
  );
}