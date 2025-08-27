import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CascadingAreaFilter } from '@/components/CustomerFeedback/CascadingAreaFilter';
import { TimeFilter, TimeFilterValue } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter } from '@/components/CustomerFeedback/CategoryFilter';

export default function RegionalPerformance() {
  const [selectedArea, setSelectedArea] = useState<{
    division?: number;
    region?: number;
    branch?: string;
  }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });

  const handleClearAllFilters = () => {
    setSelectedArea({});
    setSelectedCategories([]);
    setTimeFilter({ type: 'all' });
  };

  const hasAnyFilters = Object.keys(selectedArea).length > 0 || selectedCategories.length > 0 || timeFilter.type !== 'all';

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
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
          {hasAnyFilters && (
            <Button variant="outline" onClick={handleClearAllFilters}>
              ล้างตัวกรองทั้งหมด
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* การกรองข้อมูล Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">การกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <CascadingAreaFilter
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
              />
              
              <TimeFilter
                value={timeFilter}
                onChange={setTimeFilter}
              />
              
              <CategoryFilter
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
              />
            </div>
          </CardContent>
        </Card>

        {/* ทัศนคติรายพื้นที่ Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              ทัศนคติรายพื้นที่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-muted-foreground">
                ส่วนนี้จะแสดงแผนที่ความรู้สึกและทัศนคติของลูกค้าในแต่ละพื้นที่
              </p>
            </div>
          </CardContent>
        </Card>

        {/* แนวโน้มทัศนคติ Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <span className="text-3xl">📈</span>
              แนวโน้มทัศนคติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-muted-foreground">
                ส่วนนี้จะแสดงกราฟแนวโน้มทัศนคติและการเปลี่ยนแปลงตามช่วงเวลา
              </p>
            </div>
          </CardContent>
        </Card>

        {/* หมวดหมู่ที่ถูกกล่าวถึง Container */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <span className="text-3xl">📊</span>
              หมวดหมู่ที่ถูกกล่าวถึง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-muted-foreground">
                ส่วนนี้จะแสดงสถิติหมวดหมู่ที่ลูกค้ากล่าวถึงมากที่สุดในพื้นที่ที่เลือก
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}