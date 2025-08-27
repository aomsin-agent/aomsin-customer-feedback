import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';


const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function SentimentTrendsChart() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mockData, setMockData] = useState<any[]>([]);
  const processedData = useMemo(() => {
    if (!mockData.length) return [];
    
    return mockData.map(item => {
      const newItem = { ...item };
      categories.forEach(category => {
        const negativeValue = Math.floor(Math.random() * 40) + 15;
        newItem[`${category}Neg`] = -negativeValue;
      });
      return newItem;
    });
  }, [mockData, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategories(categories);
      generateMockData();
    }
  }, [categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category_ref')
      .select('main_topic')
      .eq('allow', 'yes')
      .order('main_topic');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    const uniqueCategories = [...new Set(data?.map(c => c.main_topic))];
    setCategories(uniqueCategories);
  };

  const generateMockData = () => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
    const data = months.map(month => {
      const item: any = { month };
      categories.forEach(category => {
        item[category] = Math.floor(Math.random() * 50) + 20;
      });
      return item;
    });
    
    setMockData(data);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label 
                  htmlFor={category}
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: colors[index] }}
                  />
                  {category}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="w-full h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            key={`${processedData.length}-${selectedCategories.join(',')}`}
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={2} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number, name: string) => {
                const isNegative = name.includes('Neg');
                const category = name.replace('Neg', '');
                return [
                  Math.abs(value),
                  isNegative ? `${category} (เชิงลบ)` : `${category} (เชิงบวก)`
                ];
              }}
            />
            {categories.map((category, index) => (
              selectedCategories.includes(category) && (
                <React.Fragment key={category}>
                  <Line
                    type="monotone"
                    dataKey={category}
                    stroke={colors[index]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${category}Neg`}
                    stroke={colors[index]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </React.Fragment>
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}