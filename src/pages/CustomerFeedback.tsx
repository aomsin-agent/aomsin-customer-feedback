import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AreaFilter, AreaFilterRef } from '@/components/CustomerFeedback/AreaFilter';
import { TimeFilter, TimeFilterValue, TimeFilterRef } from '@/components/CustomerFeedback/TimeFilter';
import { CategoryFilter, CategoryFilterRef } from '@/components/CustomerFeedback/CategoryFilter';
import { CommentsList, SentimentFilter } from '@/components/CustomerFeedback/CommentsList';

export default function CustomerFeedback() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({
    type: 'all'
  });
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const categoryFilterRef = useRef<CategoryFilterRef>(null);
  const areaFilterRef = useRef<AreaFilterRef>(null);
  const timeFilterRef = useRef<TimeFilterRef>(null);

  const handleClearAllFilters = () => {
    areaFilterRef.current?.selectAll();
    timeFilterRef.current?.selectAll();
    categoryFilterRef.current?.selectAll();
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
        </div>

        {/* Comments section - bottom on mobile, right on desktop */}
        <div className="md:col-span-8 flex-1 order-2 md:order-none">
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
