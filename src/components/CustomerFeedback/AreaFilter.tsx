import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelectDropdown, type DropdownOption } from '@/components/ui/multi-select-dropdown';
import { Button } from '@/components/ui/button';
import { PaintBucket } from 'lucide-react';

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

interface HierarchyState {
  selectedDivisions: string[];
  selectedRegions: string[];
  selectedZones: string[];
  selectedBranches: string[];
}

export function AreaFilter({ selectedAreas, onAreaChange }: AreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [hierarchyState, setHierarchyState] = useState<HierarchyState>({
    selectedDivisions: [],
    selectedRegions: [],
    selectedZones: [],
    selectedBranches: []
  });
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
      
      setHierarchyState({
        selectedDivisions: allDivisions,
        selectedRegions: allRegions,
        selectedZones: allZones,
        selectedBranches: allBranches
      });
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

  // Helper functions for hierarchical relationships
  const getChildrenOfParent = useCallback((parentType: string, parentValue: string) => {
    switch (parentType) {
      case 'division':
        return {
          regions: Array.from(new Set(branches.filter(b => b.division?.toString() === parentValue).map(b => b.region?.toString()).filter(Boolean))),
          zones: Array.from(new Set(branches.filter(b => b.division?.toString() === parentValue).map(b => b.resdesc).filter(Boolean))),
          branches: branches.filter(b => b.division?.toString() === parentValue).map(b => b.branch_name)
        };
      case 'region':
        return {
          zones: Array.from(new Set(branches.filter(b => b.region?.toString() === parentValue).map(b => b.resdesc).filter(Boolean))),
          branches: branches.filter(b => b.region?.toString() === parentValue).map(b => b.branch_name)
        };
      case 'zone':
        return {
          branches: branches.filter(b => b.resdesc === parentValue).map(b => b.branch_name)
        };
      default:
        return {};
    }
  }, [branches]);

  const getParentsOfChild = useCallback((childType: string, childValue: string) => {
    const branch = branches.find(b => {
      if (childType === 'branch') return b.branch_name === childValue;
      if (childType === 'zone') return b.resdesc === childValue;
      if (childType === 'region') return b.region?.toString() === childValue;
      return false;
    });

    if (!branch) return {};

    return {
      division: branch.division?.toString(),
      region: branch.region?.toString(),
      zone: branch.resdesc,
      branch: branch.branch_name
    };
  }, [branches]);

  // Main cascading selection logic
  const updateHierarchy = useCallback((type: string, values: string[]) => {
    const newState = { ...hierarchyState };

    if (type === 'divisions') {
      newState.selectedDivisions = values;
      
      // Get all children for selected divisions
      const allRegions = new Set<string>();
      const allZones = new Set<string>();
      const allBranches = new Set<string>();

      values.forEach(division => {
        const children = getChildrenOfParent('division', division);
        children.regions?.forEach(r => allRegions.add(r));
        children.zones?.forEach(z => allZones.add(z));
        children.branches?.forEach(b => allBranches.add(b));
      });

      if (values.length === 0) {
        // If no divisions selected, clear everything
        newState.selectedRegions = [];
        newState.selectedZones = [];
        newState.selectedBranches = [];
      } else {
        // Update child selections
        newState.selectedRegions = Array.from(allRegions);
        newState.selectedZones = Array.from(allZones);
        newState.selectedBranches = Array.from(allBranches);
      }
    }

    else if (type === 'regions') {
      newState.selectedRegions = values;
      
      // Update divisions based on selected regions
      const affectedDivisions = new Set<string>();
      const allZones = new Set<string>();
      const allBranches = new Set<string>();

      values.forEach(region => {
        const parent = getParentsOfChild('region', region);
        if (parent.division) affectedDivisions.add(parent.division);
        
        const children = getChildrenOfParent('region', region);
        children.zones?.forEach(z => allZones.add(z));
        children.branches?.forEach(b => allBranches.add(b));
      });

      // Update divisions - keep only those that have all their regions selected
      const newDivisions = Array.from(affectedDivisions).filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.every(region => values.includes(region));
      });

      newState.selectedDivisions = newDivisions;
      
      if (values.length === 0) {
        newState.selectedZones = [];
        newState.selectedBranches = [];
      } else {
        newState.selectedZones = Array.from(allZones);
        newState.selectedBranches = Array.from(allBranches);
      }
    }

    else if (type === 'zones') {
      newState.selectedZones = values;
      
      // Update regions and divisions based on selected zones
      const affectedRegions = new Set<string>();
      const affectedDivisions = new Set<string>();
      const allBranches = new Set<string>();

      values.forEach(zone => {
        const parent = getParentsOfChild('zone', zone);
        if (parent.region) affectedRegions.add(parent.region);
        if (parent.division) affectedDivisions.add(parent.division);
        
        const children = getChildrenOfParent('zone', zone);
        children.branches?.forEach(b => allBranches.add(b));
      });

      // Update regions - keep only those that have all their zones selected
      const newRegions = Array.from(affectedRegions).filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        return regionZones.every(zone => values.includes(zone));
      });

      // Update divisions - keep only those that have all their regions selected
      const newDivisions = Array.from(affectedDivisions).filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.every(region => newRegions.includes(region));
      });

      newState.selectedRegions = newRegions;
      newState.selectedDivisions = newDivisions;
      
      if (values.length === 0) {
        newState.selectedBranches = [];
      } else {
        newState.selectedBranches = Array.from(allBranches);
      }
    }

    else if (type === 'branches') {
      newState.selectedBranches = values;
      
      // Update zones, regions, and divisions based on selected branches
      const affectedZones = new Set<string>();
      const affectedRegions = new Set<string>();
      const affectedDivisions = new Set<string>();

      values.forEach(branch => {
        const parent = getParentsOfChild('branch', branch);
        if (parent.zone) affectedZones.add(parent.zone);
        if (parent.region) affectedRegions.add(parent.region);
        if (parent.division) affectedDivisions.add(parent.division);
      });

      // Update zones - keep only those that have all their branches selected
      const newZones = Array.from(affectedZones).filter(zone => {
        const zoneBranches = getChildrenOfParent('zone', zone).branches || [];
        return zoneBranches.every(branch => values.includes(branch));
      });

      // Update regions - keep only those that have all their zones selected
      const newRegions = Array.from(affectedRegions).filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        return regionZones.every(zone => newZones.includes(zone));
      });

      // Update divisions - keep only those that have all their regions selected  
      const newDivisions = Array.from(affectedDivisions).filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.every(region => newRegions.includes(region));
      });

      newState.selectedZones = newZones;
      newState.selectedRegions = newRegions;
      newState.selectedDivisions = newDivisions;
    }

    setHierarchyState(newState);
    onAreaChange(newState.selectedBranches);
  }, [hierarchyState, getChildrenOfParent, getParentsOfChild, onAreaChange]);

  // Generate options with indeterminate states
  const divisionOptions: DropdownOption[] = Array.from(
    new Set(branches.map(b => b.division?.toString()).filter(Boolean))
  ).map(div => {
    const children = getChildrenOfParent('division', div);
    const allRegions = children.regions || [];
    const selectedRegions = allRegions.filter(r => hierarchyState.selectedRegions.includes(r));
    const isIndeterminate = selectedRegions.length > 0 && selectedRegions.length < allRegions.length;
    
    return {
      value: div,
      label: `สายกิจ ${div}`,
      indeterminate: isIndeterminate
    };
  });

  const regionOptions: DropdownOption[] = Array.from(
    new Set(branches.map(b => b.region?.toString()).filter(Boolean))
  ).map(region => {
    const children = getChildrenOfParent('region', region);
    const allZones = children.zones || [];
    const selectedZones = allZones.filter(z => hierarchyState.selectedZones.includes(z));
    const isIndeterminate = selectedZones.length > 0 && selectedZones.length < allZones.length;
    
    return {
      value: region,
      label: `ภาค ${region}`,
      indeterminate: isIndeterminate
    };
  });

  const zoneOptions: DropdownOption[] = Array.from(
    new Set(branches.map(b => b.resdesc).filter(Boolean))
  ).map(zone => {
    const children = getChildrenOfParent('zone', zone);
    const allBranches = children.branches || [];
    const selectedBranches = allBranches.filter(b => hierarchyState.selectedBranches.includes(b));
    const isIndeterminate = selectedBranches.length > 0 && selectedBranches.length < allBranches.length;
    
    return {
      value: zone,
      label: zone,
      indeterminate: isIndeterminate
    };
  });

  const branchOptions: DropdownOption[] = branches.map(b => ({
    value: b.branch_name,
    label: b.branch_name
  }));

  const handleClearAll = () => {
    const emptyState = {
      selectedDivisions: [],
      selectedRegions: [],
      selectedZones: [],
      selectedBranches: []
    };
    setHierarchyState(emptyState);
    onAreaChange([]);
  };

  // Calculate summary counts
  const selectedDivisionsCount = hierarchyState.selectedDivisions.length;
  const selectedRegionsCount = hierarchyState.selectedRegions.length;
  const selectedZonesCount = hierarchyState.selectedZones.length;
  const selectedBranchesCount = hierarchyState.selectedBranches.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">พื้นที่ดูแล</CardTitle>
          {(selectedDivisionsCount > 0 || selectedRegionsCount > 0 || selectedZonesCount > 0 || selectedBranchesCount > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-3 text-xs"
            >
              <PaintBucket className="h-3 w-3 mr-1" />
              ล้าง
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MultiSelectDropdown
              options={divisionOptions}
              selectedValues={hierarchyState.selectedDivisions}
              onValueChange={(values) => updateHierarchy('divisions', values)}
              placeholder="เลือกสายกิจ"
              searchPlaceholder="ค้นหาสายกิจ..."
              title="สายกิจ"
              onClear={() => updateHierarchy('divisions', [])}
            />
            
            <MultiSelectDropdown
              options={regionOptions}
              selectedValues={hierarchyState.selectedRegions}
              onValueChange={(values) => updateHierarchy('regions', values)}
              placeholder="เลือกภาค"
              searchPlaceholder="ค้นหาภาค..."
              title="ภาค"
              onClear={() => updateHierarchy('regions', [])}
            />
            
            <MultiSelectDropdown
              options={zoneOptions}
              selectedValues={hierarchyState.selectedZones}
              onValueChange={(values) => updateHierarchy('zones', values)}
              placeholder="เลือกเขต"
              searchPlaceholder="ค้นหาเขต..."
              title="เขต"
              onClear={() => updateHierarchy('zones', [])}
            />
            
            <MultiSelectDropdown
              options={branchOptions}
              selectedValues={hierarchyState.selectedBranches}
              onValueChange={(values) => updateHierarchy('branches', values)}
              placeholder="เลือกสาขา"
              searchPlaceholder="ค้นหาสาขา..."
              title="สาขา"
              onClear={() => updateHierarchy('branches', [])}
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