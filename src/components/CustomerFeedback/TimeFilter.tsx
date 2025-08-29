import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Brush } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type TimeFilterType = 'all' | 'monthly' | 'lookback' | 'custom';

export interface TimeFilterValue {
  type: TimeFilterType;
  monthYear?: string;
  lookbackDays?: number;
  startDate?: Date;
  endDate?: Date;
}

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue) => void;
}

export interface TimeFilterRef {
  selectAll: () => void;
}

const TimeFilterComponent = forwardRef<TimeFilterRef, TimeFilterProps>(({ value, onChange }, ref) => {
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(value.startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(value.endDate);

  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const currentYear = new Date().getFullYear();
  const buddhist = currentYear + 543;

  const generateMonthYearOptions = () => {
    const options = [];
    for (let year = buddhist; year >= buddhist - 5; year--) {
      for (let month = 0; month < 12; month++) {
        if (year === buddhist && month > new Date().getMonth()) continue;
        options.push({
          value: `${month + 1}-${year - 543}`,
          label: `${months[month]} ${String(year).slice(-2)}`
        });
      }
    }
    return options;
  };

  const lookbackOptions = [
    { value: 1, label: '1 วัน' },
    { value: 7, label: '7 วัน' },
    { value: 14, label: '14 วัน' },
    { value: 30, label: '1 เดือน' },
    { value: 90, label: '3 เดือน' },
    { value: 180, label: '6 เดือน' },
    { value: 365, label: '1 ปี' }
  ];

  const handleTypeChange = (type: TimeFilterType) => {
    let newValue: TimeFilterValue = { type };
    
    if (type === 'all') {
      // No additional properties needed for "all"
    } else if (type === 'monthly') {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      newValue.monthYear = `${currentMonth}-${currentYear}`;
    } else if (type === 'lookback') {
      newValue.lookbackDays = 7;
    } else if (type === 'custom') {
      newValue.startDate = new Date();
      newValue.endDate = new Date();
    }
    
    onChange(newValue);
  };

  const handleMonthYearChange = (monthYear: string) => {
    onChange({ ...value, monthYear });
  };

  const handleLookbackChange = (days: string) => {
    onChange({ ...value, lookbackDays: parseInt(days) });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setTempStartDate(date);
    if (date && tempEndDate) {
      onChange({
        ...value,
        startDate: date,
        endDate: tempEndDate
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setTempEndDate(date);
    if (tempStartDate && date) {
      onChange({
        ...value,
        startDate: tempStartDate,
        endDate: date
      });
    }
  };

  const handleClear = () => {
    onChange({ type: 'all' });
    setTempStartDate(undefined);
    setTempEndDate(undefined);
  };

  const handleSelectAll = () => {
    onChange({ type: 'all' });
    setTempStartDate(undefined);
    setTempEndDate(undefined);
  };

  // Expose selectAll method to parent component via ref
  useImperativeHandle(ref, () => ({
    selectAll: handleSelectAll
  }));

  const getSelectedDisplay = () => {
    const typeLabels = {
      'all': 'ทั้งหมด',
      'monthly': 'ข้อมูลประจำเดือน',
      'lookback': 'ช่วงเวลาย้อนหลัง',
      'custom': 'กำหนดช่วงเวลาเอง'
    };

    const typeLabel = typeLabels[value.type] || '';
    
    if (value.type === 'all') {
      return 'ทั้งหมด';
    }
    if (value.type === 'monthly' && value.monthYear) {
      const [month, year] = value.monthYear.split('-');
      const monthIndex = parseInt(month) - 1;
      const buddhist = parseInt(year) + 543;
      return `${typeLabel}: ${months[monthIndex]} ${String(buddhist).slice(-2)}`;
    }
    if (value.type === 'lookback' && value.lookbackDays) {
      const option = lookbackOptions.find(opt => opt.value === value.lookbackDays);
      return `${typeLabel}: ${option?.label}`;
    }
    if (value.type === 'custom' && value.startDate && value.endDate) {
      return `${typeLabel}: ${format(value.startDate, "dd/MM/yyyy", { locale: th })} - ${format(value.endDate, "dd/MM/yyyy", { locale: th })}`;
    }
    return typeLabel;
  };

  const hasSelection = () => {
    return value.type !== 'all';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ช่วงเวลา</CardTitle>
          {hasSelection() && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2"
            >
              <Brush className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Select value={value.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกประเภทช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="monthly">ข้อมูลประจำเดือน</SelectItem>
              <SelectItem value="lookback">ช่วงเวลาย้อนหลัง</SelectItem>
              <SelectItem value="custom">กำหนดช่วงเวลาเอง</SelectItem>
            </SelectContent>
          </Select>

          {value.type === 'monthly' && (
            <Select value={value.monthYear} onValueChange={handleMonthYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเดือน-ปี" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthYearOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {value.type === 'lookback' && (
            <Select value={value.lookbackDays?.toString()} onValueChange={handleLookbackChange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกช่วงเวลาย้อนหลัง" />
              </SelectTrigger>
              <SelectContent>
                {lookbackOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {value.type === 'custom' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !tempStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempStartDate ? format(tempStartDate, "dd/MM/yyyy", { locale: th }) : "วันเริ่มต้น"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempStartDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !tempEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempEndDate ? format(tempEndDate, "dd/MM/yyyy", { locale: th }) : "วันสิ้นสุด"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-3">
            {getSelectedDisplay()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TimeFilterComponent.displayName = 'TimeFilter';

export const TimeFilter = TimeFilterComponent;