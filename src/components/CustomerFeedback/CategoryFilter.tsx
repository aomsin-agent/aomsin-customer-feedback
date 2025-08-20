import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMainTopics, setExpandedMainTopics] = useState<string[]>([]);

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

  const groupedCategories = categories.reduce((acc, category) => {
    const mainTopic = category.main_topic;
    if (!acc[mainTopic]) {
      acc[mainTopic] = [];
    }
    acc[mainTopic].push(category);
    return acc;
  }, {} as Record<string, CategoryData[]>);

  const filteredCategories = Object.keys(groupedCategories).reduce((acc, mainTopic) => {
    const filteredSubTopics = groupedCategories[mainTopic].filter(category =>
      category.main_topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.sub_topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.definition && category.definition.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filteredSubTopics.length > 0) {
      acc[mainTopic] = filteredSubTopics;
    }
    return acc;
  }, {} as Record<string, CategoryData[]>);

  const handleSelectAll = () => {
    const allSubTopics = categories.map(c => c.sub_topic);
    onCategoryChange(allSubTopics);
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  const handleSubTopicToggle = (subTopic: string) => {
    const newSelected = selectedCategories.includes(subTopic)
      ? selectedCategories.filter(cat => cat !== subTopic)
      : [...selectedCategories, subTopic];
    onCategoryChange(newSelected);
  };

  const handleMainTopicToggle = (mainTopic: string) => {
    const subTopicsInMain = groupedCategories[mainTopic]?.map(c => c.sub_topic) || [];
    const allSelected = subTopicsInMain.every(sub => selectedCategories.includes(sub));
    
    if (allSelected) {
      // Unselect all subtopics in this main topic
      const newSelected = selectedCategories.filter(cat => !subTopicsInMain.includes(cat));
      onCategoryChange(newSelected);
    } else {
      // Select all subtopics in this main topic
      const newSelected = [...new Set([...selectedCategories, ...subTopicsInMain])];
      onCategoryChange(newSelected);
    }
  };

  const toggleMainTopic = (mainTopic: string) => {
    setExpandedMainTopics(prev =>
      prev.includes(mainTopic)
        ? prev.filter(topic => topic !== mainTopic)
        : [...prev, mainTopic]
    );
  };

  const isMainTopicSelected = (mainTopic: string) => {
    const subTopicsInMain = groupedCategories[mainTopic]?.map(c => c.sub_topic) || [];
    return subTopicsInMain.length > 0 && subTopicsInMain.every(sub => selectedCategories.includes(sub));
  };

  const isMainTopicPartiallySelected = (mainTopic: string) => {
    const subTopicsInMain = groupedCategories[mainTopic]?.map(c => c.sub_topic) || [];
    return subTopicsInMain.some(sub => selectedCategories.includes(sub)) && 
           !subTopicsInMain.every(sub => selectedCategories.includes(sub));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">ความคิดเห็น</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Input
            placeholder="ค้นหาหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              เลือกทั้งหมด
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              ล้างการเลือก
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            เลือกแล้ว: {selectedCategories.length} หมวดหมู่
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {Object.keys(filteredCategories).map(mainTopic => (
                <div key={mainTopic}>
                  <Collapsible
                    open={expandedMainTopics.includes(mainTopic)}
                    onOpenChange={() => toggleMainTopic(mainTopic)}
                  >
                    <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                      <Checkbox
                        checked={isMainTopicSelected(mainTopic)}
                        onCheckedChange={() => handleMainTopicToggle(mainTopic)}
                      />
                      <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left text-sm font-medium">
                        {expandedMainTopics.includes(mainTopic) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {mainTopic}
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pl-8">
                      {filteredCategories[mainTopic].map(category => (
                        <div key={category.no} className="flex items-center space-x-2 p-1">
                          <Checkbox
                            id={`sub-${category.no}`}
                            checked={selectedCategories.includes(category.sub_topic)}
                            onCheckedChange={() => handleSubTopicToggle(category.sub_topic)}
                          />
                          <label
                            htmlFor={`sub-${category.no}`}
                            className="text-sm cursor-pointer flex-1"
                            title={category.definition}
                          >
                            {category.sub_topic}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}