import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";

export function HistoryLog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:text-white hover:bg-white/20 border border-white/30 rounded-lg"
        >
          <History className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            ประวัติการประมวล Flow ด้วย Agent
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full min-h-[400px]">
          <div className="flex-1 p-6 bg-muted/30 rounded-lg">
            <div className="text-center text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-lg mb-2">ยังไม่มีประวัติการประมวลผล</p>
              <p className="text-sm">
                ประวัติการประมวล Flow ด้วย Agent จะแสดงที่นี่เมื่อมีการใช้งาน
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}