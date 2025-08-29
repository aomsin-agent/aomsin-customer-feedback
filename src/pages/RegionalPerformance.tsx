import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CascadingAreaFilter, CascadingAreaFilterRef } from '@/components/CustomerFeedback/CascadingAreaFilter';
import { TimeFilter, TimeFilterValue, TimeFilterRef } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter, CategoryFilterRef } from '@/components/CustomerFeedback/CategoryFilter';
import { ServiceTypeFilter, ServiceTypeFilterRef } from '@/components/CustomerFeedback/ServiceTypeFilter';
import { RegionalSentimentChart } from '@/components/Dashboard/RegionalSentimentChart';
import { SentimentTrendsChart } from '@/components/Dashboard/SentimentTrendsChart';
import { MentionedCategoriesTable } from '@/components/Dashboard/MentionedCategoriesTable';
export default function RegionalPerformance() {
  const [selectedArea, setSelectedArea] = useState<{
    division?: number | 'all';
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  }>({
    division: 'all',
    region: 'all',
    zone: 'all',
    branch: 'all'
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });
  const categoryFilterRef = useRef<CategoryFilterRef>(null);
  const cascadingAreaFilterRef = useRef<CascadingAreaFilterRef>(null);
  const timeFilterRef = useRef<TimeFilterRef>(null);
  const serviceTypeFilterRef = useRef<ServiceTypeFilterRef>(null);

  const handleClearAllFilters = () => {
    if (categoryFilterRef.current) {
      categoryFilterRef.current.selectAll();
    }
    if (cascadingAreaFilterRef.current) {
      cascadingAreaFilterRef.current.selectAll();
    }
    if (timeFilterRef.current) {
      timeFilterRef.current.selectAll();
    }
    if (serviceTypeFilterRef.current) {
      serviceTypeFilterRef.current.selectAll();
    }
  };
  const hasAnyFilters = selectedArea.division && selectedArea.division !== 'all' || selectedArea.region && selectedArea.region !== 'all' || selectedArea.zone && selectedArea.zone !== 'all' || selectedArea.branch && selectedArea.branch !== 'all' || selectedCategories.length > 0 || selectedServiceTypes.length > 0 || timeFilter.type !== 'all';
  return <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              ผลการดำเนินงานรายพื้นที่
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              วิเคราะห์แนวโน้มการให้บริการ ศักยภาพ และความต้องการของลูกค้าในแต่ละพื้นที่
            </p>
          </div>
          {hasAnyFilters && <Button type="button" variant="outline" onClick={handleClearAllFilters}>
              รีเซ็ตตัวกรอง
            </Button>}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* การกรองข้อมูล Container */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">การกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 items-stretch">
              {/* พื้นที่ */}
              <div className="h-full">
                <CascadingAreaFilter ref={cascadingAreaFilterRef} selectedArea={selectedArea} onAreaChange={setSelectedArea} />
              </div>
              
              {/* ประเภทการใช้บริการ */}
              <div className="h-full">
                <ServiceTypeFilter ref={serviceTypeFilterRef} selectedServiceTypes={selectedServiceTypes} onServiceTypeChange={setSelectedServiceTypes} />
              </div>
              
              {/* ช่วงเวลา */}
              <div className="h-full">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ช่วงเวลา</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TimeFilter ref={timeFilterRef} value={timeFilter} onChange={setTimeFilter} />
                  </CardContent>
                </Card>
              </div>
              
              {/* ความคิดเห็น */}
              <div className="h-full">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ความคิดเห็น</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryFilter ref={categoryFilterRef} selectedCategories={selectedCategories} onCategoryChange={setSelectedCategories} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ทัศนคติรายพื้นที่ Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <span className="text-2xl">📊</span>
              ทัศนคติรายพื้นที่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalSentimentChart selectedArea={selectedArea} />
          </CardContent>
        </Card>

        {/* แนวโน้มทัศนคติ Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <span className="text-2xl">📈</span>
              แนวโน้มทัศนคติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentTrendsChart />
          </CardContent>
        </Card>

        {/* หมวดหมู่ที่ถูกกล่าวถึง Container */}
        <MentionedCategoriesTable />
      </div>
    </div>;
}