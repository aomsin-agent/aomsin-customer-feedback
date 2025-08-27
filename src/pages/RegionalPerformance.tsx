import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CascadingAreaFilter } from '@/components/CustomerFeedback/CascadingAreaFilter';
import { TimeFilter, TimeFilterValue } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter } from '@/components/CustomerFeedback/CategoryFilter';

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
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });

  const handleClearAllFilters = () => {
    setSelectedArea({
      division: 'all',
      region: 'all',
      zone: 'all',
      branch: 'all'
    });
    setSelectedCategories([]);
    setTimeFilter({ type: 'all' });
  };

  const hasAnyFilters = 
    (selectedArea.division && selectedArea.division !== 'all') ||
    (selectedArea.region && selectedArea.region !== 'all') ||
    (selectedArea.zone && selectedArea.zone !== 'all') ||
    (selectedArea.branch && selectedArea.branch !== 'all') ||
    selectedCategories.length > 0 || 
    timeFilter.type !== 'all';

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
      
      <div className="space-y-4">
        {/* การกรองข้อมูล Container */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">การกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CascadingAreaFilter
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* ช่วงเวลาและความคิดเห็น */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ช่วงเวลาและความคิดเห็น</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">ช่วงเวลา</h4>
                      <TimeFilter
                        value={timeFilter}
                        onChange={setTimeFilter}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">ความคิดเห็น</h4>
                      <CategoryFilter
                        selectedCategories={selectedCategories}
                        onCategoryChange={setSelectedCategories}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
            <div className="text-center">
              <p className="text-muted-foreground">
                ส่วนนี้จะแสดงกราฟแนวโน้มทัศนคติและการเปลี่ยนแปลงตามช่วงเวลา
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}