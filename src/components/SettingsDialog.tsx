import { useState, useEffect } from "react";
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
import { Settings, Save, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LinkItem {
  id: number;
  topic: string;
  linked: string;
  description: string;
  update_at: string;
}

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [editingLinks, setEditingLinks] = useState<{ [key: number]: { topic: string; linked: string; description: string } }>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('link_ref')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลลิงก์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (link: LinkItem) => {
    setEditingLinks(prev => ({
      ...prev,
      [link.id]: {
        topic: link.topic,
        linked: link.linked,
        description: link.description,
      }
    }));
  };

  const handleEditChange = (linkId: number, field: keyof Pick<LinkItem, 'topic' | 'linked' | 'description'>, value: string) => {
    setEditingLinks(prev => ({
      ...prev,
      [linkId]: {
        ...prev[linkId],
        [field]: value,
      }
    }));
  };

  const handleSave = async (linkId: number) => {
    const editData = editingLinks[linkId];
    if (!editData) return;

    try {
      const { error } = await supabase
        .from('link_ref')
        .update({
          topic: editData.topic,
          linked: editData.linked,
          description: editData.description,
          update_at: new Date().toISOString(),
        })
        .eq('id', linkId);

      if (error) throw error;

      // Update local state
      setLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { ...link, ...editData, update_at: new Date().toISOString() }
          : link
      ));

      // Remove from editing state
      setEditingLinks(prev => {
        const { [linkId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัพเดทข้อมูลลิงก์เรียบร้อยแล้ว",
      });

    } catch (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = (linkId: number) => {
    setEditingLinks(prev => {
      const { [linkId]: _, ...rest } = prev;
      return rest;
    });
  };

  const isEditing = (linkId: number) => linkId in editingLinks;

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
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] h-[85vh] p-0 mx-auto flex flex-col">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
            การจัดการเครื่องมือภายนอก
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 sm:p-6 touch-pan-y">
          <div className="space-y-6">
            {/* Links Management */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">ลิงก์ภายนอก</h3>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="p-3 sm:p-4 bg-muted/30 rounded-lg border">
                    {isEditing(link.id) ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">หัวข้อ</label>
                            <Input
                              value={editingLinks[link.id]?.topic || ''}
                              onChange={(e) => handleEditChange(link.id, 'topic', e.target.value)}
                              className="w-full"
                              placeholder="หัวข้อ"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">ลิงก์</label>
                            <Input
                              value={editingLinks[link.id]?.linked || ''}
                              onChange={(e) => handleEditChange(link.id, 'linked', e.target.value)}
                              className="w-full"
                              placeholder="URL"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">รายละเอียด</label>
                            <Input
                              value={editingLinks[link.id]?.description || ''}
                              onChange={(e) => handleEditChange(link.id, 'description', e.target.value)}
                              className="w-full"
                              placeholder="รายละเอียด"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEdit(link.id)}
                            className="text-xs sm:text-sm"
                          >
                            ยกเลิก
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSave(link.id)}
                            className="text-xs sm:text-sm"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            บันทึก
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 lg:items-center">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">หัวข้อ</div>
                            <div className="font-medium text-sm">{link.topic}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">ลิงก์</div>
                            <div className="text-sm truncate text-blue-600 hover:text-blue-800">
                              <a href={link.linked} target="_blank" rel="noopener noreferrer" className="underline">
                                {link.linked}
                              </a>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">รายละเอียด</div>
                            <div className="text-sm text-muted-foreground">{link.description}</div>
                          </div>
                          <div className="flex items-center justify-between lg:justify-end gap-2">
                            <div className="lg:hidden">
                              <div className="text-xs text-muted-foreground">อัพเดท: {new Date(link.update_at).toLocaleDateString('th-TH')}</div>
                            </div>
                            <div className="hidden lg:block text-xs text-muted-foreground">
                              อัพเดท: {new Date(link.update_at).toLocaleDateString('th-TH')}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(link)}
                              className="h-8 px-3 text-xs"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              แก้ไข
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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