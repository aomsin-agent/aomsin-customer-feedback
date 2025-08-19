import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerFeedback() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ข้อคิดเห็นของลูกค้า
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
        </p>
      </div>

      {/* Simple Dropdown Widget (แก้อาการ dropdown เด้งจากมุมซ้ายบน) */}
      <div className="mb-6">
        {mounted && (
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกตัวเลือก" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={6}
              avoidCollisions
              collisionPadding={8}
              className="
                invisible data-[state=open]:visible
                opacity-0 data-[state=open]:opacity-100
                scale-95 data-[state=open]:scale-100
                transition-[opacity,transform] duration-150 origin-top-left will-change-transform
                bg-background border shadow-lg z-50
              "
            >
              <SelectItem value="1">ตัวเลือก 1</SelectItem>
              <SelectItem value="2">ตัวเลือก 2</SelectItem>
              <SelectItem value="3">ตัวเลือก 3</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 h-[calc(100vh-200px)]">
        {/* Comments Section */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">รายการข้อคิดเห็น</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)] p-6">
                <div className="text-center py-8">
                  <div className="text-4xl md:text-6xl mb-4">💬</div>
                  <h2 className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
                    เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    ส่วนนี้จะแสดงข้อคิดเห็นและข้อเสนอแนะจากลูกค้า รวมถึงการวิเคราะห์ความพึงพอใจ
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
