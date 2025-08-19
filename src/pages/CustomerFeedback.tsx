import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BranchData {
  region: number;
  division: number;
  branch_name: string;
}

export default function CustomerFeedback() {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_ref')
        .select('region, division, branch_name')
        .order('region', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const uniqueRegions = Array.from(new Set(branches.map(b => b.region))).filter(Boolean);
  const uniqueDivisions = Array.from(new Set(
    branches
      .filter(b => selectedRegion === 'all' || b.region.toString() === selectedRegion)
      .map(b => b.division)
  )).filter(Boolean);
  
  const filteredBranches = branches.filter(b => {
    const regionMatch = selectedRegion === 'all' || b.region.toString() === selectedRegion;
    const divisionMatch = selectedDivision === 'all' || b.division.toString() === selectedDivision;
    const searchMatch = searchTerm === '' || b.branch_name.toLowerCase().includes(searchTerm.toLowerCase());
    return regionMatch && divisionMatch && searchMatch;
  });

  return (
    <div className="w-full p-4 md:p-6 lg:pl-6 lg:pr-6 xl:pl-8 xl:pr-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ข้อคิดเห็นของลูกค้า
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Filtering Section - Left */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">ตัวกรอง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">ภาค</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueRegions.map(region => (
                      <SelectItem key={region} value={region.toString()}>
                        ภาค {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Division Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">เขต</label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเขต" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueDivisions.map(division => (
                      <SelectItem key={division} value={division.toString()}>
                        เขต {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">สาขา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาสาขา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {filteredBranches.map(branch => (
                      <SelectItem key={branch.branch_name} value={branch.branch_name}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section - Right */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">รายการข้อคิดเห็น</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)] p-6">
                <div className="text-center py-8">
                  <div className="text-4xl md:text-6xl mb-4">💬</div>
                  <h2 className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
                    เนื้อหาจะถูกเพิ่มเข้ามาในภายหลัง
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    ส่วนนี้จะแสดงข้อคิดเห็นและข้อเสนอแนะจากลูกค้า รวมถึงการวิเคราะห์ความพึงพอใจ
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}