import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockTableData = [
  {
    subTopic: 'ความรวดเร็วในการให้บริการ',
    mainTopic: 'บริการ',
    positiveCount: 45,
    negativeCount: 12,
    totalCount: 57
  },
  {
    subTopic: 'ทำเลที่ตั้งสาขา',
    mainTopic: 'สถานที่',
    positiveCount: 38,
    negativeCount: 8,
    totalCount: 46
  },
  {
    subTopic: 'ความสุภาพของเจ้าหน้าที่',
    mainTopic: 'เจ้าหน้าที่',
    positiveCount: 52,
    negativeCount: 5,
    totalCount: 57
  },
  {
    subTopic: 'ความถูกต้องของข้อมูล',
    mainTopic: 'ข้อมูล',
    positiveCount: 30,
    negativeCount: 15,
    totalCount: 45
  },
  {
    subTopic: 'ระบบออนไลน์',
    mainTopic: 'ระบบ',
    positiveCount: 25,
    negativeCount: 20,
    totalCount: 45
  },
  {
    subTopic: 'ค่าธรรมเนียม',
    mainTopic: 'ราคา',
    positiveCount: 18,
    negativeCount: 28,
    totalCount: 46
  },
  {
    subTopic: 'เวลาทำการ',
    mainTopic: 'อื่นๆ',
    positiveCount: 35,
    negativeCount: 10,
    totalCount: 45
  },
  {
    subTopic: 'ความชัดเจนของป้ายบอกทาง',
    mainTopic: 'สถานที่',
    positiveCount: 22,
    negativeCount: 18,
    totalCount: 40
  }
];

export function MentionedCategoriesTable() {
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
              {mockTableData.map((row, index) => (
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