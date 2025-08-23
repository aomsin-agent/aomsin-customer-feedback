import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Save, Eye, EyeOff, ExternalLink } from "lucide-react";

interface ConfigItem {
  id: string;
  label: string;
  value: string;
  isVisible: boolean;
}

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [configs, setConfigs] = useState<ConfigItem[]>([
    { id: "link1", label: "Link 1", value: "https://api.example.com/v1", isVisible: true },
    { id: "link2", label: "Link 2", value: "postgresql://user:pass@localhost:5432/db", isVisible: false },
    { id: "link3", label: "Link 3", value: "admin@company.com", isVisible: true },
    { id: "link4", label: "Link 4", value: "24", isVisible: true },
    { id: "link5", label: "Link 5", value: "100", isVisible: true },
    { id: "link6", label: "Link 6", value: "60", isVisible: true },
  ]);

  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({
    link1: "รายละเอียดสำหรับ Link 1",
    link2: "รายละเอียดสำหรับ Link 2", 
    link3: "รายละเอียดสำหรับ Link 3",
    link4: "รายละเอียดสำหรับ Link 4",
    link5: "รายละเอียดสำหรับ Link 5",
    link6: "รายละเอียดสำหรับ Link 6",
  });

  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState("");

  const quickLinks = [
    { label: "เอกสารการใช้งาน", url: "https://docs.example.com" },
    { label: "การตั้งค่าระบบ", url: "https://settings.example.com" },
    { label: "คู่มือการแก้ไขปัญหา", url: "https://support.example.com" },
    { label: "API Reference", url: "https://api.example.com/docs" },
    { label: "ติดต่อสนับสนุน", url: "https://support.example.com/contact" },
    { label: "อัพเดทระบบ", url: "https://updates.example.com" },
  ];

  const handleDescriptionChange = (id: string, value: string) => {
    setDescriptions(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = (id: string) => {
    const newValue = editingValues[id];
    if (newValue !== undefined) {
      setConfigs(prev => 
        prev.map(config => 
          config.id === id ? { ...config, value: newValue } : config
        )
      );
      setEditingValues(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setEditingValues(prev => ({ ...prev, [id]: value }));
  };

  const toggleVisibility = (id: string) => {
    setConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, isVisible: !config.isVisible } : config
      )
    );
  };

  const getDisplayValue = (config: ConfigItem) => {
    if (editingValues[config.id] !== undefined) {
      return editingValues[config.id];
    }
    return config.isVisible ? config.value : "••••••••••••";
  };

  const isEditing = (id: string) => editingValues[id] !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-[95vw] max-h-[90vh] h-[90vh] p-0 m-2 sm:m-6 flex flex-col">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
            การจัดการเครื่องมือภายนอก
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6">
            {/* Configuration Settings */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">การตั้งค่าระบบ</h3>
              {configs.map((config) => (
                <div key={config.id} className="flex flex-col gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg border">
                  {/* Header with Label */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="w-full sm:w-48 sm:flex-shrink-0">
                      <label className="text-sm font-medium text-foreground">
                        {config.label}
                      </label>
                    </div>
                    
                    {/* Input and Controls Container */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:flex-1">
                      {/* Input */}
                      <div className="flex-1">
                        <Input
                          type={config.isVisible || isEditing(config.id) ? "text" : "password"}
                          value={getDisplayValue(config)}
                          onChange={(e) => handleInputChange(config.id, e.target.value)}
                          className="w-full"
                          placeholder={config.label}
                        />
                      </div>
                      
                      {/* Controls Container */}
                      <div className="flex gap-2 sm:gap-4 items-center justify-end sm:justify-start">
                        {/* Save button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(config.id)}
                          disabled={!isEditing(config.id)}
                          className="min-w-[70px] sm:min-w-[80px] text-xs sm:text-sm"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          บันทึก
                        </Button>
                        
                        {/* Visibility toggle */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(config.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          {config.isVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description Input */}
                  <div className="border-t pt-3">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      รายละเอียด
                    </label>
                    <Input
                      type="text"
                      value={descriptions[config.id] || ''}
                      onChange={(e) => handleDescriptionChange(config.id, e.target.value)}
                      className="w-full text-sm"
                      placeholder="เพิ่มรายละเอียดสำหรับลิงก์นี้..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">ลิงก์ด่วน</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 justify-start text-left"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{link.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">บันทึกเพิ่มเติม</h3>
              <Textarea
                placeholder="เพิ่มบันทึกหรือหมายเหตุเกี่ยวกับการตั้งค่าระบบ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Save notes functionality here
                  console.log('Saving notes:', notes);
                }}
                className="self-start"
              >
                <Save className="h-3 w-3 mr-1" />
                บันทึกหมายเหตุ
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}