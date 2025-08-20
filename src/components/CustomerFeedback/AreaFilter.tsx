import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BranchData {
  region: string | number;
  division: string | number;
  branch_name: string;
  district: string;
}

interface AreaFilterProps {
  selectedAreas: string[];
  onAreaChange: (areas: string[]) => void;
}

export function AreaFilter({ selectedAreas, onAreaChange }: AreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from('branch_ref')
      .select('region, division, branch_name, district')
      .order('region')
      .order('division')
      .order('branch_name');

    if (error) {
      console.error('Error fetching branches:', error);
      return;
    }

    setBranches(data || []);
  };

  const groupedData = branches.reduce((acc, branch) => {
    const region = branch.region?.toString() || 'ไม่ระบุภาค';
    const division = branch.division?.toString() || 'ไม่ระบุเขต';
    
    if (!acc[region]) acc[region] = {};
    if (!acc[region][division]) acc[region][division] = [];
    acc[region][division].push(branch);
    
    return acc;
  }, {} as Record<string, Record<string, BranchData[]>>);

  const filteredData = Object.keys(groupedData).reduce((acc, region) => {
    const divisions = Object.keys(groupedData[region]).reduce((divAcc, division) => {
      const filteredBranches = groupedData[region][division].filter(branch =>
        branch.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        division.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredBranches.length > 0) {
        divAcc[division] = filteredBranches;
      }
      return divAcc;
    }, {} as Record<string, BranchData[]>);

    if (Object.keys(divisions).length > 0) {
      acc[region] = divisions;
    }
    return acc;
  }, {} as Record<string, Record<string, BranchData[]>>);

  const handleSelectAll = () => {
    const allBranches = branches.map(b => b.branch_name);
    onAreaChange(allBranches);
  };

  const handleClearAll = () => {
    onAreaChange([]);
  };

  const handleBranchToggle = (branchName: string) => {
    const newSelected = selectedAreas.includes(branchName)
      ? selectedAreas.filter(area => area !== branchName)
      : [...selectedAreas, branchName];
    onAreaChange(newSelected);
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleDivision = (key: string) => {
    setExpandedDivisions(prev =>
      prev.includes(key)
        ? prev.filter(d => d !== key)
        : [...prev, key]
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">พื้นที่ดูแล</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Input
            placeholder="ค้นหาภาค, เขต, หรือสาขา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              เลือกทั้งหมด
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              ล้างการเลือก
            </Button>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {Object.keys(filteredData).map(region => (
                <div key={region}>
                  <Collapsible
                    open={expandedRegions.includes(region)}
                    onOpenChange={() => toggleRegion(region)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted rounded text-sm font-medium">
                      {expandedRegions.includes(region) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      ภาค{region}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      {Object.keys(filteredData[region]).map(division => {
                        const divisionKey = `${region}-${division}`;
                        return (
                          <div key={divisionKey} className="mt-2">
                            <Collapsible
                              open={expandedDivisions.includes(divisionKey)}
                              onOpenChange={() => toggleDivision(divisionKey)}
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted rounded text-sm">
                                {expandedDivisions.includes(divisionKey) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                เขต {division}
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-6">
                                {filteredData[region][division].map(branch => (
                                  <div key={branch.branch_name} className="flex items-center space-x-2 p-1">
                                    <Checkbox
                                      id={branch.branch_name}
                                      checked={selectedAreas.includes(branch.branch_name)}
                                      onCheckedChange={() => handleBranchToggle(branch.branch_name)}
                                    />
                                    <label
                                      htmlFor={branch.branch_name}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {branch.branch_name}
                                    </label>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}