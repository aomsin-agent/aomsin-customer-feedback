import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelectDropdown, type DropdownOption } from '@/components/ui/multi-select-dropdown';

interface BranchData {
  region: string | number;
  division: string | number;
  branch_name: string;
  resdesc: string;
}

interface AreaFilterProps {
  selectedAreas: string[];
  onAreaChange: (areas: string[]) => void;
}

export function AreaFilter({ selectedAreas, onAreaChange }: AreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  // Initialize with all selections when data is loaded
  useEffect(() => {
    if (branches.length > 0 && !initialized) {
      const allDivisions = Array.from(new Set(branches.map(b => b.division?.toString()).filter(Boolean)));
      const allRegions = Array.from(new Set(branches.map(b => b.region?.toString()).filter(Boolean)));
      const allZones = Array.from(new Set(branches.map(b => b.resdesc).filter(Boolean)));
      const allBranches = branches.map(b => b.branch_name);
      
      setSelectedDivisions(allDivisions);
      setSelectedRegions(allRegions);
      setSelectedZones(allZones);
      onAreaChange(allBranches);
      setInitialized(true);
    }
  }, [branches, initialized, onAreaChange]);

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from('branch_ref')
      .select('region, division, branch_name, resdesc')
      .order('division')
      .order('region')
      .order('resdesc')
      .order('branch_name');

    if (error) {
      console.error('Error fetching branches:', error);
      return;
    }

    setBranches(data || []);
  };

  // Get unique options for each dropdown
  const divisionOptions: DropdownOption[] = Array.from(
    new Set(branches.map(b => b.division?.toString()).filter(Boolean))
  ).map(div => ({
    value: div,
    label: `สายกิจ ${div}`
  }));

  const regionOptions: DropdownOption[] = Array.from(
    new Set(
      branches
        .filter(b => selectedDivisions.length === 0 || selectedDivisions.includes(b.division?.toString() || ''))
        .map(b => b.region?.toString())
        .filter(Boolean)
    )
  ).map(region => ({
    value: region,
    label: `ภาค ${region}`
  }));

  const zoneOptions: DropdownOption[] = Array.from(
    new Set(
      branches
        .filter(b => 
          (selectedDivisions.length === 0 || selectedDivisions.includes(b.division?.toString() || '')) &&
          (selectedRegions.length === 0 || selectedRegions.includes(b.region?.toString() || ''))
        )
        .map(b => b.resdesc)
        .filter(Boolean)
    )
  ).map(zone => ({
    value: zone,
    label: zone
  }));

  const branchOptions: DropdownOption[] = branches
    .filter(b => 
      (selectedDivisions.length === 0 || selectedDivisions.includes(b.division?.toString() || '')) &&
      (selectedRegions.length === 0 || selectedRegions.includes(b.region?.toString() || '')) &&
      (selectedZones.length === 0 || selectedZones.includes(b.resdesc || ''))
    )
    .map(b => ({
      value: b.branch_name,
      label: b.branch_name
    }));

  // Handle cascading updates - auto-select child levels when parent is selected
  useEffect(() => {
    if (selectedDivisions.length > 0 && selectedDivisions.length < divisionOptions.length) {
      // Auto-select all regions under selected divisions
      const autoSelectedRegions = Array.from(new Set(
        branches
          .filter(b => selectedDivisions.includes(b.division?.toString() || ''))
          .map(b => b.region?.toString())
          .filter(Boolean)
      ));
      setSelectedRegions(autoSelectedRegions);
    } else if (selectedDivisions.length === 0) {
      setSelectedRegions([]);
    }
  }, [selectedDivisions, branches]);

  useEffect(() => {
    if (selectedRegions.length > 0 && selectedRegions.length < regionOptions.length) {
      // Auto-select all zones under selected regions
      const autoSelectedZones = Array.from(new Set(
        branches
          .filter(b => 
            (selectedDivisions.length === 0 || selectedDivisions.includes(b.division?.toString() || '')) &&
            selectedRegions.includes(b.region?.toString() || '')
          )
          .map(b => b.resdesc)
          .filter(Boolean)
      ));
      setSelectedZones(autoSelectedZones);
    } else if (selectedRegions.length === 0) {
      setSelectedZones([]);
    }
  }, [selectedRegions, branches, selectedDivisions]);

  useEffect(() => {
    if (selectedZones.length > 0 && selectedZones.length < zoneOptions.length) {
      // Auto-select all branches under selected zones
      const autoSelectedBranches = branches
        .filter(b => 
          (selectedDivisions.length === 0 || selectedDivisions.includes(b.division?.toString() || '')) &&
          (selectedRegions.length === 0 || selectedRegions.includes(b.region?.toString() || '')) &&
          selectedZones.includes(b.resdesc || '')
        )
        .map(b => b.branch_name);
      onAreaChange(autoSelectedBranches);
    } else if (selectedZones.length === 0) {
      onAreaChange([]);
    }
  }, [selectedZones, branches, selectedDivisions, selectedRegions, onAreaChange]);

  const handleClearAll = () => {
    setSelectedDivisions([]);
    setSelectedRegions([]);
    setSelectedZones([]);
    onAreaChange([]);
  };

  // Calculate summary counts
  const selectedDivisionsCount = selectedDivisions.length;
  const selectedRegionsCount = selectedRegions.length;
  const selectedZonesCount = selectedZones.length;
  const selectedBranchesCount = selectedAreas.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">พื้นที่ดูแล</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MultiSelectDropdown
              options={divisionOptions}
              selectedValues={selectedDivisions}
              onValueChange={setSelectedDivisions}
              placeholder="เลือกสายกิจ"
              searchPlaceholder="ค้นหาสายกิจ..."
              title="สายกิจ"
              onClear={() => setSelectedDivisions([])}
            />
            
            <MultiSelectDropdown
              options={regionOptions}
              selectedValues={selectedRegions}
              onValueChange={setSelectedRegions}
              placeholder="เลือกภาค"
              searchPlaceholder="ค้นหาภาค..."
              title="ภาค"
              onClear={() => setSelectedRegions([])}
            />
            
            <MultiSelectDropdown
              options={zoneOptions}
              selectedValues={selectedZones}
              onValueChange={setSelectedZones}
              placeholder="เลือกเขต"
              searchPlaceholder="ค้นหาเขต..."
              title="เขต"
              onClear={() => setSelectedZones([])}
            />
            
            <MultiSelectDropdown
              options={branchOptions}
              selectedValues={selectedAreas}
              onValueChange={onAreaChange}
              placeholder="เลือกสาขา"
              searchPlaceholder="ค้นหาสาขา..."
              title="สาขา"
              onClear={() => onAreaChange([])}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedDivisionsCount === divisionOptions.length && selectedRegionsCount === regionOptions.length && 
             selectedZonesCount === zoneOptions.length && selectedBranchesCount === branchOptions.length
              ? "เลือกทั้งหมด"
              : `เลือกแล้ว: ${selectedDivisionsCount} สายกิจ, ${selectedRegionsCount} ภาค, ${selectedZonesCount} เขต, ${selectedBranchesCount} สาขา`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}