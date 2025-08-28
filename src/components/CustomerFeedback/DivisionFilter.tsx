import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DivisionFilterProps {
  selectedDivision: number | 'all';
  onDivisionChange: (division: number | 'all') => void;
}

export function DivisionFilter({ selectedDivision, onDivisionChange }: DivisionFilterProps) {
  const [divisions, setDivisions] = useState<number[]>([]);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_ref')
        .select('division')
        .not('division', 'is', null)
        .order('division');

      if (error) {
        console.error('Error fetching divisions:', error);
        // Fallback data if Supabase fails
        setDivisions([1, 2, 3, 4, 5, 6]);
        return;
      }

      const uniqueDivisions = [...new Set(data.map(item => item.division))].sort();
      setDivisions(uniqueDivisions);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      // Fallback data
      setDivisions([1, 2, 3, 4, 5, 6]);
    }
  };

  const handleDivisionChange = (value: string) => {
    if (value === 'all') {
      onDivisionChange('all');
    } else {
      onDivisionChange(parseInt(value));
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">สายกิจ</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedDivision.toString()}
          onValueChange={handleDivisionChange}
        >
          <SelectTrigger className="w-full bg-background border-input">
            <SelectValue placeholder="เลือกสายกิจ" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border shadow-lg z-50">
            <SelectItem value="all" className="hover:bg-accent">
              ทุกสายกิจ
            </SelectItem>
            {divisions.map((division) => (
              <SelectItem 
                key={division} 
                value={division.toString()}
                className="hover:bg-accent"
              >
                สายกิจ {division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}