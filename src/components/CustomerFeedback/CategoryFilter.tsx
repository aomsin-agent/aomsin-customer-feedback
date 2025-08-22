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

  // Get unique main topics and convert to dropdown options
  const mainTopics = [...new Set(categories.map(c => c.main_topic))];
  const mainCategoryOptions: DropdownOption[] = mainTopics.map(topic => ({
    value: topic,
    label: topic
  }));

  // Get sub topics based on selected main categories
  const availableSubTopics = categories.filter(category => 
    selectedMainCategories.length === 0 || selectedMainCategories.includes(category.main_topic)
  );
  
  const subCategoryOptions: DropdownOption[] = availableSubTopics.map(category => ({
    value: category.sub_topic,
    label: category.sub_topic
  }));

  // Update selected sub-categories when main categories change
  useEffect(() => {
    if (selectedMainCategories.length > 0) {
      const validSubCategories = selectedCategories.filter(subTopic => {
        const category = categories.find(c => c.sub_topic === subTopic);
        return category && selectedMainCategories.includes(category.main_topic);
      });
      if (validSubCategories.length !== selectedCategories.length) {
        onCategoryChange(validSubCategories);
      }
    }
  }, [selectedMainCategories, categories]);

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
              onValueChange={setSelectedMainCategories}
              placeholder="เลือกหมวดหมู่"
              searchPlaceholder="ค้นหาหมวดหมู่..."
              title="หมวดหมู่"
              onClear={() => setSelectedMainCategories([])}
            />

            <MultiSelectDropdown
              options={subCategoryOptions}
              selectedValues={selectedCategories}
              onValueChange={onCategoryChange}
              placeholder="เลือกหมวดย่อย"
              searchPlaceholder="ค้นหาหมวดย่อย..."
              title="หมวดย่อย"
              onClear={() => onCategoryChange([])}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedMainCategoriesCount === mainCategoryOptions.length && selectedSubCategoriesCount === subCategoryOptions.length
              ? "เลือกทั้งหมด"
              : `เลือกแล้ว: ${selectedMainCategoriesCount} หมวดหมู่, ${selectedSubCategoriesCount} หมวดย่อย`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}