import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { cn } from '@/lib/utils';

interface BranchRef {
  no: number;
  branch_name: string;
  region: string;
  division: string;
  district: string;
  province: string;
  resdesc: string;
  'open-time': string;
  'service-time': string;
}

interface CategoryRef {
  no: number;
  main_topic: string;
  sub_topic: string;
  definition: string;
  example_sentence: string;
}

interface RawComment {
  comment_id: string;
  date: string;
  time: string;
  branch_name: string;
  region: string;
  division: string;
  district: string;
  province: string;
  comment: string;
}

interface SentenceCategory {
  sentence_id: string;
  comment_id: string;
  sentence: string;
  main_category: string;
  sub_category: string;
  sentiment: string;
  created_at: string;
}

interface CommentWithCategories extends RawComment {
  categories: SentenceCategory[];
  overallSentiment: 'positive' | 'negative' | 'mixed';
}

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const TIME_RANGES = [
  { label: 'เลือกทั้งหมด', days: null },
  { label: '1 วัน', days: 1 },
  { label: '7 วัน', days: 7 },
  { label: '14 วัน', days: 14 },
  { label: '1 เดือน', days: 30 },
  { label: '3 เดือน', days: 90 },
  { label: '6 เดือน', days: 180 },
  { label: '1 ปี', days: 365 }
];

export default function CustomerFeedback() {
  const [branches, setBranches] = useState<BranchRef[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [comments, setComments] = useState<CommentWithCategories[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative'>('all');
  
// Time filter states
  const [timeFilterType, setTimeFilterType] = useState<'all' | 'monthly' | 'range' | 'custom'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Search states
  const [regionSearch, setRegionSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches with proper sorting
      const { data: branchData, error: branchError } = await supabase
        .from('branch_ref')
        .select('*');

      if (branchError) throw branchError;

      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('category_ref')
        .select('*')
        .order('main_topic', { ascending: true });

      if (categoryError) throw categoryError;

      setBranches((branchData as unknown as BranchRef[]) || []);
      setCategories((categoryData as unknown as CategoryRef[]) || []);

      // Set default selections
      const allRegions = [...new Set(((branchData as unknown as BranchRef[]) || []).map(b => b.region).filter(Boolean))];
      const allMainCategories = [...new Set(((categoryData as unknown as CategoryRef[]) || []).map(c => c.main_topic))];
      
      setSelectedRegions(allRegions);
      setSelectedMainCategories(allMainCategories);
      setSelectedSubCategories(((categoryData as unknown as CategoryRef[]) || []).map(c => c.sub_topic));
      
      // Set default month to current month
      const now = new Date();
      const currentMonth = `${THAI_MONTHS[now.getMonth()]} ${(now.getFullYear() + 543).toString().slice(-2)}`;
      setSelectedMonth(currentMonth);

      await fetchComments();
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Calculate date range based on filter type
      let dateFilter = '';
      const today = new Date();
      
      if (timeFilterType === 'monthly' && selectedMonth) {
        const [monthStr, yearStr] = selectedMonth.split(' ');
        const monthIndex = THAI_MONTHS.indexOf(monthStr);
        const year = parseInt('25' + yearStr) - 543; // Convert from Buddhist to Gregorian
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0);
        dateFilter = `date.gte.${format(startOfMonth, 'yyyy-MM-dd')}.and(date.lte.${format(endOfMonth, 'yyyy-MM-dd')})`;
      } else if (timeFilterType === 'range' && selectedTimeRange !== null) {
        const rangeStart = subDays(today, selectedTimeRange);
        dateFilter = `date.gte.${format(rangeStart, 'yyyy-MM-dd')}`;
      } else if (timeFilterType === 'custom') {
        dateFilter = `date.gte.${format(startDate, 'yyyy-MM-dd')}.and(date.lte.${format(endDate, 'yyyy-MM-dd')})`;
      }

      // Fetch raw comments
      let query = supabase
        .from('raw_comment')
        .select('*');

      if (dateFilter) {
        query = query.or(dateFilter);
      }

      if (selectedRegions.length > 0 && selectedRegions.length < sortedRegions.length) {
        query = query.in('region', selectedRegions);
      }

      if (selectedBranches.length > 0) {
        query = query.in('branch_name', selectedBranches);
      }

      const { data: rawComments, error: commentError } = await query
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (commentError) throw commentError;

      // Fetch sentence categories for these comments
      const commentIds = rawComments?.map(c => c.comment_id) || [];
      
      if (commentIds.length === 0) {
        setComments([]);
        return;
      }

      const { data: sentenceData, error: sentenceError } = await supabase
        .from('sentence_category')
        .select('*')
        .in('comment_id', commentIds);

      if (sentenceError) throw sentenceError;

        // Combine data and calculate overall sentiment
      const combinedComments: CommentWithCategories[] = (rawComments || []).map(comment => {
        const commentCategories = (sentenceData || []).filter(s => s.comment_id === comment.comment_id);
        
        // Filter categories based on selected categories
        const filteredCategories = commentCategories.filter(cat => {
          const mainCategoryMatch = selectedMainCategories.length === 0 || selectedMainCategories.includes(cat.main_category);
          const subCategoryMatch = selectedSubCategories.length === 0 || selectedSubCategories.includes(cat.sub_category);
          return mainCategoryMatch && subCategoryMatch;
        });

        // Calculate overall sentiment
        const sentiments = filteredCategories.map(c => c.sentiment.toLowerCase());
        const hasPositive = sentiments.some(s => s.includes('positive'));
        const hasNegative = sentiments.some(s => s.includes('negative'));
        
        let overallSentiment: 'positive' | 'negative' | 'mixed';
        if (hasPositive && hasNegative) {
          overallSentiment = 'mixed';
        } else if (hasPositive) {
          overallSentiment = 'positive';
        } else {
          overallSentiment = 'negative';
        }

        return {
          ...comment,
          categories: filteredCategories.map(cat => ({
            sentence_id: cat.sentence_id,
            comment_id: cat.comment_id,
            sentence: (cat as any).sentence || '',
            main_category: cat.main_category,
            sub_category: cat.sub_category,
            sentiment: cat.sentiment,
            created_at: cat.created_at
          })) as SentenceCategory[],
          overallSentiment
        };
      });

      // Filter by sentiment
      const filteredComments = combinedComments.filter(comment => {
        if (sentimentFilter === 'all') return true;
        return comment.overallSentiment === sentimentFilter || comment.overallSentiment === 'mixed';
      });

      setComments(filteredComments);

    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch comments when filters change
  useEffect(() => {
    if (branches.length > 0 && categories.length > 0) {
      fetchComments();
    }
  }, [
    selectedRegions, selectedDistricts, selectedBranches,
    selectedMainCategories, selectedSubCategories,
    timeFilterType, selectedMonth, selectedTimeRange, startDate, endDate,
    sentimentFilter
  ]);

  // Derived data for hierarchical filtering with proper sorting
  const sortedRegions = useMemo(() => {
    const uniqueRegions = [...new Set(branches.map(b => b.region).filter(Boolean))];
    return uniqueRegions.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''));
      const numB = parseInt(b.replace(/[^0-9]/g, ''));
      return numA - numB;
    });
  }, [branches]);

  const availableDistricts = useMemo(() => {
    return [...new Set(branches
      .filter(b => selectedRegions.length === 0 || selectedRegions.includes(b.region))
      .map(b => b.district)
      .filter(Boolean))];
  }, [branches, selectedRegions]);

  const availableBranches = useMemo(() => {
    return branches.filter(b => {
      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(b.region);
      const districtMatch = selectedDistricts.length === 0 || selectedDistricts.includes(b.district);
      return regionMatch && districtMatch;
    });
  }, [branches, selectedRegions, selectedDistricts]);

  const availableSubCategories = useMemo(() => {
    return categories.filter(c => 
      selectedMainCategories.length === 0 || selectedMainCategories.includes(c.main_topic)
    );
  }, [categories, selectedMainCategories]);

  const resetFilters = () => {
    const allRegions = [...new Set(branches.map(b => b.region).filter(Boolean))];
    const allMainCategories = [...new Set(categories.map(c => c.main_topic))];
    
    setSelectedRegions(allRegions);
    setSelectedDistricts([]);
    setSelectedBranches([]);
    setSelectedMainCategories(allMainCategories);
    setSelectedSubCategories(categories.map(c => c.sub_topic));
    setSentimentFilter('all');
    setTimeFilterType('all');
    setSelectedTimeRange(null);
    setSelectedMonth('');
    setCurrentPage(1);
  };

  // Helper function to format selection display with required asterisk
  const formatSelectionDisplay = (selected: string[], total: number, itemType: string, showRequired = false) => {
    const asterisk = showRequired && selected.length === 0 ? ' *' : '';
    if (selected.length === 0) {
      return `เลือก${itemType}${asterisk}`;
    }
    if (selected.length === total) {
      return `เลือกทั้งหมด (${total} รายการ)`;
    }
    if (selected.length <= 3) {
      return selected.join(', ');
    }
    return `เลือก ${selected.length} รายการ`;
  };

  // Helper function to format Thai date time
  const formatThaiDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = THAI_MONTHS[dateObj.getMonth()];
      const year = dateObj.getFullYear() + 543;
      
      // Format time to remove seconds if present
      const timeFormatted = time.split(':').slice(0, 2).join(':');
      
      return `${day} ${month} ${year} | ${timeFormatted} น.`;
    } catch (error) {
      return `${date} | ${time}`;
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const paginatedComments = comments.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    if (sentiment.toLowerCase().includes('positive')) {
      return 'bg-success text-success-foreground';
    } else if (sentiment.toLowerCase().includes('negative')) {
      return 'bg-destructive text-destructive-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getCommentBackgroundColor = (overallSentiment: 'positive' | 'negative' | 'mixed') => {
    switch (overallSentiment) {
      case 'positive':
        return 'bg-success/10 border-success/20';
      case 'negative':
        return 'bg-destructive/10 border-destructive/20';
      case 'mixed':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-card';
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            ข้อคิดเห็นของลูกค้า
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
          </p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ข้อคิดเห็นของลูกค้า
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          รวบรวมและวิเคราะห์ความคิดเห็นและข้อเสนอแนะจากลูกค้า
        </p>
      </div>

      {/* Filtering Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ตัวกรองข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Area Filtering */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                พื้นที่ดูแล - ภาค
                {selectedRegions.length === 0 && <span className="text-destructive">*</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    {formatSelectionDisplay(selectedRegions, sortedRegions.length, 'ภาค', true)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                  <div className="space-y-2">
                    <Input
                      placeholder="ค้นหาภาค..."
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                    />
                    <ScrollArea className="h-48">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={selectedRegions.length === sortedRegions.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRegions(sortedRegions);
                            } else {
                              setSelectedRegions([]);
                              setSelectedDistricts([]);
                              setSelectedBranches([]);
                            }
                          }}
                        />
                        <label className="text-sm font-medium">เลือกทั้งหมด</label>
                      </div>
                      {sortedRegions
                        .filter(region => region.toLowerCase().includes(regionSearch.toLowerCase()))
                        .map(region => (
                          <div key={region} className="flex items-center space-x-2 p-2">
                            <Checkbox
                              checked={selectedRegions.includes(region)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRegions([...selectedRegions, region]);
                                } else {
                                  setSelectedRegions(selectedRegions.filter(r => r !== region));
                                  setSelectedDistricts([]);
                                  setSelectedBranches([]);
                                }
                              }}
                            />
                            <label className="text-sm">{region}</label>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">เขต</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    {formatSelectionDisplay(selectedDistricts, availableDistricts.length, 'เขต')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                  <div className="space-y-2">
                    <Input
                      placeholder="ค้นหาเขต..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                    />
                    <ScrollArea className="h-48">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={selectedDistricts.length === availableDistricts.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDistricts(availableDistricts);
                            } else {
                              setSelectedDistricts([]);
                              setSelectedBranches([]);
                            }
                          }}
                        />
                        <label className="text-sm font-medium">เลือกทั้งหมด</label>
                      </div>
                      {availableDistricts
                        .filter(district => district.toLowerCase().includes(districtSearch.toLowerCase()))
                        .map(district => (
                          <div key={district} className="flex items-center space-x-2 p-2">
                            <Checkbox
                              checked={selectedDistricts.includes(district)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDistricts([...selectedDistricts, district]);
                                } else {
                                  setSelectedDistricts(selectedDistricts.filter(d => d !== district));
                                  setSelectedBranches([]);
                                }
                              }}
                            />
                            <label className="text-sm">{district}</label>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">สาขา</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    {formatSelectionDisplay(selectedBranches, availableBranches.length, 'สาขา')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                  <div className="space-y-2">
                    <Input
                      placeholder="ค้นหาสาขา..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                    />
                    <ScrollArea className="h-48">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={selectedBranches.length === availableBranches.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBranches(availableBranches.map(b => b.branch_name));
                            } else {
                              setSelectedBranches([]);
                            }
                          }}
                        />
                        <label className="text-sm font-medium">เลือกทั้งหมด</label>
                      </div>
                      {availableBranches
                        .filter(branch => branch.branch_name.toLowerCase().includes(branchSearch.toLowerCase()))
                        .map(branch => (
                          <div key={branch.branch_name} className="flex items-center space-x-2 p-2">
                            <Checkbox
                              checked={selectedBranches.includes(branch.branch_name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBranches([...selectedBranches, branch.branch_name]);
                                } else {
                                  setSelectedBranches(selectedBranches.filter(b => b !== branch.branch_name));
                                }
                              }}
                            />
                            <label className="text-sm">{branch.branch_name}</label>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Filtering */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ช่วงเวลา
                {timeFilterType !== 'all' && (timeFilterType === 'monthly' && !selectedMonth) && <span className="text-destructive">*</span>}
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Select value={timeFilterType} onValueChange={(value: 'all' | 'monthly' | 'range' | 'custom') => setTimeFilterType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                      <SelectItem value="all" className="font-medium">เลือกทั้งหมด</SelectItem>
                      <SelectItem value="monthly">ข้อมูลประจำเดือน</SelectItem>
                      <SelectItem value="range">ช่วงเวลาย้อนหลัง</SelectItem>
                      <SelectItem value="custom">กำหนดช่วงเวลาเอง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {timeFilterType === 'monthly' && (
                  <div className="flex-1">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเดือน" />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                        {Array.from({ length: 12 }, (_, i) => {
                          const currentYear = new Date().getFullYear() + 543;
                          const monthStr = `${THAI_MONTHS[i]} ${currentYear.toString().slice(-2)}`;
                          return (
                            <SelectItem key={monthStr} value={monthStr}>
                              {monthStr}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {timeFilterType === 'range' && (
                  <div className="flex-1">
                    <Select value={selectedTimeRange?.toString() || ''} onValueChange={(value) => setSelectedTimeRange(value === 'null' ? null : parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกช่วงเวลา" />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                        {TIME_RANGES.map(range => (
                          <SelectItem key={range.label} value={range.days?.toString() || 'null'} className={range.days === null ? 'font-medium' : ''}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {timeFilterType === 'custom' && (
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">วันที่เริ่มต้น</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">วันที่สิ้นสุด</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filtering */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                หมวดหมู่ใหญ่
                {selectedMainCategories.length === 0 && <span className="text-destructive">*</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    {formatSelectionDisplay(selectedMainCategories, [...new Set(categories.map(c => c.main_topic))].length, 'หมวด', true)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                  <div className="space-y-2">
                    <Input
                      placeholder="ค้นหาหมวดหมู่..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                    <ScrollArea className="h-48">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={selectedMainCategories.length === [...new Set(categories.map(c => c.main_topic))].length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMainCategories([...new Set(categories.map(c => c.main_topic))]);
                            } else {
                              setSelectedMainCategories([]);
                              setSelectedSubCategories([]);
                            }
                          }}
                        />
                        <label className="text-sm font-medium">เลือกทั้งหมด</label>
                      </div>
                      {[...new Set(categories.map(c => c.main_topic))]
                        .filter(topic => topic.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map(topic => (
                          <div key={topic} className="flex items-center space-x-2 p-2">
                            <Checkbox
                              checked={selectedMainCategories.includes(topic)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMainCategories([...selectedMainCategories, topic]);
                                } else {
                                  setSelectedMainCategories(selectedMainCategories.filter(c => c !== topic));
                                  // Also remove related sub-categories
                                  const relatedSubCategories = categories
                                    .filter(c => c.main_topic === topic)
                                    .map(c => c.sub_topic);
                                  setSelectedSubCategories(
                                    selectedSubCategories.filter(sub => !relatedSubCategories.includes(sub))
                                  );
                                }
                              }}
                            />
                            <label className="text-sm">{topic}</label>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                หมวดหมู่ย่อย
                {selectedSubCategories.length === 0 && <span className="text-destructive">*</span>}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-left">
                    {formatSelectionDisplay(selectedSubCategories, availableSubCategories.length, 'หมวด', true)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50" side="bottom" sideOffset={8} align="start" avoidCollisions={true} collisionPadding={16}>
                  <div className="space-y-2">
                    <Input
                      placeholder="ค้นหาหมวดหมู่ย่อย..."
                      value={subCategorySearch}
                      onChange={(e) => setSubCategorySearch(e.target.value)}
                    />
                    <ScrollArea className="h-48">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={selectedSubCategories.length === availableSubCategories.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSubCategories(availableSubCategories.map(c => c.sub_topic));
                            } else {
                              setSelectedSubCategories([]);
                            }
                          }}
                        />
                        <label className="text-sm font-medium">เลือกทั้งหมด</label>
                      </div>
                      {availableSubCategories
                        .filter(cat => cat.sub_topic.toLowerCase().includes(subCategorySearch.toLowerCase()))
                        .map(cat => (
                          <div key={cat.sub_topic} className="flex items-center space-x-2 p-2">
                            <Checkbox
                              checked={selectedSubCategories.includes(cat.sub_topic)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSubCategories([...selectedSubCategories, cat.sub_topic]);
                                } else {
                                  setSelectedSubCategories(selectedSubCategories.filter(c => c !== cat.sub_topic));
                                }
                              }}
                            />
                            <label className="text-sm">{cat.sub_topic}</label>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              ล้างตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">ความคิดเห็นของลูกค้า</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sentimentFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSentimentFilter('all')}
                className={cn(
                  'min-w-20',
                  sentimentFilter === 'all' 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/70'
                )}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={sentimentFilter === 'positive' ? 'default' : 'outline'}
                onClick={() => setSentimentFilter('positive')}
                className={cn(
                  'min-w-20',
                  sentimentFilter === 'positive' 
                    ? 'bg-success text-success-foreground hover:bg-success/90' 
                    : 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/70'
                )}
              >
                เชิงบวก
              </Button>
              <Button
                variant={sentimentFilter === 'negative' ? 'default' : 'outline'}
                onClick={() => setSentimentFilter('negative')}
                className={cn(
                  'min-w-20',
                  sentimentFilter === 'negative' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                    : 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/70'
                )}
              >
                เชิงลบ
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            พบความคิดเห็น {comments.length} รายการ
            {comments.length > COMMENTS_PER_PAGE && ` | หน้า ${currentPage} จาก ${totalPages}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {paginatedComments.map((comment) => (
              <Card key={comment.comment_id} className={cn(
                "border-l-4",
                getCommentBackgroundColor(comment.overallSentiment)
              )}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{comment.region}</span>
                      {comment.district && <span> | {comment.district}</span>}
                      <span> | {comment.branch_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatThaiDateTime(comment.date, comment.time)}
                    </div>
                  </div>
                  
                  <p className="text-foreground mb-3">
                    {comment.comment}
                  </p>
                  
                  {comment.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {comment.categories.map((category) => (
                        <Badge
                          key={`${category.comment_id}-${category.sub_category}`}
                          variant="secondary"
                          className={cn(
                            "text-white",
                            getSentimentBadgeColor(category.sentiment)
                          )}
                        >
                          {category.sub_category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">ไม่พบความคิดเห็นที่ตรงกับเงื่อนไขที่กำหนด</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="h-9 w-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}