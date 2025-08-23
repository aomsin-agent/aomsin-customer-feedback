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
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                การส่งแบบประเมิน
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 portrait:grid-cols-1">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="font-semibold text-blue-800 mb-1">แบบฟอร์มทั้งหมด</h3>
                    <p className="text-2xl font-bold text-blue-900">0</p>
                    <p className="text-xs text-blue-600">รายการ</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <h3 className="font-semibold text-green-800 mb-1">ให้ข้อมูลติดต่อ</h3>
                    <p className="text-2xl font-bold text-green-900">0</p>
                    <p className="text-xs text-green-600">รายการ</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💡</div>
                    <h3 className="font-semibold text-yellow-800 mb-1">มีข้อเสนอแนะ</h3>
                    <p className="text-2xl font-bold text-yellow-900">0</p>
                    <p className="text-xs text-yellow-600">รายการ</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <h3 className="font-semibold text-red-800 mb-1">ข้อร้องเรียนรุนแรง</h3>
                    <p className="text-2xl font-bold text-red-900">0</p>
                    <p className="text-xs text-red-600">รายการ</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analysis Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xl mb-2">🏢</div>
                    <h3 className="font-medium text-purple-800 mb-2">ประเภทของสาขา</h3>
                    <div className="space-y-1 text-sm text-purple-700">
                      <div className="flex justify-between">
                        <span>สาขาหลัก</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>สาขาย่อย</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xl mb-2">💼</div>
                    <h3 className="font-medium text-cyan-800 mb-2">ประเภทการใช้บริการ</h3>
                    <div className="space-y-1 text-sm text-cyan-700">
                      <div className="flex justify-between">
                        <span>ฝาก-ถอน</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>สินเชื่อ</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xl mb-2">📊</div>
                    <h3 className="font-medium text-orange-800 mb-2">จำนวนแบบฟอร์มที่ถูกส่ง</h3>
                    <div className="space-y-1 text-sm text-orange-700">
                      <div className="flex justify-between">
                        <span>วันนี้</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>เดือนนี้</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* คะแนนความพึงพอใจ */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                คะแนนความพึงพอใจ
              </CardTitle>
            </div>
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
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                ข้อคิดเห็น/ข้อเสนอแนะ
              </CardTitle>
            </div>
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