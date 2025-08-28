import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AreaFilter } from '@/components/CustomerFeedback/AreaFilter';
import { TimeFilter, TimeFilterValue } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter } from '@/components/CustomerFeedback/CategoryFilter';
import { SevereCommentsList, SevereSentimentFilter } from '@/components/CustomerFeedback/SevereCommentsList';

export default function SevereComplaints() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });
  const [severeSentimentFilter, setSevereSentimentFilter] = useState<SevereSentimentFilter>('all');

  const handleClearAllFilters = () => {
    setSelectedAreas([]);
    setSelectedCategories([]);
    setTimeFilter({ type: 'all' });
    setSevereSentimentFilter('all');
  };

  const hasAnyFilters = selectedAreas.length > 0 || selectedCategories.length > 0 || severeSentimentFilter !== 'all';

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              ข้อร้องเรียนที่รุนแรง
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              ติดตามและจัดการข้อร้องเรียนที่มีความรุนแรงสูงและต้องการความสนใจเป็นพิเศษ
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
      <div className="flex flex-col md:grid md:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
        {/* Filters section - top on mobile, left on desktop */}
        <div className="md:col-span-4 space-y-4 md:h-full md:overflow-y-auto order-1 md:order-none">
          <AreaFilter
            selectedAreas={selectedAreas}
            onAreaChange={setSelectedAreas}
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

        {/* Comments section - bottom on mobile, right on desktop */}
        <div className="md:col-span-8 flex-1 order-2 md:order-none">
          <SevereCommentsList
            selectedAreas={selectedAreas}
            selectedCategories={selectedCategories}
            timeFilter={timeFilter}
            sentimentFilter={severeSentimentFilter}
            onSentimentFilterChange={setSevereSentimentFilter}
          />
        </div>
      </div>
    </div>
  );
}