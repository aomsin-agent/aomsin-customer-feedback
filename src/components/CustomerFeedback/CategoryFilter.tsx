import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

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
  const [mainCategorySearch, setMainCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Get unique main topics
  const mainTopics = [...new Set(categories.map(c => c.main_topic))];
  const filteredMainTopics = mainTopics.filter(topic =>
    topic.toLowerCase().includes(mainCategorySearch.toLowerCase())
  );

  // Get sub topics based on selected main categories
  const availableSubTopics = categories.filter(category => 
    selectedMainCategories.length === 0 || selectedMainCategories.includes(category.main_topic)
  );
  
  const filteredSubTopics = availableSubTopics.filter(category =>
    category.sub_topic.toLowerCase().includes(subCategorySearch.toLowerCase())
  );

  const handleMainCategoryToggle = (mainTopic: string) => {
    const newSelected = selectedMainCategories.includes(mainTopic)
      ? selectedMainCategories.filter(cat => cat !== mainTopic)
      : [...selectedMainCategories, mainTopic];
    setSelectedMainCategories(newSelected);
  };

  const handleMainCategorySelectAll = () => {
    setSelectedMainCategories(mainTopics);
  };

  const handleMainCategoryClearAll = () => {
    setSelectedMainCategories([]);
  };

  const handleSubCategoryToggle = (subTopic: string) => {
    const newSelected = selectedCategories.includes(subTopic)
      ? selectedCategories.filter(cat => cat !== subTopic)
      : [...selectedCategories, subTopic];
    onCategoryChange(newSelected);
  };

  const handleSubCategorySelectAll = () => {
    const allAvailableSubTopics = availableSubTopics.map(c => c.sub_topic);
    onCategoryChange([...new Set([...selectedCategories, ...allAvailableSubTopics])]);
  };

  const handleSubCategoryClearAll = () => {
    const subTopicsToKeep = selectedCategories.filter(subTopic => {
      const category = categories.find(c => c.sub_topic === subTopic);
      return category && !availableSubTopics.some(c => c.sub_topic === subTopic);
    });
    onCategoryChange(subTopicsToKeep);
  };

  const renderDropdown = (
    title: string,
    items: any[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    onSelectAll: () => void,
    onClearAll: () => void,
    searchValue: string,
    onSearchChange: (value: string) => void,
    searchPlaceholder: string,
    getItemValue: (item: any) => string,
    getItemLabel: (item: any) => string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{title}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {selectedItems.length === 0
                ? `เลือก${title}`
                : selectedItems.length === 1
                ? getItemLabel(items.find(item => getItemValue(item) === selectedItems[0]) || selectedItems[0])
                : `เลือกแล้ว ${selectedItems.length} รายการ`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 z-50 bg-popover border" align="start" sideOffset={4}>
          <div className="p-3 border-b">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="p-2 border-b">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-7 text-xs">
                เลือกทั้งหมด
              </Button>
              <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs">
                ล้างการเลือก
              </Button>
            </div>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-2">
              {items.map((item, index) => {
                const itemValue = getItemValue(item);
                const itemLabel = getItemLabel(item);
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`item-${index}`}
                      checked={selectedItems.includes(itemValue)}
                      onCheckedChange={() => onToggle(itemValue)}
                    />
                    <label
                      htmlFor={`item-${index}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {itemLabel}
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">ความคิดเห็น</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderDropdown(
            "หมวดหมู่",
            filteredMainTopics,
            selectedMainCategories,
            handleMainCategoryToggle,
            handleMainCategorySelectAll,
            handleMainCategoryClearAll,
            mainCategorySearch,
            setMainCategorySearch,
            "ค้นหาหมวดหมู่...",
            (item) => item,
            (item) => item
          )}

          {renderDropdown(
            "หมวดย่อย",
            filteredSubTopics,
            selectedCategories,
            handleSubCategoryToggle,
            handleSubCategorySelectAll,
            handleSubCategoryClearAll,
            subCategorySearch,
            setSubCategorySearch,
            "ค้นหาหมวดย่อย...",
            (item) => item.sub_topic,
            (item) => item.sub_topic
          )}

          <div className="text-sm text-muted-foreground">
            เลือกแล้ว: {selectedCategories.length} หมวดย่อย
          </div>
        </div>
      </CardContent>
    </Card>
  );
}