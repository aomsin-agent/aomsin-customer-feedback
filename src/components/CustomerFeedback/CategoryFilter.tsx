import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelectDropdown, type DropdownOption } from '@/components/ui/multi-select-dropdown';
import { Button } from '@/components/ui/button';
import { Brush } from 'lucide-react';

interface CategoryData {
  no: number;
  main_topic: string;
  sub_topic: string;
  definition?: string;
}

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize with all selections when data is loaded
  useEffect(() => {
    if (categories.length > 0 && !initialized) {
      const allMainCategories = [...new Set(categories.map(c => c.main_topic))];
      const allSubCategories = categories.map(c => c.sub_topic);
      
      setSelectedMainCategories(allMainCategories);
      onCategoryChange(allSubCategories);
      setInitialized(true);
    }
  }, [categories, initialized, onCategoryChange]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category_ref')
      .select('no, main_topic, sub_topic, definition')
      .eq('allow', 'yes')
      .order('main_topic')
      .order('sub_topic');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  // Helper functions for hierarchical relationships
  const getSubCategoriesOfMain = (mainTopic: string) => {
    return categories.filter(c => c.main_topic === mainTopic).map(c => c.sub_topic);
  };

  const getMainTopicOfSub = (subTopic: string) => {
    const category = categories.find(c => c.sub_topic === subTopic);
    return category?.main_topic;
  };

  // Handle main category selection with cascading
  const handleMainCategoryChange = (values: string[]) => {
    setSelectedMainCategories(values);
    
    // When selecting main categories, auto-select ALL their sub-categories
    const allSubCategories = new Set<string>();
    values.forEach(mainTopic => {
      const subs = getSubCategoriesOfMain(mainTopic);
      subs.forEach(sub => allSubCategories.add(sub));
    });

    // Only keep sub-categories that belong to main categories that are STILL selected
    const keepSubCategories = selectedCategories.filter(subTopic => {
      const mainTopic = getMainTopicOfSub(subTopic);
      return mainTopic && values.includes(mainTopic);
    });

    const newSubCategories = [...new Set([...Array.from(allSubCategories), ...keepSubCategories])];
    onCategoryChange(newSubCategories);
  };

  // Handle sub-category selection with parent updating
  const handleSubCategoryChange = (values: string[]) => {
    onCategoryChange(values);
    
    // Keep existing main categories that still have at least one selected sub-category
    const existingMainCategories = selectedMainCategories.filter(mainTopic => {
      const mainSubCategories = getSubCategoriesOfMain(mainTopic);
      const selectedSubsForTopic = mainSubCategories.filter(sub => values.includes(sub));
      return selectedSubsForTopic.length > 0;
    });

    // Add main categories that have ALL their sub-categories selected
    const allMainTopics = [...new Set(categories.map(c => c.main_topic))];
    const fullySelectedMainCategories = allMainTopics.filter(mainTopic => {
      const mainSubCategories = getSubCategoriesOfMain(mainTopic);
      return mainSubCategories.length > 0 && mainSubCategories.every(sub => values.includes(sub));
    });

    const newMainCategories = [...new Set([...existingMainCategories, ...fullySelectedMainCategories])];
    setSelectedMainCategories(newMainCategories);
  };

  // Get unique main topics and convert to dropdown options with indeterminate states
  const mainTopics = [...new Set(categories.map(c => c.main_topic))];
  const mainCategoryOptions: DropdownOption[] = mainTopics.map(topic => {
    const topicSubCategories = getSubCategoriesOfMain(topic);
    const selectedSubsForTopic = topicSubCategories.filter(sub => selectedCategories.includes(sub));
    const isIndeterminate = selectedSubsForTopic.length > 0 && selectedSubsForTopic.length < topicSubCategories.length;
    
    return {
      value: topic,
      label: topic,
      indeterminate: isIndeterminate
    };
  });

  // Get all sub topics (not filtered by main category selection for proper hierarchy)
  const subCategoryOptions: DropdownOption[] = categories.map(category => ({
    value: category.sub_topic,
    label: category.sub_topic
  }));

  const handleClearAll = () => {
    setSelectedMainCategories([]);
    onCategoryChange([]);
  };

  // Calculate summary counts
  const selectedMainCategoriesCount = selectedMainCategories.length;
  const selectedSubCategoriesCount = selectedCategories.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ความคิดเห็น</CardTitle>
          {(selectedMainCategoriesCount > 0 || selectedSubCategoriesCount > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2"
            >
              <Brush className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MultiSelectDropdown
              options={mainCategoryOptions}
              selectedValues={selectedMainCategories}
              onValueChange={handleMainCategoryChange}
              placeholder="เลือกหมวดหมู่"
              searchPlaceholder="ค้นหาหมวดหมู่..."
              title="หมวดหมู่"
              onClear={() => handleMainCategoryChange([])}
            />

            <MultiSelectDropdown
              options={subCategoryOptions}
              selectedValues={selectedCategories}
              onValueChange={handleSubCategoryChange}
              placeholder="เลือกหมวดย่อย"
              searchPlaceholder="ค้นหาหมวดย่อย..."
              title="หมวดย่อย"
              onClear={() => handleSubCategoryChange([])}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            เลือกแล้ว: {selectedMainCategoriesCount} หมวดหมู่, {selectedSubCategoriesCount} หมวดย่อย
          </div>
        </div>
      </CardContent>
    </Card>
  );
}