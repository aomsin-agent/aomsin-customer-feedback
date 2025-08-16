import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { History, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface RawComment {
  comment_id: string;
  date: string;
  time: string;
  division: string | null;
  region: string | null;
  province: string;
  district: string | null;
  branch_name: string;
  service_1: string;
  service_2: string;
  service_3: string;
  service_4: string;
  service_5: string;
  satisfaction_1: number;
  satisfaction_2: number;
  satisfaction_3: number;
  satisfaction_4: number;
  satisfaction_5: number;
  satisfaction_6: number;
  satisfaction_7: number;
  comment: string;
  contact: string | null;
}

interface SentenceCategory {
  sentence: string | null;
  main_category: string;
  sub_category: string;
  sentiment: string;
  comment_id: string;
  sentence_id: string;
  created_at: string;
}

interface CommentData extends RawComment {
  sentences: SentenceCategory[];
}

export function HistoryLog() {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);

  const serviceLabels = [
    "ฝากเงินถอนเงิน",
    "ชำระค่าธรรมเนียม/สินเชื่อ", 
    "สมัครใช้ผลิตภัณฑ์",
    "สอบถาม/ปรึกษา",
    "อื่นๆ"
  ];

  const satisfactionLabels = [
    "การดูแล เอาใจใส่ ความสบายใจเมื่อมาใช้บริการ",
    "การตอบคำถาม ให้คำแนะนำ ความน่าเชื่อถือ ความเป็นมืออาชีพ",
    "ความรวดเร็วในการให้บริการ (หลังเรียกคิว)",
    "ความถูกต้องในการทำธุรกรรม",
    "ความพร้อมของเครื่องมือ",
    "ภาพแวดล้อมของสาขา เช่น การจัดพื้นที่ ความสะอาด แสงสว่าง",
    "ความประทับใจในการเข้าใช้บริการที่ธนาคารออมสินสาขา"
  ];

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Fetch raw comments (latest 5)
      const { data: rawComments } = await supabase
        .from('raw_comment')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(5);

      if (!rawComments) {
        setComments([]);
        return;
      }

      // Fetch sentence categories for these comments
      const commentIds = rawComments.map(c => c.comment_id);
      const { data: sentences } = await supabase
        .from('sentence_category')
        .select('*')
        .in('comment_id', commentIds)
        .order('created_at', { ascending: true });

      // Group sentences by comment_id
      const groupedSentences = sentences?.reduce((acc, sentence) => {
        if (!acc[sentence.comment_id]) {
          acc[sentence.comment_id] = [];
        }
        acc[sentence.comment_id].push(sentence as SentenceCategory);
        return acc;
      }, {} as Record<string, SentenceCategory[]>) || {};

      // Combine data
      const combinedData: CommentData[] = rawComments.map(comment => ({
        comment_id: comment.comment_id,
        date: comment.date,
        time: comment.time,
        division: comment.division,
        region: comment.region,
        province: comment.province,
        district: comment.district,
        branch_name: comment.branch_name,
        service_1: String(comment.service_1),
        service_2: String(comment.service_2),
        service_3: String(comment.service_3),
        service_4: String(comment.service_4),
        service_5: String(comment.service_5),
        satisfaction_1: comment.satisfaction_1,
        satisfaction_2: comment.satisfaction_2,
        satisfaction_3: comment.satisfaction_3,
        satisfaction_4: comment.satisfaction_4,
        satisfaction_5: comment.satisfaction_5,
        satisfaction_6: comment.satisfaction_6,
        satisfaction_7: comment.satisfaction_7,
        comment: comment.comment,
        contact: comment.contact,
        sentences: groupedSentences[comment.comment_id] || []
      }));

      setComments(combinedData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const getSentimentBackground = (sentences: SentenceCategory[]) => {
    const positiveCount = sentences.filter(s => s.sentiment?.toLowerCase() === 'positive').length;
    const negativeCount = sentences.filter(s => s.sentiment?.toLowerCase() === 'negative').length;
    
    if (positiveCount > negativeCount) {
      return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30";
    } else if (negativeCount > positiveCount) {
      return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30";
    }
    return "bg-muted/30 border-muted-foreground/20";
  };

  const getOverallSentiment = (sentences: SentenceCategory[]) => {
    const positiveCount = sentences.filter(s => s.sentiment?.toLowerCase() === 'positive').length;
    const negativeCount = sentences.filter(s => s.sentiment?.toLowerCase() === 'negative').length;
    
    if (positiveCount > negativeCount) {
      return { type: 'positive', label: 'Positive', color: 'text-green-600 dark:text-green-400' };
    } else if (negativeCount > positiveCount) {
      return { type: 'negative', label: 'Negative', color: 'text-red-600 dark:text-red-400' };
    }
    return { type: 'neutral', label: 'Neutral', color: 'text-muted-foreground' };
  };

  const getUsedServices = (comment: RawComment) => {
    const services = [
      { key: 'service_1', label: serviceLabels[0] },
      { key: 'service_2', label: serviceLabels[1] },
      { key: 'service_3', label: serviceLabels[2] },
      { key: 'service_4', label: serviceLabels[3] },
      { key: 'service_5', label: serviceLabels[4] }
    ];
    
    return services.filter(service => comment[service.key as keyof RawComment] === 'Y');
  };

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
      <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-bold text-foreground">
            ประวัติการประมวล Flow ด้วย Agent
          </DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComments}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </DialogHeader>
        
        <ScrollArea className="flex-1 h-[calc(80vh-120px)]">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-2" />
                <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg mb-2">ยังไม่มีประวัติการประมวลผล</p>
                <p className="text-sm">
                  ประวัติการประมวล Flow ด้วย Agent จะแสดงที่นี่เมื่อมีการใช้งาน
                </p>
              </div>
            ) : (
              comments.map((comment) => {
                const overallSentiment = getOverallSentiment(comment.sentences);
                return (
                <Card 
                  key={comment.comment_id} 
                  className={`p-6 ${getSentimentBackground(comment.sentences)} border-2 transition-all duration-300 hover:shadow-lg`}
                >
                  {/* Header with Comment ID and Overall Sentiment */}
                  <div className="mb-4 pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-muted-foreground">
                        ID: {comment.comment_id}
                      </p>
                      <div className={`text-sm font-semibold ${overallSentiment.color}`}>
                        {overallSentiment.label}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* ส่วนที่ 1: เวลาที่ส่งข้อเสนอแนะ */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-foreground">เวลาที่ส่งข้อเสนอแนะ</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>วันที่: {format(new Date(comment.date), 'dd MMMM yyyy', { locale: th })}</p>
                          <p>เวลา: {comment.time}</p>
                        </div>
                      </div>

                      {/* ส่วนที่ 2: พื้นที่ให้บริการ */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-foreground">พื้นที่ให้บริการ</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>สายกิจ: {comment.division || '-'}</p>
                          <p>ภาค: {comment.region || '-'}</p>
                          <p>จังหวัด: {comment.province}</p>
                          <p>เขต: {comment.district || '-'}</p>
                          <p>สาขา: {comment.branch_name}</p>
                        </div>
                      </div>

                      {/* ส่วนที่ 3: ประเภทที่ใช้บริการ */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-foreground">ประเภทที่ใช้บริการ</h4>
                        <div className="flex flex-wrap gap-1">
                          {getUsedServices(comment).map((service, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {service.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* ส่วนที่ 4: ความพึงพอใจ */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-foreground">ความพึงพอใจ</h4>
                        <div className="space-y-1">
                          {satisfactionLabels.map((label, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-muted-foreground flex-1 pr-2">{label}:</span>
                              <span className="font-medium">
                                {comment[`satisfaction_${idx + 1}` as keyof RawComment]}/5
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className={`space-y-6 p-4 rounded-lg ${
                      overallSentiment.type === 'positive' 
                        ? 'bg-green-50/70 dark:bg-green-950/30' 
                        : overallSentiment.type === 'negative' 
                          ? 'bg-red-50/70 dark:bg-red-950/30' 
                          : 'bg-muted/30'
                    }`}>
                      {/* ส่วนที่ 5: ความคิดเห็น */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-foreground">ความคิดเห็น</h4>
                        <div className="text-xs text-muted-foreground bg-background/80 p-3 rounded-lg border">
                          {comment.comment}
                        </div>
                      </div>

                      {/* ส่วนที่ 6: การจำแนกประเภทความคิดเห็น */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-foreground">การจำแนกประเภทความคิดเห็น</h4>
                        <div className="space-y-3">
                          {comment.sentences.length === 0 ? (
                            <p className="text-xs text-muted-foreground">ยังไม่มีการจำแนกประเภท</p>
                          ) : (
                            comment.sentences
                              .sort((a, b) => {
                                // Sort by sentiment: positive first, then negative, then neutral
                                const sentimentOrder = { 'positive': 0, 'negative': 1, 'neutral': 2 };
                                return (sentimentOrder[a.sentiment as keyof typeof sentimentOrder] || 3) - 
                                       (sentimentOrder[b.sentiment as keyof typeof sentimentOrder] || 3);
                              })
                              .map((sentence, idx) => (
                                <div key={idx} className="space-y-1">
                                  {/* Sentiment Badge - First Line */}
                                  <div>
                                    <Badge 
                                      variant={sentence.sentiment === 'positive' ? 'default' : sentence.sentiment === 'negative' ? 'destructive' : 'secondary'} 
                                      className="text-xs font-medium"
                                    >
                                      {sentence.sentiment === 'positive' ? 'Positive' : sentence.sentiment === 'negative' ? 'Negative' : sentence.sentiment}
                                    </Badge>
                                  </div>
                                  
                                  {/* Main Category - Second Line (Header style) */}
                                  <div>
                                    <h5 className="text-xs font-semibold text-foreground">{sentence.main_category}</h5>
                                  </div>
                                  
                                  {/* Sub Category with colored background + Sentence - Third Line */}
                                  <div className={`p-3 rounded-lg border-l-4 text-xs ${
                                    sentence.sentiment === 'positive' 
                                      ? 'bg-green-50 dark:bg-green-950/20 border-l-green-500 border border-green-200 dark:border-green-800/50' 
                                      : sentence.sentiment === 'negative' 
                                        ? 'bg-red-50 dark:bg-red-950/20 border-l-red-500 border border-red-200 dark:border-red-800/50' 
                                        : 'bg-muted/50 border-l-muted-foreground border border-muted-foreground/20'
                                  }`}>
                                    <div className="font-semibold text-foreground mb-1">{sentence.sub_category}</div>
                                    {sentence.sentence && (
                                      <div className="text-muted-foreground leading-relaxed">{sentence.sentence}</div>
                                    )}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}