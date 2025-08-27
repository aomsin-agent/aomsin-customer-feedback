import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type SevereSentimentFilter = 'all' | 'positive' | 'negative';

interface SevereCommentData {
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

interface SevereCommentsListProps {
  selectedAreas: string[];
  selectedCategories: string[];
  timeFilter: any;
  sentimentFilter: SevereSentimentFilter;
  onSentimentFilterChange: (filter: SevereSentimentFilter) => void;
}

export function SevereCommentsList({
  selectedAreas,
  selectedCategories,
  timeFilter,
  sentimentFilter,
  onSentimentFilterChange
}: SevereCommentsListProps) {
  const [severeComments, setSevereComments] = useState<SevereCommentData[]>([]);
  const [severeLoading, setSevereLoading] = useState(true);
  const [severeTotalCount, setSevereTotalCount] = useState(0);

  useEffect(() => {
    fetchSevereComments();
  }, [selectedAreas, selectedCategories, timeFilter, sentimentFilter]);

  const fetchSevereComments = async () => {
    setSevereLoading(true);
    
    try {
      // หากไม่มีการเลือกพื้นที่เลย ให้แสดงผลว่าง (scope ว่าง)
      if (selectedAreas.length === 0) {
        setSevereComments([]);
        setSevereTotalCount(0);
        setSevereLoading(false);
        return;
      }

      // Step 1: Get raw comments with basic filters (avoid long URL)
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

      // Apply time filter first (more selective)
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

      const { data: rawSevereComments, error: severeCommentsError } = await query
        .order('comment_date', { ascending: false })
        .limit(500);

      if (severeCommentsError) {
        console.error('Error fetching severe comments:', severeCommentsError);
        setSevereComments([]);
        setSevereTotalCount(0);
        return;
      }

      if (!rawSevereComments?.length) {
        setSevereComments([]);
        setSevereTotalCount(0);
        return;
      }

      // Step 2: Filter by selected areas (client-side to avoid URL length issue)
      const severeFilteredByArea = rawSevereComments.filter(comment => 
        selectedAreas.includes(comment.branch_name)
      );

      if (severeFilteredByArea.length === 0) {
        setSevereComments([]);
        setSevereTotalCount(0);
        return;
      }

      // Step 3: Get sentence categories in batches to avoid URL length
      const severeCommentIds = severeFilteredByArea.map(c => c.comment_id);
      let severeAllCategories: any[] = [];
      
      // Process in batches of 50 to avoid URL length issues
      for (let i = 0; i < severeCommentIds.length; i += 50) {
        const severeBatch = severeCommentIds.slice(i, i + 50);
        const { data: severeBatchCategories, error: severeCategoryError } = await supabase
          .from('sentence_category')
          .select('comment_id, sub_category, sentiment')
          .in('comment_id', severeBatch);
        
        if (severeCategoryError) {
          console.error('Error fetching severe categories batch:', severeCategoryError);
          continue;
        }
        
        if (severeBatchCategories) {
          severeAllCategories = severeAllCategories.concat(severeBatchCategories);
        }
      }

      // Step 4: Combine data
      const severeCategoriesByComment = severeAllCategories.reduce((acc, category) => {
        if (!acc[category.comment_id]) {
          acc[category.comment_id] = [];
        }
        acc[category.comment_id].push({
          sub_category: category.sub_category,
          sentiment: category.sentiment
        });
        return acc;
      }, {} as Record<string, { sub_category: string; sentiment: string }[]>);

      const severeMapped = severeFilteredByArea.map(comment => ({
        ...comment,
        categories: severeCategoriesByComment[comment.comment_id] || []
      }));

      // Determine if the selected categories effectively mean "all" for the current dataset
      const severeUniqueSubcategoriesInData = new Set<string>();
      severeMapped.forEach(cm => cm.categories.forEach(cat => severeUniqueSubcategoriesInData.add(cat.sub_category)));
      const severeIsAllSubcategoriesSelectedInData =
        severeUniqueSubcategoriesInData.size > 0 &&
        Array.from(severeUniqueSubcategoriesInData).every(sc => selectedCategories.includes(sc));

      const severeByCategory = selectedCategories.length > 0 && !severeIsAllSubcategoriesSelectedInData
        ? severeMapped.filter(cm => cm.categories.some(cat => selectedCategories.includes(cat.sub_category)))
        : severeMapped;

      // Apply sentiment filter
      const severeFiltered = severeByCategory.filter(comment => {
        if (sentimentFilter === 'all') return true;
        const hasPositive = comment.categories.some(cat => normalizeSevereSentiment(cat.sentiment) === 'positive');
        const hasNegative = comment.categories.some(cat => normalizeSevereSentiment(cat.sentiment) === 'negative');
        if (sentimentFilter === 'positive') return hasPositive;
        if (sentimentFilter === 'negative') return hasNegative;
        return true;
      });

      setSevereComments(severeFiltered);
      setSevereTotalCount(severeFiltered.length);
    } catch (err) {
      console.error('Error in fetchSevereComments:', err);
      setSevereComments([]);
      setSevereTotalCount(0);
    } finally {
      setSevereLoading(false);
    }
  };

  // Normalize sentiment to handle Thai/English variations
  const normalizeSevereSentiment = (s?: string) => {
    const t = (s || '').toString().trim().toLowerCase();
    if ([
      'positive', 'pos', 'เชิงบวก', 'บวก'
    ].includes(t)) return 'positive';
    if ([
      'negative', 'neg', 'เชิงลบ', 'ลบ'
    ].includes(t)) return 'negative';
    return 'neutral';
  };

  const getSevereCommentBackgroundClass = (categories: { sentiment: string }[]) => {
    if (categories.length === 0) return 'bg-background';
    
    const hasPositive = categories.some(cat => normalizeSevereSentiment(cat.sentiment) === 'positive');
    const hasNegative = categories.some(cat => normalizeSevereSentiment(cat.sentiment) === 'negative');
    
    if (hasPositive && hasNegative) return 'bg-yellow-50 dark:bg-yellow-950/20';
    if (hasPositive) return 'bg-green-50 dark:bg-green-950/20';
    if (hasNegative) return 'bg-red-50 dark:bg-red-950/20';
    
    return 'bg-background';
  };

  const getSevereSentimentBadgeClass = (sentiment: string) => {
    switch (normalizeSevereSentiment(sentiment)) {
      case 'positive':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'negative':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  return (
    <Card className="h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">ข้อร้องเรียนที่รุนแรง</CardTitle>
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
          พบข้อร้องเรียนที่รุนแรง {severeTotalCount.toLocaleString()} รายการ
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {severeLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          ) : severeComments.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                ไม่พบข้อร้องเรียนที่รุนแรง
              </h3>
              <p className="text-sm text-muted-foreground">
                ลองปรับเปลี่ยนตัวกรองเพื่อค้นหาข้อร้องเรียนที่ต้องการ
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {severeComments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className={cn(
                    "p-4 rounded-lg border space-y-3 border-red-200 dark:border-red-800",
                    getSevereCommentBackgroundClass(comment.categories)
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
                          className={getSevereSentimentBadgeClass(category.sentiment)}
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