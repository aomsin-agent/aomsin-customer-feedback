import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface RegionalSentimentChartProps {
  selectedArea: {
    division?: number | 'all';
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  };
}

export function RegionalSentimentChart({ selectedArea }: RegionalSentimentChartProps) {
  const [branches, setBranches] = useState<any[]>([]);

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
  };

  const regions = useMemo(() => {
    return [...new Set(branches?.map(b => b.region).filter(r => r !== null))].sort((a, b) => a - b);
  }, [branches]);

  const data = useMemo(() => {
    // Generate mock values but use real names
    const generateMockValues = (name: string) => ({
      name,
      positive: Math.floor(Math.random() * 100) + 50,
      negative: Math.floor(Math.random() * 50) + 20
    });

    // Fallback data if no branches loaded yet
    if (!branches.length) {
      return [
        generateMockValues('ภาค 1'),
        generateMockValues('ภาค 2'),
        generateMockValues('ภาค 3')
      ];
    }

    // Apply division filter first
    let filteredBranches = branches;
    if (selectedArea.division && selectedArea.division !== 'all') {
      filteredBranches = branches.filter(b => b.division === selectedArea.division);
    }

    if (selectedArea.branch && selectedArea.branch !== 'all') {
      return [generateMockValues(selectedArea.branch)];
    }
    
    if (selectedArea.zone && selectedArea.zone !== 'all') {
      const branchesInZone = filteredBranches
        .filter(b => b.region === selectedArea.region && b.resdesc === selectedArea.zone)
        .map(b => b.branch_name);
      return branchesInZone.length ? branchesInZone.map(generateMockValues) : [generateMockValues('ไม่มีข้อมูล')];
    }
    
    if (selectedArea.region && selectedArea.region !== 'all') {
      const zonesInRegion = [...new Set(
        filteredBranches
          .filter(b => b.region === selectedArea.region)
          .map(b => b.resdesc)
          .filter(z => z !== null)
      )];
      return zonesInRegion.length ? zonesInRegion.map(generateMockValues) : [generateMockValues('ไม่มีข้อมูล')];
    }
    
    if (selectedArea.division && selectedArea.division !== 'all') {
      // Show regions within the selected division
      const regionsInDivision = [...new Set(
        filteredBranches
          .map(b => b.region)
          .filter(r => r !== null)
      )].sort((a, b) => a - b);
      return regionsInDivision.length ? regionsInDivision.map(region => generateMockValues(`ภาค ${region}`)) : [generateMockValues('ไม่มีข้อมูล')];
    }
    
    // Show all regions
    return regions.length ? regions.map(region => generateMockValues(`ภาค ${region}`)) : [
      generateMockValues('ภาค 1'),
      generateMockValues('ภาค 2'),
      generateMockValues('ภาค 3')
    ];
  }, [selectedArea, branches, regions]);

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