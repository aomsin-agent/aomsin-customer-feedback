import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { FileText, Phone, Lightbulb, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

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

  // Mock data for KPI cards
  const kpiData = [
    { icon: FileText, title: "แบบฟอร์มทั้งหมด", value: 1247, change: 12.5, isPositive: true, lastMonth: 1109 },
    { icon: Phone, title: "ให้ข้อมูลติดต่อ", value: 892, change: -5.3, isPositive: false, lastMonth: 941 },
    { icon: Lightbulb, title: "มีข้อเสนอแนะ", value: 456, change: 18.7, isPositive: true, lastMonth: 384 },
    { icon: AlertTriangle, title: "ข้อร้องเรียนรุนแรง", value: 23, change: -34.2, isPositive: false, lastMonth: 35 }
  ];

  // Mock data for branch type donut chart
  const branchTypeData = [
    { name: "ให้บริการ 5 วัน", value: 68, fill: "url(#branchGradient)" },
    { name: "ให้บริการ 7 วัน", value: 32, fill: "hsl(200, 60%, 75%)" }  // Light blue
  ];

  // Mock data for service type bar chart
  const serviceTypeData = [
    { category: "ฝาก/ถอน", lastMonth: 320, currentMonth: 380 },
    { category: "ชำระเงิน", lastMonth: 250, currentMonth: 290 },
    { category: "สมัครบริการ", lastMonth: 180, currentMonth: 220 },
    { category: "สอบถาม", lastMonth: 150, currentMonth: 170 },
    { category: "อื่นๆ", lastMonth: 90, currentMonth: 110 }
  ];

  // Mock data for form submission line chart
  const formSubmissionData = [
    { day: "1", blue: 45, red: 38 },
    { day: "5", blue: 52, red: 42 },
    { day: "10", blue: 48, red: 35 },
    { day: "15", blue: 61, red: 48 },
    { day: "20", blue: 58, red: 44 },
    { day: "25", blue: 65, red: 52 },
    { day: "30", blue: 72, red: 58 }
  ];

  const chartConfig = {
    lastMonth: {
      label: "เดือนที่แล้ว",
      color: "hsl(220, 5%, 65%)", // Light gray
    },
    currentMonth: {
      label: "เดือนปัจจุบัน",
      color: "hsl(var(--primary))",
    },
    blue: {
      label: "แบบฟอร์มทั้งหมด",
      color: "hsl(220, 70%, 50%)",
    },
    red: {
      label: "ไม่พอใจการให้บริการ",
      color: "hsl(0, 70%, 50%)",
    },
    "ให้บริการ 5 วัน": {
      label: "ให้บริการ 5 วัน",
      color: "hsl(330, 60%, 65%)",
    },
    "ให้บริการ 7 วัน": {
      label: "ให้บริการ 7 วัน", 
      color: "hsl(200, 60%, 75%)",
    },
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => {
                const colors = [
                  { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-800", number: "text-blue-900", desc: "text-blue-600" },
                  { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-800", number: "text-green-900", desc: "text-green-600" },
                  { bg: "from-yellow-50 to-yellow-100", border: "border-yellow-200", text: "text-yellow-800", number: "text-yellow-900", desc: "text-yellow-600" },
                  { bg: "from-red-50 to-red-100", border: "border-red-200", text: "text-red-800", number: "text-red-900", desc: "text-red-600" }
                ];
                const colorSet = colors[index];
                
                return (
                  <Card key={index} className={`bg-gradient-to-br ${colorSet.bg} ${colorSet.border}`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <kpi.icon className={`w-6 h-6 ${colorSet.text}`} />
                        </div>
                        <h3 className={`font-semibold ${colorSet.text} mb-1 text-sm`}>{kpi.title}</h3>
                        <p className={`text-2xl font-bold ${colorSet.number} mb-1`}>
                          {kpi.value.toLocaleString()} ครั้ง
                        </p>
                        <div className={`flex items-center justify-center gap-1 text-xs ${colorSet.desc}`}>
                          {kpi.isPositive ? (
                            <ArrowUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={kpi.isPositive ? "text-green-600" : "text-red-600"}>
                            {Math.abs(kpi.change).toFixed(1)}%
                          </span>
                          <span>(จากเดือนที่แล้ว {kpi.lastMonth} ครั้ง)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Branch Type Donut Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2 text-center">ประเภทของสาขา</h3>
                  <div className="flex justify-center">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={branchTypeData}
                            cx="50%"
                            cy="45%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                            labelLine={false}
                          >
                            {branchTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend 
                            content={<ChartLegendContent />}
                            verticalAlign="bottom"
                            height={36}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Service Type Bar Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2 text-center">ประเภทการใช้บริการ</h3>
                  <div className="flex justify-center items-center h-full">
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceTypeData} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                          <defs>
                            <linearGradient id="currentMonthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="category" 
                            tick={{ fontSize: 10 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }}
                            stroke="hsl(var(--muted-foreground))"
                            width={35}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar 
                            dataKey="lastMonth" 
                            fill="hsl(220, 5%, 80%)" 
                            name="เดือนที่แล้ว"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="currentMonth" 
                            fill="url(#currentMonthGradient)" 
                            name="เดือนปัจจุบัน"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Form Submission Line Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2 text-center">จำนวนแบบฟอร์มที่ถูกส่ง</h3>
                  <div className="flex justify-center items-center h-full">
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formSubmissionData} margin={{ top: 5, right: 15, left: 0, bottom: 15 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 10 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }}
                            stroke="hsl(var(--muted-foreground))"
                            width={35}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="blue" 
                            stroke="hsl(220, 70%, 50%)" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(220, 70%, 50%)", strokeWidth: 2, r: 4 }}
                            name="แบบฟอร์มทั้งหมด"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="red" 
                            stroke="hsl(0, 70%, 50%)" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(0, 70%, 50%)", strokeWidth: 2, r: 4 }}
                            name="ไม่พอใจการให้บริการ"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
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