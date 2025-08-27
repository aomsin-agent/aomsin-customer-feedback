import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface BranchData {
  region: number;
  division: number;
  branch_name: string;
  resdesc: string;
}

interface CascadingAreaFilterProps {
  selectedArea: {
    division?: number;
    region?: number;
    branch?: string;
  };
  onAreaChange: (area: {
    division?: number;
    region?: number;
    branch?: string;
  }) => void;
}

export function CascadingAreaFilter({ selectedArea, onAreaChange }: CascadingAreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [divisions, setDivisions] = useState<number[]>([]);
  const [regions, setRegions] = useState<number[]>([]);
  const [branchNames, setBranchNames] = useState<string[]>([]);

  // Fetch all branch data
  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from('branch_ref')
        .select('region, division, branch_name, resdesc')
        .order('division')
        .order('region')
        .order('branch_name');

      if (error) {
        console.error('Error fetching branches:', error);
        return;
      }

      setBranches(data || []);
      
      // Extract unique divisions
      const uniqueDivisions = [...new Set(data?.map(b => b.division).filter(d => d !== null))].sort();
      setDivisions(uniqueDivisions);
    };

    fetchBranches();
  }, []);

  // Update available regions when division changes
  useEffect(() => {
    if (selectedArea.division) {
      const availableRegions = [...new Set(
        branches
          .filter(b => b.division === selectedArea.division)
          .map(b => b.region)
          .filter(r => r !== null)
      )].sort();
      setRegions(availableRegions);
    } else {
      setRegions([]);
    }
  }, [selectedArea.division, branches]);

  // Update available branches when region changes
  useEffect(() => {
    if (selectedArea.division && selectedArea.region) {
      const availableBranches = branches
        .filter(b => b.division === selectedArea.division && b.region === selectedArea.region)
        .map(b => b.branch_name)
        .sort();
      setBranchNames(availableBranches);
    } else {
      setBranchNames([]);
    }
  }, [selectedArea.division, selectedArea.region, branches]);

  const handleDivisionChange = (value: string) => {
    const division = parseInt(value);
    onAreaChange({
      division,
      region: undefined,
      branch: undefined
    });
  };

  const handleRegionChange = (value: string) => {
    const region = parseInt(value);
    onAreaChange({
      ...selectedArea,
      region,
      branch: undefined
    });
  };

  const handleBranchChange = (value: string) => {
    onAreaChange({
      ...selectedArea,
      branch: value
    });
  };

  const getSelectedText = () => {
    const parts = [];
    if (selectedArea.division) parts.push(`สายกิจ: ${selectedArea.division}`);
    if (selectedArea.region) parts.push(`ภาค: ${selectedArea.region}`);
    if (selectedArea.branch) parts.push(`สาขา: ${selectedArea.branch}`);
    return parts.length > 0 ? parts.join(', ') : 'ยังไม่ได้เลือกพื้นที่';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">พื้นที่ดูแล</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Division Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">สายกิจ</label>
          <Select
            value={selectedArea.division?.toString() || ""}
            onValueChange={handleDivisionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกสายกิจ" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((division) => (
                <SelectItem key={division} value={division.toString()}>
                  สายกิจ {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">ภาค</label>
          <Select
            value={selectedArea.region?.toString() || ""}
            onValueChange={handleRegionChange}
            disabled={!selectedArea.division}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกภาค" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region.toString()}>
                  ภาค {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Branch Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">สาขา</label>
          <Select
            value={selectedArea.branch || ""}
            onValueChange={handleBranchChange}
            disabled={!selectedArea.region}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกสาขา" />
            </SelectTrigger>
            <SelectContent>
              {branchNames.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Summary */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">พื้นที่ที่เลือก:</p>
          <p className="text-sm font-medium">{getSelectedText()}</p>
        </div>
      </CardContent>
    </Card>
  );
}