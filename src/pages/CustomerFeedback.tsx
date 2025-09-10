import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import { AreaFilter, AreaFilterRef } from '@/components/CustomerFeedback/AreaFilter';
import { TimeFilter, TimeFilterValue, TimeFilterRef } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter, CategoryFilterRef } from '@/components/CustomerFeedback/CategoryFilter';
import { ServiceTypeFilter, ServiceTypeFilterRef } from '@/components/CustomerFeedback/ServiceTypeFilter';
import { CommentsList, SentimentFilter } from '@/components/CustomerFeedback/CommentsList';

export default function CustomerFeedback() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const categoryFilterRef = useRef<CategoryFilterRef>(null);
  const areaFilterRef = useRef<AreaFilterRef>(null);
  const timeFilterRef = useRef<TimeFilterRef>(null);
  const serviceTypeFilterRef = useRef<ServiceTypeFilterRef>(null);

  const handleClearAllFilters = () => {
    areaFilterRef.current?.selectAll();
    timeFilterRef.current?.selectAll(); 
    categoryFilterRef.current?.selectAll();
    serviceTypeFilterRef.current?.selectAll();
    setSentimentFilter('all');
  };

  const hasAnyFilters = selectedAreas.length > 0 || selectedCategories.length > 0 || selectedServiceTypes.length > 0 || sentimentFilter !== 'all';

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              ข้อคิดเห็นของลูกค้า
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
            </p>
          </div>
          {hasAnyFilters && (
            <Button variant="outline" onClick={handleClearAllFilters}>
              รีเซ็ตตัวกรอง
            </Button>
          )}
        </div>
      </div>

      {/* Responsive layout: Filters on top for mobile, left side for desktop */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-6">
        {/* Filters section - top on mobile, left on desktop */}
        <div className="md:col-span-4 space-y-4 md:h-full md:overflow-y-auto order-1 md:order-none">
          <AreaFilter
            ref={areaFilterRef}
            selectedAreas={selectedAreas}
            onAreaChange={setSelectedAreas}
          />
          
          <TimeFilter
            ref={timeFilterRef}
            value={timeFilter}
            onChange={setTimeFilter}
          />
          
          <CategoryFilter
            ref={categoryFilterRef}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
          
          <ServiceTypeFilter
            ref={serviceTypeFilterRef}
            selectedServiceTypes={selectedServiceTypes}
            onServiceTypeChange={setSelectedServiceTypes}
          />
        </div>

        {/* Comments section - bottom on mobile, right on desktop */}
        <div className="md:col-span-8 flex-1 order-2 md:order-none space-y-6">
          {/* ข้อคิดเห็น/ข้อเสนอแนะ Section */}
          <Card className="relative overflow-hidden bg-card shadow-soft">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
            <CardHeader className="pb-4">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  ข้อคิดเห็น/ข้อเสนอแนะ
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Container บน - ทัศนคติข้อคิดเห็น และ ประเด็นที่ถูกกล่าวถึง */}
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
                {/* ทัศนคติข้อคิดเห็น - Donut Chart */}
                <div className="lg:col-span-1 min-w-0">
                  <Card className="bg-card border h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <h3 className="font-medium text-foreground mb-4 text-center">
                        ทัศนคติข้อคิดเห็น
                      </h3>
                      <div className="flex justify-center flex-1">
                        <ChartContainer config={{
                          positive: { label: "เชิงบวก", color: "hsl(142, 76%, 36%)" },
                          negative: { label: "เชิงลบ", color: "hsl(0, 84%, 60%)" }
                        }} className="h-full w-full min-h-[200px] max-h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie 
                                data={[
                                  { name: "เชิงบวก", value: 72.3, count: 892, fill: "hsl(142, 76%, 36%)" },
                                  { name: "เชิงลบ", value: 27.7, count: 342, fill: "hsl(0, 84%, 60%)" }
                                ]} 
                                cx="50%" 
                                cy="45%" 
                                innerRadius="30%" 
                                outerRadius="45%" 
                                paddingAngle={5} 
                                dataKey="value"
                                label={({ name, value, count }) => `${value.toFixed(1)}% (จาก ${count.toLocaleString()} ความคิดเห็น)`}
                                labelLine={false}
                              >
                                {[
                                  { name: "เชิงบวก", value: 72.3, count: 892, fill: "hsl(142, 76%, 36%)" },
                                  { name: "เชิงลบ", value: 27.7, count: 342, fill: "hsl(0, 84%, 60%)" }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <ChartTooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-card border rounded-lg p-3 shadow-md">
                                      <p className="text-sm font-medium">{payload[0].payload.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {payload[0].payload.value.toFixed(1)}% (จาก {payload[0].payload.count.toLocaleString()} ความคิดเห็น)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      {/* Legend */}
                      <div className="flex justify-center space-x-4 mt-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                          <span className="text-xs text-muted-foreground">เชิงบวก</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                          <span className="text-xs text-muted-foreground">เชิงลบ</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ประเด็นที่ถูกกล่าวถึง - Butterfly Chart */}
                <div className="lg:col-span-1 min-w-0">
                  <Card className="bg-card border h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="grid grid-cols-3 items-center mb-4">
                        <div></div>
                        <div className="flex justify-center">
                          <h3 className="font-medium text-foreground text-xs pointer-events-none">
                            ประเด็นที่ถูกกล่าวถึง
                          </h3>
                        </div>
                        <div></div>
                      </div>
                      
                      <div className="flex-1 space-y-1 sm:space-y-2 min-h-[200px]">
                        {[
                          { topic: "ความรวดเร็วในการให้บริการ", positive: 345, negative: 123 },
                          { topic: "ระยะเวลารอคอย", positive: 298, negative: 156 },
                          { topic: "การปรับปรุงระบบ", positive: 267, negative: 89 },
                          { topic: "ความสะดวกของระบบออนไลน์", positive: 234, negative: 67 },
                          { topic: "ทักษะและความรู้ของเจ้าหน้าที่", positive: 198, negative: 134 }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            {/* Negative bar (left) */}
                            <div className="flex-1 flex justify-end px-1">
                              <div className="w-full max-w-[120px] sm:max-w-[140px] h-4 sm:h-5 bg-gray-100 relative">
                                <div 
                                  className="h-full bg-red-500 flex items-center justify-start pl-1 absolute right-0" 
                                  style={{ width: `${Math.min(100, item.negative / 400 * 100)}%` }}
                                >
                                  <span className="text-[10px] text-white font-medium">{item.negative}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Topic name (center) */}
                            <div className="px-1 sm:px-2 min-w-0 flex-shrink-0 w-32 sm:w-44">
                              <p className="text-[10px] text-center text-foreground truncate" title={item.topic}>
                                {item.topic}
                              </p>
                            </div>
                            
                            {/* Positive bar (right) */}
                            <div className="flex-1 flex justify-start px-1">
                              <div className="w-full max-w-[120px] sm:max-w-[140px] h-4 sm:h-5 bg-gray-100 relative">
                                <div 
                                  className="h-full bg-green-500 flex items-center justify-end pr-1" 
                                  style={{ width: `${Math.min(100, item.positive / 400 * 100)}%` }}
                                >
                                  <span className="text-[10px] text-white font-medium">{item.positive}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Comments List */}
          <CommentsList
            selectedAreas={selectedAreas}
            selectedCategories={selectedCategories}
            selectedServiceTypes={selectedServiceTypes}
            timeFilter={timeFilter}
            sentimentFilter={sentimentFilter}
            onSentimentFilterChange={setSentimentFilter}
          />
        </div>
      </div>
    </div>
  );
}
