import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

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

interface DropdownOption {
  value: string;
  label: string;
}

function MultiSelectDropdown({ 
  options, 
  selectedValues, 
  onValueChange, 
  placeholder, 
  searchPlaceholder 
}: {
  options: DropdownOption[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const allValues = filteredOptions.map(option => option.value);
    onValueChange(allValues);
  };

  const handleToggleOption = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onValueChange(newSelected);
  };

  const selectedCount = selectedValues.length;
  const displayText = selectedCount === 0 
    ? placeholder 
    : selectedCount === options.length 
      ? "เลือกทั้งหมด" 
      : `เลือกแล้ว ${selectedCount} รายการ`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50 bg-popover border" align="start" sideOffset={4}>
        <div className="p-3 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="w-full justify-start h-8"
          >
            <Check className="mr-2 h-4 w-4" />
            เลือกทั้งหมด
          </Button>
        </div>
        <ScrollArea className="h-48">
          <div className="p-2">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => handleToggleOption(option.value)}
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onChange={() => {}}
                />
                <label className="text-sm cursor-pointer flex-1">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function AreaFilter({ selectedAreas, onAreaChange }: AreaFilterProps) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  useEffect(() => {
    fetchBranches();
  }, []);

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

  // Handle cascading updates
  useEffect(() => {
    // Update regions when divisions change
    const validRegions = selectedRegions.filter(region =>
      regionOptions.some(opt => opt.value === region)
    );
    if (validRegions.length !== selectedRegions.length) {
      setSelectedRegions(validRegions);
    }
  }, [selectedDivisions, regionOptions]);

  useEffect(() => {
    // Update zones when regions change
    const validZones = selectedZones.filter(zone =>
      zoneOptions.some(opt => opt.value === zone)
    );
    if (validZones.length !== selectedZones.length) {
      setSelectedZones(validZones);
    }
  }, [selectedRegions, zoneOptions]);

  useEffect(() => {
    // Update branches when zones change
    const validBranches = selectedAreas.filter(branch =>
      branchOptions.some(opt => opt.value === branch)
    );
    if (validBranches.length !== selectedAreas.length) {
      onAreaChange(validBranches);
    }
  }, [selectedZones, branchOptions]);

  const handleClearAll = () => {
    setSelectedDivisions([]);
    setSelectedRegions([]);
    setSelectedZones([]);
    onAreaChange([]);
  };

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
            />
            
            <MultiSelectDropdown
              options={regionOptions}
              selectedValues={selectedRegions}
              onValueChange={setSelectedRegions}
              placeholder="เลือกภาค"
              searchPlaceholder="ค้นหาภาค..."
            />
            
            <MultiSelectDropdown
              options={zoneOptions}
              selectedValues={selectedZones}
              onValueChange={setSelectedZones}
              placeholder="เลือกเขต"
              searchPlaceholder="ค้นหาเขต..."
            />
            
            <MultiSelectDropdown
              options={branchOptions}
              selectedValues={selectedAreas}
              onValueChange={onAreaChange}
              placeholder="เลือกสาขา"
              searchPlaceholder="ค้นหาสาขา..."
            />
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              ล้างการเลือก
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}