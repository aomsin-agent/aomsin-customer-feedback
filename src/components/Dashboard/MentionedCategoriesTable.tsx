import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface CategoryData {
  no: number;
  main_topic: string;
  sub_topic: string;
  definition?: string;
}

export function MentionedCategoriesTable() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

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
    
    // Generate mock data for each category
    const mockTableData = (data || []).map(category => ({
      subTopic: category.sub_topic,
      mainTopic: category.main_topic,
      positiveCount: Math.floor(Math.random() * 50) + 10,
      negativeCount: Math.floor(Math.random() * 30) + 5,
      get totalCount() { return this.positiveCount + this.negativeCount; }
    }));

    setTableData(mockTableData);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <span className="text-2xl">📊</span>
          หมวดหมู่ที่ถูกกล่าวถึง
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">ประเด็นที่กล่าวถึง</TableHead>
                <TableHead className="min-w-[120px]">หัวข้อ</TableHead>
                <TableHead className="text-center min-w-[100px]">เชิงบวก</TableHead>
                <TableHead className="text-center min-w-[100px]">เชิงลบ</TableHead>
                <TableHead className="text-center min-w-[100px]">รวม</TableHead>
                <TableHead className="text-center min-w-[120px]">ดูข้อความเชิงบวก</TableHead>
                <TableHead className="text-center min-w-[120px]">ดูข้อความเชิงลบ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.subTopic}</TableCell>
                  <TableCell>{row.mainTopic}</TableCell>
                  <TableCell className="text-center text-success font-semibold">
                    {row.positiveCount}
                  </TableCell>
                  <TableCell className="text-center text-destructive font-semibold">
                    {row.negativeCount}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {row.totalCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-success border-success hover:bg-success hover:text-success-foreground"
                    >
                      ดูข้อความ
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      ดูข้อความ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}