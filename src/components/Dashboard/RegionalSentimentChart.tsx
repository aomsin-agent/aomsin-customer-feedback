import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface RegionalSentimentChartProps {
  selectedArea: {
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  };
}

export function RegionalSentimentChart({ selectedArea }: RegionalSentimentChartProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [regions, setRegions] = useState<number[]>([]);

  useEffect(() => {
    fetchBranchData();
  }, []);

  const fetchBranchData = async () => {
    const { data, error } = await supabase
      .from('branch_ref')
      .select('region, division, branch_name, resdesc')
      .order('region')
      .order('branch_name');

    if (error) {
      console.error('Error fetching branches:', error);
      return;
    }

    setBranches(data || []);
    const uniqueRegions = [...new Set(data?.map(b => b.region).filter(r => r !== null))].sort((a, b) => a - b);
    setRegions(uniqueRegions);
  };

  const getDataBasedOnSelection = () => {
    // Generate mock values but use real names
    const generateMockValues = (name: string) => ({
      name,
      positive: Math.floor(Math.random() * 100) + 50,
      negative: Math.floor(Math.random() * 50) + 20  // Changed to positive value
    });

    if (selectedArea.branch && selectedArea.branch !== 'all') {
      return [generateMockValues(selectedArea.branch)];
    }
    
    if (selectedArea.zone && selectedArea.zone !== 'all') {
      const branchesInZone = branches
        .filter(b => b.region === selectedArea.region && b.resdesc === selectedArea.zone)
        .map(b => b.branch_name);
      return branchesInZone.map(generateMockValues);
    }
    
    if (selectedArea.region && selectedArea.region !== 'all') {
      const zonesInRegion = [...new Set(
        branches
          .filter(b => b.region === selectedArea.region)
          .map(b => b.resdesc)
          .filter(z => z !== null)
      )];
      return zonesInRegion.map(generateMockValues);
    }
    
    // Show all regions
    return regions.map(region => generateMockValues(`ภาค ${region}`));
  };

  const data = useMemo(() => getDataBasedOnSelection(), [selectedArea, branches]);

  return (
    <div className="w-full h-96 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          key={`${JSON.stringify(selectedArea)}-${data.length}`}
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
              value,
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