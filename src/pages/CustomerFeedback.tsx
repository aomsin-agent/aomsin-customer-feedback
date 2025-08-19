import React, { useState, useEffect, useMemo } from 'react';
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

interface CachedOptions {
  regions: { value: string; label: string }[];
  divisions: { value: string; label: string }[];
  branches: { value: string; label: string }[];
}

export default function CustomerFeedback() {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [cachedOptions, setCachedOptions] = useState<CachedOptions>({
    regions: [],
    divisions: [],
    branches: []
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAndCacheBranches();
  }, []);

  const fetchAndCacheBranches = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('branch_ref')
        .select('region, division, branch_name')
        .order('region', { ascending: true });

      if (error) throw error;
      
      const branchData = data || [];
      setBranches(branchData);
      
      // Cache all options
      const uniqueRegions = Array.from(new Set(branchData.map(b => b.region)))
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map(region => ({
          value: region.toString(),
          label: `ภาค ${region}`
        }));

      const uniqueDivisions = Array.from(new Set(branchData.map(b => b.division)))
        .filter(Boolean)
        .sort((a, b) => a - b)
        .map(division => ({
          value: division.toString(),
          label: `เขต ${division}`
        }));

      const uniqueBranches = branchData
        .map(branch => ({
          value: branch.branch_name,
          label: branch.branch_name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setCachedOptions({
        regions: uniqueRegions,
        divisions: uniqueDivisions,
        branches: uniqueBranches
      });
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter divisions based on selected region
  const availableDivisions = useMemo(() => {
    if (selectedRegion === 'all') {
      return cachedOptions.divisions;
    }
    
    const filteredDivisions = Array.from(new Set(
      branches
        .filter(b => b.region.toString() === selectedRegion)
        .map(b => b.division)
    ))
    .filter(Boolean)
    .sort((a, b) => a - b)
    .map(division => ({
      value: division.toString(),
      label: `เขต ${division}`
    }));

    return filteredDivisions;
  }, [selectedRegion, branches, cachedOptions.divisions]);

  // Filter branches based on selected region and division
  const availableBranches = useMemo(() => {
    let filteredBranches = branches;

    if (selectedRegion !== 'all') {
      filteredBranches = filteredBranches.filter(b => b.region.toString() === selectedRegion);
    }

    if (selectedDivision !== 'all') {
      filteredBranches = filteredBranches.filter(b => b.division.toString() === selectedDivision);
    }

    if (searchTerm) {
      filteredBranches = filteredBranches.filter(b => 
        b.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredBranches
      .map(branch => ({
        value: branch.branch_name,
        label: branch.branch_name
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [selectedRegion, selectedDivision, searchTerm, branches]);

  // Reset dependent filters when parent filter changes
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedDivision('all');
    setSelectedBranch('all');
  };

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value);
    setSelectedBranch('all');
  };

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
              <div className="relative">
                <label className="text-sm font-medium mb-2 block">ภาค</label>
                <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {cachedOptions.regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Division Filter */}
              <div className="relative">
                <label className="text-sm font-medium mb-2 block">เขต</label>
                <Select value={selectedDivision} onValueChange={handleDivisionChange} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเขต" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {availableDivisions.map(division => (
                      <SelectItem key={division.value} value={division.value}>
                        {division.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Search */}
              <div className="relative">
                <label className="text-sm font-medium mb-2 block">สาขา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาสาขา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={isLoading}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {availableBranches.map(branch => (
                      <SelectItem key={branch.value} value={branch.value}>
                        {branch.label}
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