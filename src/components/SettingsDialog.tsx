import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Save, Eye, EyeOff } from "lucide-react";

interface ConfigItem {
  id: string;
  label: string;
  value: string;
  isVisible: boolean;
}

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [configs, setConfigs] = useState<ConfigItem[]>([
    { id: "api_endpoint", label: "API Endpoint URL", value: "https://api.example.com/v1", isVisible: true },
    { id: "database_url", label: "Database Connection", value: "postgresql://user:pass@localhost:5432/db", isVisible: false },
    { id: "notification_email", label: "Notification Email", value: "admin@company.com", isVisible: true },
    { id: "backup_interval", label: "Backup Interval (hours)", value: "24", isVisible: true },
    { id: "max_file_size", label: "Max File Size (MB)", value: "100", isVisible: true },
    { id: "session_timeout", label: "Session Timeout (minutes)", value: "60", isVisible: true },
  ]);

  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});

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
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            การจัดการเครื่องมือภายนอก
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full min-h-[500px]">
          <div className="flex-1 p-6 bg-muted/30 rounded-lg overflow-auto">
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                  {/* Label */}
                  <div className="w-48 flex-shrink-0">
                    <label className="text-sm font-medium text-foreground">
                      {config.label}
                    </label>
                  </div>
                  
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
                  
                  {/* Save button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(config.id)}
                    disabled={!isEditing(config.id)}
                    className="min-w-[80px]"
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
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}