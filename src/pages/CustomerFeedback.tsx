import React from 'react';

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
      
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">
            หน้าข้อคิดเห็นของลูกค้า
          </h2>
          <p className="text-sm text-muted-foreground">
            เนื้อหาจะถูกเพิ่มในภายหลัง
          </p>
        </div>
      </div>
    </div>
  );
}