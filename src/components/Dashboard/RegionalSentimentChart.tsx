import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegionalSentimentChartProps {
  selectedArea: {
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  };
}

export function RegionalSentimentChart({ selectedArea }: RegionalSentimentChartProps) {
  // Mock data - will be replaced with real data later
  const mockData = [
    { name: 'ภาคเหนือ', positive: 120, negative: -45 },
    { name: 'ภาคกลาง', positive: 150, negative: -30 },
    { name: 'ภาคตะวันออกเฉียงเหนือ', positive: 100, negative: -60 },
    { name: 'ภาคใต้', positive: 130, negative: -40 },
    { name: 'ภาคตะวันออก', positive: 110, negative: -35 },
    { name: 'ภาคตะวันตก', positive: 140, negative: -25 }
  ];

  const getDataBasedOnSelection = () => {
    if (selectedArea.branch && selectedArea.branch !== 'all') {
      return [{ name: selectedArea.branch, positive: 85, negative: -25 }];
    }
    if (selectedArea.zone && selectedArea.zone !== 'all') {
      return [
        { name: 'สาขา A', positive: 45, negative: -15 },
        { name: 'สาขา B', positive: 60, negative: -20 },
        { name: 'สาขา C', positive: 55, negative: -18 }
      ];
    }
    if (selectedArea.region && selectedArea.region !== 'all') {
      return [
        { name: 'เขต 1', positive: 80, negative: -25 },
        { name: 'เขต 2', positive: 70, negative: -20 },
        { name: 'เขต 3', positive: 90, negative: -30 }
      ];
    }
    return mockData;
  };

  const data = getDataBasedOnSelection();

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="hsl(var(--foreground))"
          />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number, name: string) => [
              Math.abs(value),
              name === 'positive' ? 'ความคิดเห็นเชิงบวก' : 'ความคิดเห็นเชิงลบ'
            ]}
          />
          <Bar dataKey="negative" fill="hsl(var(--destructive))" />
          <Bar dataKey="positive" fill="hsl(var(--success))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}