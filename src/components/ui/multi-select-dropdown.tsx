import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
export interface DropdownOption {
  value: string;
  label: string;
  indeterminate?: boolean;
}
interface MultiSelectDropdownProps {
  options: DropdownOption[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  title: string;
  onClear?: () => void;
}
export function MultiSelectDropdown({
  options,
  selectedValues,
  onValueChange,
  placeholder,
  searchPlaceholder,
  title,
  onClear
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleSelectAll = () => {
    const allValues = filteredOptions.map(option => option.value);
    onValueChange(allValues);
  };
  const handleToggleOption = (value: string) => {
    const newSelected = selectedValues.includes(value) ? selectedValues.filter(v => v !== value) : [...selectedValues, value];
    onValueChange(newSelected);
  };
  const selectedCount = selectedValues.length;
  const displayText = selectedCount === 0 ? placeholder : selectedCount === options.length ? "เลือกทั้งหมด" : selectedCount <= 3 ? selectedValues.slice(0, 3).map(value => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }).join(', ') : `เลือก ${selectedCount} รายการ`;
  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-10">
            <span className="truncate text-left">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 z-50 bg-popover border" align="start" sideOffset={4}>
          <div className="p-3 border-b">
            <Input placeholder={searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8" />
          </div>
          <div className="p-2 border-b">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="w-full justify-start h-8">
              <Check className="mr-2 h-4 w-4" />
              เลือกทั้งหมด
            </Button>
          </div>
          <ScrollArea className="h-48">
            <div className="p-2">
              {filteredOptions.map(option => <div key={option.value} className="flex items-center space-x-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer" onClick={() => handleToggleOption(option.value)}>
                  <Checkbox checked={selectedValues.includes(option.value)} ref={ref => {
                if (ref && option.indeterminate) {
                  // Get the actual checkbox input element
                  const checkbox = ref.querySelector('input[type="checkbox"]') as HTMLInputElement;
                  if (checkbox) {
                    checkbox.indeterminate = true;
                  }
                }
              }} onChange={() => {}} />
                  <label className="text-sm cursor-pointer flex-1">
                    {option.label}
                  </label>
                </div>)}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>;
}