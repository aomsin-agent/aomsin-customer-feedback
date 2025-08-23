import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonthlyOverview() {
  const [selectedMonth, setSelectedMonth] = useState("มกราคม 2567");

  // Generate months from January 2024 to June 2025
  const months = [
    "มกราคม 2567", "กุมภาพันธ์ 2567", "มีนาคม 2567", "เมษายน 2567", 
    "พฤษภาคม 2567", "มิถุนายน 2567", "กรกฎาคม 2567", "สิงหาคม 2567", 
    "กันยายน 2567", "ตุลาคม 2567", "พฤศจิกายน 2567", "ธันวาคม 2567",
    "มกราคม 2568", "กุมภาพันธ์ 2568", "มีนาคม 2568", "เมษายน 2568", 
    "พฤษภาคม 2568", "มิถุนายน 2568"
  ];

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              สรุปภาพรวมประจำเดือน
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              ภาพรวมข้อมูลการให้บริการและข้อร้องเรียนของลูกค้าในเดือนปัจจุบัน
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* การส่งแบบประเมิน */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              การส่งแบบประเมิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground">
                ข้อมูลการส่งแบบประเมินจะถูกเพิ่มเข้ามาในภายหลัง
              </p>
            </div>
          </CardContent>
        </Card>

        {/* คะแนนความพึงพอใจ */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              คะแนนความพึงพอใจ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⭐</div>
              <p className="text-muted-foreground">
                ข้อมูลคะแนนความพึงพอใจจะถูกเพิ่มเข้ามาในภายหลัง
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ข้อคิดเห็น/ข้อเสนอแนะ */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              ข้อคิดเห็น/ข้อเสนอแนะ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-muted-foreground">
                ข้อมูลข้อคิดเห็นและข้อเสนอแนะจะถูกเพิ่มเข้ามาในภายหลัง
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}