export default function CustomerFeedback() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ข้อคิดเห็นของลูกค้า
        </h1>
        <p className="text-muted-foreground">
          รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-soft p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
        </h2>
        <p className="text-muted-foreground">
          ส่วนนี้จะแสดงความคิดเห็นของลูกค้า การจัดกลุ่มความคิดเห็น และการวิเคราะห์ความรู้สึก
        </p>
      </div>
    </div>
  );
}