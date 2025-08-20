import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AreaFilter } from '@/components/CustomerFeedback/AreaFilter';
import { TimeFilter, TimeFilterValue } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter } from '@/components/CustomerFeedback/CategoryFilter';
import { CommentsList, SentimentFilter } from '@/components/CustomerFeedback/CommentsList';

export default function CustomerFeedback() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'lookback',
    lookbackDays: 7
  });
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');

  const handleClearAllFilters = () => {
    setSelectedAreas([]);
    setSelectedCategories([]);
    setTimeFilter({ type: 'lookback', lookbackDays: 7 });
    setSentimentFilter('all');
  };

  const hasAnyFilters = selectedAreas.length > 0 || selectedCategories.length > 0 || sentimentFilter !== 'all';

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
              ล้างตัวกรองทั้งหมด
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout: Filters on left, Comments on right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left side: Filters - becomes top section on mobile */}
        <div className="xl:col-span-4 space-y-4 xl:h-full overflow-y-auto">
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

        {/* Right side: Comments List - becomes bottom section on mobile */}
        <div className="xl:col-span-8">
          <CommentsList
            selectedAreas={selectedAreas}
            selectedCategories={selectedCategories}
            timeFilter={timeFilter}
            sentimentFilter={sentimentFilter}
            onSentimentFilterChange={setSentimentFilter}
          />
        </div>
      </div>
    </div>
  );
}
