import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelectDropdown, type DropdownOption } from '@/components/ui/multi-select-dropdown';
import { Button } from '@/components/ui/button';
import { Brush } from 'lucide-react';

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

export interface AreaFilterRef {
  selectAll: () => void;
}

interface HierarchyState {
  selectedDivisions: string[];
  selectedRegions: string[];
  selectedZones: string[];
  selectedBranches: string[];
}

const AreaFilterComponent = forwardRef<AreaFilterRef, AreaFilterProps>(({ selectedAreas, onAreaChange }, ref) => {
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
    const pageSize = 1000;
    let from = 0;
    let to = pageSize - 1;
    let all: BranchData[] = [];
    let total = 0;

    try {
      while (true) {
        const { data, error, count } = await supabase
          .from('branch_ref')
          .select('region, division, branch_name, resdesc', { count: 'exact' })
          .order('division', { ascending: true })
          .order('region', { ascending: true })
          .order('resdesc', { ascending: true })
          .order('branch_name', { ascending: true })
          .range(from, to);

        if (error) {
          console.error('Error fetching branches:', error);
          break;
        }

        total = count ?? total;
        if (data && data.length > 0) {
          all = all.concat(data as BranchData[]);
        }

        if (!data || data.length < pageSize) {
          break;
        }

        from += pageSize;
        to += pageSize;
      }

      console.log('Total branches expected:', total, 'fetched:', all.length);
      setBranches(all);
    } catch (e) {
      console.error('Unexpected error fetching branches:', e);
    }
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
      
      // When selecting divisions, auto-select ALL their children
      const allRegions = new Set<string>();
      const allZones = new Set<string>();
      const allBranches = new Set<string>();

      values.forEach(division => {
        const children = getChildrenOfParent('division', division);
        children.regions?.forEach(r => allRegions.add(r));
        children.zones?.forEach(z => allZones.add(z));
        children.branches?.forEach(b => allBranches.add(b));
      });

      // Keep existing selections that belong to divisions that are STILL selected
      const keepRegions = hierarchyState.selectedRegions.filter(region => {
        const parent = getParentsOfChild('region', region);
        return parent.division && values.includes(parent.division);
      });

      const keepZones = hierarchyState.selectedZones.filter(zone => {
        const parent = getParentsOfChild('zone', zone);
        return parent.division && values.includes(parent.division);
      });

      const keepBranches = hierarchyState.selectedBranches.filter(branch => {
        const parent = getParentsOfChild('branch', branch);
        return parent.division && values.includes(parent.division);
      });

      newState.selectedRegions = [...new Set([...Array.from(allRegions), ...keepRegions])];
      newState.selectedZones = [...new Set([...Array.from(allZones), ...keepZones])];
      newState.selectedBranches = [...new Set([...Array.from(allBranches), ...keepBranches])];
    }

    else if (type === 'regions') {
      newState.selectedRegions = values;
      
      // When selecting regions, auto-select ALL their children
      const allZones = new Set<string>();
      const allBranches = new Set<string>();

      values.forEach(region => {
        const children = getChildrenOfParent('region', region);
        children.zones?.forEach(z => allZones.add(z));
        children.branches?.forEach(b => allBranches.add(b));
      });

      // Keep existing selections that belong to regions that are STILL selected
      const keepZones = hierarchyState.selectedZones.filter(zone => {
        const parent = getParentsOfChild('zone', zone);
        return parent.region && values.includes(parent.region);
      });

      const keepBranches = hierarchyState.selectedBranches.filter(branch => {
        const parent = getParentsOfChild('branch', branch);
        return parent.region && values.includes(parent.region);
      });

      newState.selectedZones = [...new Set([...Array.from(allZones), ...keepZones])];
      newState.selectedBranches = [...new Set([...Array.from(allBranches), ...keepBranches])];

      // Keep existing divisions that still have at least one selected region
      const existingDivisions = hierarchyState.selectedDivisions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        const selectedRegionsInDivision = divisionRegions.filter(region => values.includes(region));
        return selectedRegionsInDivision.length > 0;
      });

      // Add divisions that have ALL their regions selected
      const allDivisionOptions = Array.from(new Set(branches.map(b => b.division?.toString()).filter(Boolean)));
      const fullySelectedDivisions = allDivisionOptions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.length > 0 && divisionRegions.every(region => values.includes(region));
      });

      newState.selectedDivisions = [...new Set([...existingDivisions, ...fullySelectedDivisions])];
    }

    else if (type === 'zones') {
      newState.selectedZones = values;
      
      // When selecting zones, auto-select ALL their children
      const allBranches = new Set<string>();

      values.forEach(zone => {
        const children = getChildrenOfParent('zone', zone);
        children.branches?.forEach(b => allBranches.add(b));
      });

      // Keep existing selections that belong to zones that are STILL selected
      const keepBranches = hierarchyState.selectedBranches.filter(branch => {
        const parent = getParentsOfChild('branch', branch);
        return parent.zone && values.includes(parent.zone);
      });

      newState.selectedBranches = [...new Set([...Array.from(allBranches), ...keepBranches])];

      // Keep existing regions that still have at least one selected zone
      const existingRegions = hierarchyState.selectedRegions.filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        const selectedZonesInRegion = regionZones.filter(zone => values.includes(zone));
        return selectedZonesInRegion.length > 0;
      });

      // Add regions that have ALL their zones selected
      const allRegionOptions = Array.from(new Set(branches.map(b => b.region?.toString()).filter(Boolean)));
      const fullySelectedRegions = allRegionOptions.filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        return regionZones.length > 0 && regionZones.every(zone => values.includes(zone));
      });

      newState.selectedRegions = [...new Set([...existingRegions, ...fullySelectedRegions])];

      // Keep existing divisions that still have at least one selected region
      const existingDivisions = hierarchyState.selectedDivisions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        const selectedRegionsInDivision = divisionRegions.filter(region => newState.selectedRegions.includes(region));
        return selectedRegionsInDivision.length > 0;
      });

      // Add divisions that have ALL their regions selected
      const allDivisionOptions = Array.from(new Set(branches.map(b => b.division?.toString()).filter(Boolean)));
      const fullySelectedDivisions = allDivisionOptions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.length > 0 && divisionRegions.every(region => newState.selectedRegions.includes(region));
      });

      newState.selectedDivisions = [...new Set([...existingDivisions, ...fullySelectedDivisions])];
    }

    else if (type === 'branches') {
      newState.selectedBranches = values;
      
      // Keep existing zones that still have at least one selected branch
      const existingZones = hierarchyState.selectedZones.filter(zone => {
        const zoneBranches = getChildrenOfParent('zone', zone).branches || [];
        const selectedBranchesInZone = zoneBranches.filter(branch => values.includes(branch));
        return selectedBranchesInZone.length > 0;
      });

      // Add zones that have ALL their branches selected
      const allZoneOptions = Array.from(new Set(branches.map(b => b.resdesc).filter(Boolean)));
      const fullySelectedZones = allZoneOptions.filter(zone => {
        const zoneBranches = getChildrenOfParent('zone', zone).branches || [];
        return zoneBranches.length > 0 && zoneBranches.every(branch => values.includes(branch));
      });

      newState.selectedZones = [...new Set([...existingZones, ...fullySelectedZones])];

      // Keep existing regions that still have at least one selected zone
      const existingRegions = hierarchyState.selectedRegions.filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        const selectedZonesInRegion = regionZones.filter(zone => newState.selectedZones.includes(zone));
        return selectedZonesInRegion.length > 0;
      });

      // Add regions that have ALL their zones selected
      const allRegionOptions = Array.from(new Set(branches.map(b => b.region?.toString()).filter(Boolean)));
      const fullySelectedRegions = allRegionOptions.filter(region => {
        const regionZones = getChildrenOfParent('region', region).zones || [];
        return regionZones.length > 0 && regionZones.every(zone => newState.selectedZones.includes(zone));
      });

      newState.selectedRegions = [...new Set([...existingRegions, ...fullySelectedRegions])];

      // Keep existing divisions that still have at least one selected region
      const existingDivisions = hierarchyState.selectedDivisions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        const selectedRegionsInDivision = divisionRegions.filter(region => newState.selectedRegions.includes(region));
        return selectedRegionsInDivision.length > 0;
      });

      // Add divisions that have ALL their regions selected
      const allDivisionOptions = Array.from(new Set(branches.map(b => b.division?.toString()).filter(Boolean)));
      const fullySelectedDivisions = allDivisionOptions.filter(division => {
        const divisionRegions = getChildrenOfParent('division', division).regions || [];
        return divisionRegions.length > 0 && divisionRegions.every(region => newState.selectedRegions.includes(region));
      });

      newState.selectedDivisions = [...new Set([...existingDivisions, ...fullySelectedDivisions])];
    }

    setHierarchyState(newState);
    onAreaChange(newState.selectedBranches);
  }, [hierarchyState, getChildrenOfParent, getParentsOfChild, onAreaChange, branches]);

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

  const handleSelectAll = () => {
    if (branches.length > 0) {
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
    }
  };

  // Expose selectAll method to parent component via ref
  useImperativeHandle(ref, () => ({
    selectAll: handleSelectAll
  }));

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
              className="h-8 px-2"
            >
              <Brush className="h-3 w-3" />
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
            เลือกแล้ว: {selectedDivisionsCount} สายกิจ, {selectedRegionsCount} ภาค, {selectedZonesCount} เขต, {selectedBranchesCount} สาขา
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AreaFilterComponent.displayName = 'AreaFilter';

export const AreaFilter = AreaFilterComponent;