import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      // Build base query for raw_comment
      let query = supabase
        .from('raw_comment')
        .select(`
          comment_id,
          comment,
          comment_date,
          region,
          district,
          branch_name
        `);

      // Apply area filter
      if (selectedAreas.length > 0) {
        query = query.in('branch_name', selectedAreas);
      }

      // Apply time filter
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

      const { data: rawComments, error: commentsError } = await query
        .order('comment_date', { ascending: false })
        .limit(100);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return;
      }

      if (!rawComments?.length) {
        setComments([]);
        setTotalCount(0);
        return;
      }

      // Get comment IDs
      const commentIds = rawComments.map(c => c.comment_id);

      // Fetch sentence categories for these comments
      let categoriesQuery = supabase
        .from('sentence_category')
        .select('comment_id, sub_category, sentiment')
        .in('comment_id', commentIds);

      // Apply category filter
      if (selectedCategories.length > 0) {
        categoriesQuery = categoriesQuery.in('sub_category', selectedCategories);
      }

      const { data: sentenceCategories, error: categoriesError } = await categoriesQuery;

      if (categoriesError) {
        console.error('Error fetching sentence categories:', categoriesError);
        return;
      }

      // Group categories by comment_id
      const categoriesByComment = sentenceCategories?.reduce((acc, category) => {
        if (!acc[category.comment_id]) {
          acc[category.comment_id] = [];
        }
        acc[category.comment_id].push({
          sub_category: category.sub_category,
          sentiment: category.sentiment
        });
        return acc;
      }, {} as Record<string, { sub_category: string; sentiment: string }[]>) || {};

      // Combine comments with categories and apply sentiment filter
      const combinedComments = rawComments
        .map(comment => ({
          ...comment,
          categories: categoriesByComment[comment.comment_id] || []
        }))
        .filter(comment => {
          // Apply sentiment filter
          if (sentimentFilter === 'all') return true;
          
          const hasPositive = comment.categories.some(cat => cat.sentiment === 'เชิงบวก');
          const hasNegative = comment.categories.some(cat => cat.sentiment === 'เชิงลบ');
          
          if (sentimentFilter === 'positive') return hasPositive;
          if (sentimentFilter === 'negative') return hasNegative;
          
          return true;
        })
        .filter(comment => {
          // If category filter is applied, only show comments that have matching categories
          if (selectedCategories.length > 0) {
            return comment.categories.length > 0;
          }
          return true;
        });

      setComments(combinedComments);
      setTotalCount(combinedComments.length);
    } catch (error) {
      console.error('Error in fetchComments:', error);
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">ความคิดเห็นลูกค้า</CardTitle>
          <Select value={sentimentFilter} onValueChange={onSentimentFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="positive">เชิงบวก</SelectItem>
              <SelectItem value="negative">เชิงลบ</SelectItem>
            </SelectContent>
          </Select>
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