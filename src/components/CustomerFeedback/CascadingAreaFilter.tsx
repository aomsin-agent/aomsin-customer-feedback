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
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  };
  onAreaChange: (area: {
    region?: number | 'all';
    zone?: string | 'all';
    branch?: string | 'all';
  }) => void;
}

export function CascadingAreaFilter({ selectedArea, onAreaChange }: CascadingAreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [regions, setRegions] = useState<number[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [branchNames, setBranchNames] = useState<string[]>([]);

  // Fetch all branch data
  useEffect(() => {
    const fetchBranches = async () => {
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
      
      // Extract unique regions and sort numerically
      const uniqueRegions = [...new Set(data?.map(b => b.region).filter(r => r !== null))].sort((a, b) => a - b);
      setRegions(uniqueRegions);
    };

    fetchBranches();
  }, []);

  // Update available zones when region changes
  useEffect(() => {
    if (selectedArea.region && selectedArea.region !== 'all') {
      const availableZones = [...new Set(
        branches
          .filter(b => b.region === selectedArea.region)
          .map(b => b.resdesc)
          .filter(z => z !== null)
      )].sort();
      setZones(availableZones);
    } else {
      setZones([]);
    }
  }, [selectedArea.region, branches]);

  // Update available branches when zone changes
  useEffect(() => {
    if (selectedArea.region && selectedArea.region !== 'all' &&
        selectedArea.zone && selectedArea.zone !== 'all') {
      const availableBranches = branches
        .filter(b => 
          b.region === selectedArea.region &&
          b.resdesc === selectedArea.zone
        )
        .map(b => b.branch_name)
        .sort();
      setBranchNames(availableBranches);
    } else {
      setBranchNames([]);
    }
  }, [selectedArea.region, selectedArea.zone, branches]);

  const handleRegionChange = (value: string) => {
    if (value === 'all') {
      onAreaChange({ region: 'all' });
    } else {
      const region = parseInt(value);
      onAreaChange({
        region,
        zone: undefined,
        branch: undefined
      });
    }
  };

  const handleZoneChange = (value: string) => {
    if (value === 'all') {
      onAreaChange({
        ...selectedArea,
        zone: 'all',
        branch: undefined
      });
    } else {
      onAreaChange({
        ...selectedArea,
        zone: value,
        branch: undefined
      });
    }
  };

  const handleBranchChange = (value: string) => {
    if (value === 'all') {
      onAreaChange({
        ...selectedArea,
        branch: 'all'
      });
    } else {
      onAreaChange({
        ...selectedArea,
        branch: value
      });
    }
  };

  const getSelectedText = () => {
    const parts = [];
    if (selectedArea.region && selectedArea.region !== 'all') parts.push(`ภาค ${selectedArea.region}`);
    if (selectedArea.zone && selectedArea.zone !== 'all') parts.push(`เขต ${selectedArea.zone}`);
    if (selectedArea.branch && selectedArea.branch !== 'all') parts.push(`สาขา ${selectedArea.branch}`);
    return parts.length > 0 ? parts.join(', ') : 'เลือกทั้งหมด';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">พื้นที่ดูแล</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 py-6">
        {/* Region Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium min-w-[60px]">ภาค:</label>
          <Select
            value={selectedArea.region === 'all' ? 'all' : selectedArea.region?.toString() || 'all'}
            onValueChange={handleRegionChange}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="เลือกภาค" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">เลือกทั้งหมด</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region.toString()}>
                  ภาค {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium min-w-[60px]">เขต:</label>
          <Select
            value={selectedArea.zone === 'all' ? 'all' : selectedArea.zone || 'all'}
            onValueChange={handleZoneChange}
            disabled={!selectedArea.region || selectedArea.region === 'all'}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="เลือกเขต" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">เลือกทั้งหมด</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Branch Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium min-w-[60px]">สาขา:</label>
          <Select
            value={selectedArea.branch === 'all' ? 'all' : selectedArea.branch || 'all'}
            onValueChange={handleBranchChange}
            disabled={!selectedArea.zone || selectedArea.zone === 'all'}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="เลือกสาขา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">เลือกทั้งหมด</SelectItem>
              {branchNames.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Summary - Simple format like other filters */}
        <div className="mt-auto pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            เลือกแล้ว: <span className="font-medium text-foreground">{getSelectedText()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}