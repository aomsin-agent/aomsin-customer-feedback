import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Settings } from 'lucide-react';

interface ServiceTypeFilterProps {
  selectedServiceTypes: string[];
  onServiceTypeChange: (serviceTypes: string[]) => void;
}

export interface ServiceTypeFilterRef {
  selectAll: () => void;
}

const ServiceTypeFilterComponent = forwardRef<ServiceTypeFilterRef, ServiceTypeFilterProps>(
  ({ selectedServiceTypes, onServiceTypeChange }, ref) => {
    const serviceTypes = [
      { value: 'service_1', label: 'เงินฝาก' },
      { value: 'service_2', label: 'ชำระเงิน' },
      { value: 'service_3', label: 'สมัครบริการ' },
      { value: 'service_4', label: 'สอบถาม' },
      { value: 'service_5', label: 'อื่นๆ' },
    ];

    const [initialized, setInitialized] = useState(false);

    // Initialize with all service types selected
    React.useEffect(() => {
      if (!initialized) {
        const allServiceTypes = serviceTypes.map(st => st.value);
        onServiceTypeChange(allServiceTypes);
        setInitialized(true);
      }
    }, [initialized, onServiceTypeChange]);

    useImperativeHandle(ref, () => ({
      selectAll: () => {
        const allServiceTypes = serviceTypes.map(st => st.value);
        onServiceTypeChange(allServiceTypes);
      }
    }));

    const handleServiceTypeChange = (serviceTypes: string[]) => {
      onServiceTypeChange(serviceTypes);
    };

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings size={16} />
            ประเภทการให้บริการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelectDropdown
            options={serviceTypes}
            selectedValues={selectedServiceTypes}
            onValueChange={handleServiceTypeChange}
            placeholder="เลือกประเภทบริการ"
            searchPlaceholder="ค้นหาบริการ"
            title=""
          />
          <div className="mt-2 text-sm text-muted-foreground">
            เลือกแล้ว: {selectedServiceTypes.length} บริการ
          </div>
        </CardContent>
      </Card>
    );
  }
);

ServiceTypeFilterComponent.displayName = 'ServiceTypeFilter';

export const ServiceTypeFilter = ServiceTypeFilterComponent;