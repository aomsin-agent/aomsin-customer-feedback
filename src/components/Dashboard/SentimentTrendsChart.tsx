import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const mockData = [
  { month: 'ม.ค.', บริการ: 45, สถานที่: 30, เจ้าหน้าที่: 25, ข้อมูล: 20, ระบบ: 15, ราคา: 35, อื่นๆ: 40 },
  { month: 'ก.พ.', บริการ: 50, สถานที่: 35, เจ้าหน้าที่: 30, ข้อมูล: 25, ระบบ: 20, ราคา: 40, อื่นๆ: 45 },
  { month: 'มี.ค.', บริการ: 55, สถานที่: 40, เจ้าหน้าที่: 35, ข้อมูล: 30, ระบบ: 25, ราคา: 45, อื่นๆ: 50 },
  { month: 'เม.ย.', บริการ: 60, สถานที่: 45, เจ้าหน้าที่: 40, ข้อมูล: 35, ระบบ: 30, ราคา: 50, อื่นๆ: 55 },
  { month: 'พ.ค.', บริการ: 65, สถานที่: 50, เจ้าหน้าที่: 45, ข้อมูล: 40, ระบบ: 35, ราคา: 55, อื่นๆ: 60 },
  { month: 'มิ.ย.', บริการ: 70, สถานที่: 55, เจ้าหน้าที่: 50, ข้อมูล: 45, ระบบ: 40, ราคา: 60, อื่นๆ: 65 }
];

// Convert positive values to negative for the chart display
const processedData = mockData.map(item => ({
  ...item,
  บริการNeg: -item.บริการ,
  สถานที่Neg: -item.สถานที่,
  เจ้าหน้าที่Neg: -item.เจ้าหน้าที่,
  ข้อมูลNeg: -item.ข้อมูล,
  ระบบNeg: -item.ระบบ,
  ราคาNeg: -item.ราคา,
  อื่นๆNeg: -item.อื่นๆ
}));

const categories = ['บริการ', 'สถานที่', 'เจ้าหน้าที่', 'ข้อมูล', 'ระบบ', 'ราคา', 'อื่นๆ'];
const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function SentimentTrendsChart() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);

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

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
                    strokeDasharray="5 5"
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