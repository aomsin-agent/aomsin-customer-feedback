import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type SentimentFilter = 'all' | 'positive' | 'negative';

interface CommentData {
  comment_id: string;
  comment: string;
  comment_date: string;
  region: string;
  district: string;
  branch_name: string;
  categories: {
    sub_category: string;
    sentiment: string;
  }[];
}

interface CommentsListProps {
  selectedAreas: string[];
  selectedCategories: string[];
  timeFilter: any;
  sentimentFilter: SentimentFilter;
  onSentimentFilterChange: (filter: SentimentFilter) => void;
}

export function CommentsList({
  selectedAreas,
  selectedCategories,
  timeFilter,
  sentimentFilter,
  onSentimentFilterChange
}: CommentsListProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [selectedAreas, selectedCategories, timeFilter, sentimentFilter]);

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      // Single query with nested categories to avoid very long URL from `.in` filter
      let query = supabase
        .from('raw_comment')
        .select(`
          comment_id,
          comment,
          comment_date,
          region,
          district,
          branch_name,
          sentence_category ( sub_category, sentiment )
        `);

      // Apply area filter (AND scope)
      if (selectedAreas.length > 0) {
        query = query.in('branch_name', selectedAreas);
      }

      // Apply time filter (AND scope)
      if (timeFilter.type === 'monthly' && timeFilter.monthYear) {
        const [month, year] = timeFilter.monthYear.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        query = query.gte('comment_date', startDate.toISOString())
                    .lte('comment_date', endDate.toISOString());
      } else if (timeFilter.type === 'lookback' && timeFilter.lookbackDays) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeFilter.lookbackDays);
        query = query.gte('comment_date', startDate.toISOString())
                    .lte('comment_date', endDate.toISOString());
      } else if (timeFilter.type === 'custom' && timeFilter.startDate && timeFilter.endDate) {
        query = query.gte('comment_date', timeFilter.startDate.toISOString())
                    .lte('comment_date', timeFilter.endDate.toISOString());
      }

      const { data: rows, error } = await query
        .order('comment_date', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
        setTotalCount(0);
        return;
      }

      const mapped = (rows || []).map((r: any) => ({
        comment_id: r.comment_id,
        comment: r.comment,
        comment_date: r.comment_date,
        region: r.region,
        district: r.district,
        branch_name: r.branch_name,
        categories: (r.sentence_category || []).map((c: any) => ({
          sub_category: c.sub_category,
          sentiment: c.sentiment,
        }))
      })) as CommentData[];

      // If category filter is applied: include comments having at least ONE selected category,
      // but keep ALL categories displayed for that comment
      const byCategory = selectedCategories.length > 0
        ? mapped.filter(cm => cm.categories.some(cat => selectedCategories.includes(cat.sub_category)))
        : mapped;

      // Apply sentiment filter
      const filtered = byCategory.filter(comment => {
        if (sentimentFilter === 'all') return true;
        const hasPositive = comment.categories.some(cat => cat.sentiment === 'เชิงบวก');
        const hasNegative = comment.categories.some(cat => cat.sentiment === 'เชิงลบ');
        if (sentimentFilter === 'positive') return hasPositive;
        if (sentimentFilter === 'negative') return hasNegative;
        return true;
      });

      setComments(filtered);
      setTotalCount(filtered.length);
    } catch (err) {
      console.error('Error in fetchComments:', err);
      setComments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getCommentBackgroundClass = (categories: { sentiment: string }[]) => {
    if (categories.length === 0) return 'bg-background';
    
    const hasPositive = categories.some(cat => cat.sentiment === 'เชิงบวก');
    const hasNegative = categories.some(cat => cat.sentiment === 'เชิงลบ');
    
    if (hasPositive && hasNegative) return 'bg-yellow-50 dark:bg-yellow-950/20';
    if (hasPositive) return 'bg-green-50 dark:bg-green-950/20';
    if (hasNegative) return 'bg-red-50 dark:bg-red-950/20';
    
    return 'bg-background';
  };

  const getSentimentBadgeClass = (sentiment: string) => {
    switch (sentiment) {
      case 'เชิงบวก':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'เชิงลบ':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">ความคิดเห็นลูกค้า</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={sentimentFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSentimentFilterChange('all')}
              className={cn(
                "text-sm px-3 py-1.5",
                sentimentFilter === 'all' 
                  ? 'bg-black text-white hover:bg-black/90'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              )}
            >
              ทั้งหมด
            </Button>
            <Button
              variant={sentimentFilter === 'positive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSentimentFilterChange('positive')}
              className={cn(
                "text-sm px-3 py-1.5",
                sentimentFilter === 'positive' 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              )}
            >
              เชิงบวก
            </Button>
            <Button
              variant={sentimentFilter === 'negative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSentimentFilterChange('negative')}
              className={cn(
                "text-sm px-3 py-1.5",
                sentimentFilter === 'negative' 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              )}
            >
              เชิงลบ
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          พบความคิดเห็น {totalCount.toLocaleString()} รายการ
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                ไม่พบความคิดเห็น
              </h3>
              <p className="text-sm text-muted-foreground">
                ลองปรับเปลี่ยนตัวกรองเพื่อค้นหาความคิดเห็นที่ต้องการ
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className={cn(
                    "p-4 rounded-lg border space-y-3",
                    getCommentBackgroundClass(comment.categories)
                  )}
                >
                  {/* Header with location and date */}
                  <div className="flex justify-between items-start text-sm text-muted-foreground">
                    <div>
                      ภาค{comment.region} • เขต {comment.district} • {comment.branch_name}
                    </div>
                    <div>
                      {format(new Date(comment.comment_date), 'dd MMM yyyy HH:mm', { locale: th })}
                    </div>
                  </div>
                  
                  {/* Comment text */}
                  <div className="text-foreground">
                    {comment.comment}
                  </div>
                  
                  {/* Categories badges */}
                  {comment.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {comment.categories.map((category, index) => (
                        <Badge
                          key={index}
                          className={getSentimentBadgeClass(category.sentiment)}
                        >
                          {category.sub_category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}