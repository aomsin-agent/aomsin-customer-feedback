import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { FileText, Phone, Lightbulb, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown, Filter } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
export default function MonthlyOverview() {
  const [selectedYear, setSelectedYear] = useState("2567");
  const [selectedMonthOnly, setSelectedMonthOnly] = useState("มกราคม");
  const [selectedRegion, setSelectedRegion] = useState("เลือกทั้งหมด");
  const [selectedCriteria, setSelectedCriteria] = useState("เลือกทั้งหมด");
  const [selectedSentiment, setSelectedSentiment] = useState<"positive" | "negative" | null>(null);
  const [selectedMainTopics, setSelectedMainTopics] = useState<string[]>([]);
  const [mainTopics, setMainTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"positive" | "negative" | null>("positive");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [butterflyData, setButterflyData] = useState<{
    topic: string;
    positive: number;
    negative: number;
    mainTopic: string;
  }[]>([]);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [leftContainerHeight, setLeftContainerHeight] = useState<number>(0);

  // Fetch main topics and butterfly data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('category_ref').select('main_topic, sub_topic').order('main_topic');
        if (error) {
          console.error('Error fetching category data:', error);
          // Fallback to mock data if Supabase fails
          const mockData = [{
            topic: "ความรวดเร็วในการให้บริการ",
            positive: 345,
            negative: 123,
            mainTopic: "การให้บริการ"
          }, {
            topic: "ระยะเวลารอคอย",
            positive: 298,
            negative: 156,
            mainTopic: "การให้บริการ"
          }, {
            topic: "การปรับปรุงระบบ",
            positive: 267,
            negative: 89,
            mainTopic: "เทคโนโลยี"
          }, {
            topic: "ความสะดวกของระบบออนไลน์",
            positive: 234,
            negative: 67,
            mainTopic: "เทคโนโลยี"
          }, {
            topic: "ทักษะและความรู้ของเจ้าหน้าที่",
            positive: 198,
            negative: 134,
            mainTopic: "บุคลากร"
          }, {
            topic: "การดูแลเอาใจใส่",
            positive: 134,
            negative: 67,
            mainTopic: "บุคลากร"
          }, {
            topic: "ความถูกต้องของธุรกรรม",
            positive: 128,
            negative: 45,
            mainTopic: "การให้บริการ"
          }, {
            topic: "สภาพแวดล้อมสาขา",
            positive: 112,
            negative: 78,
            mainTopic: "สิ่งแวดล้อม"
          }, {
            topic: "ความพร้อมของเครื่องมือ",
            positive: 98,
            negative: 92,
            mainTopic: "เทคโนโลยี"
          }, {
            topic: "ความน่าเชื่อถือ",
            positive: 87,
            negative: 43,
            mainTopic: "บุคลากร"
          }, {
            topic: "การตอบคำถามและแนะนำ",
            positive: 76,
            negative: 56,
            mainTopic: "บุคลากร"
          }, {
            topic: "ช่วงเวลาให้บริการ",
            positive: 68,
            negative: 71,
            mainTopic: "การให้บริการ"
          }, {
            topic: "ความสะดวกในการเข้าถึง",
            positive: 59,
            negative: 38,
            mainTopic: "สิ่งแวดล้อม"
          }, {
            topic: "ระบบจองคิว",
            positive: 54,
            negative: 47,
            mainTopic: "เทคโนโลยี"
          }];
          setButterflyData(mockData);
          setMainTopics(["การให้บริการ", "เทคโนโลยี", "บุคลากร", "สิ่งแวดล้อม"]);
          setSelectedMainTopics(["การให้บริการ", "เทคโนโลยี", "บุคลากร", "สิ่งแวดล้อม"]);
          return;
        }

        // Get unique main topics
        const uniqueMainTopics = [...new Set(data?.map(item => item.main_topic) || [])];
        setMainTopics(uniqueMainTopics);
        setSelectedMainTopics(uniqueMainTopics); // Default to all selected

        // Create butterfly data based on sub_topics with mock counts
        const topicCounts: Record<string, {
          positive: number;
          negative: number;
          mainTopic: string;
        }> = {};
        data?.forEach(item => {
          if (item.sub_topic && item.main_topic) {
            if (!topicCounts[item.sub_topic]) {
              topicCounts[item.sub_topic] = {
                positive: Math.floor(Math.random() * 300) + 50,
                negative: Math.floor(Math.random() * 150) + 20,
                mainTopic: item.main_topic
              };
            }
          }
        });
        const butterflyChartData = Object.entries(topicCounts).map(([topic, counts]) => ({
          topic,
          positive: counts.positive,
          negative: counts.negative,
          mainTopic: counts.mainTopic
        }));
        setButterflyData(butterflyChartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Monitor left container height for dynamic height matching
  useEffect(() => {
    const updateHeight = () => {
      if (leftContainerRef.current) {
        setLeftContainerHeight(leftContainerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  const handleMainTopicChange = (topics: string[]) => {
    setSelectedMainTopics(topics);
  };
  const handleSortChange = (type: "positive" | "negative") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  // Years and months for dropdown
  const years = ["2567", "2568"];
  const monthsOnly = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  
  // Computed selected month for compatibility
  const selectedMonth = `${selectedMonthOnly} ${selectedYear}`;

  // Generate months from January 2024 to June 2025 (keeping for compatibility)
  const months = ["มกราคม 2567", "กุมภาพันธ์ 2567", "มีนาคม 2567", "เมษายน 2567", "พฤษภาคม 2567", "มิถุนายน 2567", "กรกฎาคม 2567", "สิงหาคม 2567", "กันยายน 2567", "ตุลาคม 2567", "พฤศจิกายน 2567", "ธันวาคม 2567", "มกราคม 2568", "กุมภาพันธ์ 2568", "มีนาคม 2568", "เมษายน 2568", "พฤษภาคม 2568", "มิถุนายน 2568"];

  // Regions for satisfaction score dropdown
  const regions = ["เลือกทั้งหมด", "ภาค 1", "ภาค 2", "ภาค 3", "ภาค 4", "ภาค 5", "ภาค 6", "ภาค 7", "ภาค 8", "ภาค 9", "ภาค 10", "ภาค 11", "ภาค 12", "ภาค 13", "ภาค 14", "ภาค 15", "ภาค 16", "ภาค 17", "ภาค 18"];

  // Criteria for satisfaction comparison
  const criteria = ["เลือกทั้งหมด", "การดูแล ความเอาใจใส่", "ความน่าเชื่อถือการตอบคำถามและแนะนำ", "ความรวดเร็วในการให้บริการ", "ความถูกต้องในการทำธุรกรรม", "ความพร้อมของเครื่องมือ", "สภาพแวดล้อมของสาขา", "ความประทับใจในการให้บริการ"];

  // Mock data for spider/radar chart by region
  const satisfactionDataByRegion = {
    "เลือกทั้งหมด": [{
      criteria: "การดูแล ความเอาใจใส่",
      score: 4.2
    }, {
      criteria: "ความน่าเชื่อถือฯ",
      score: 4.5
    }, {
      criteria: "ความรวดเร็วฯ",
      score: 3.8
    }, {
      criteria: "ความถูกต้องฯ",
      score: 4.7
    }, {
      criteria: "ความพร้อมฯ",
      score: 3.9
    }, {
      criteria: "สภาพแวดล้อมฯ",
      score: 4.1
    }, {
      criteria: "ความประทับใจฯ",
      score: 4.3
    }],
    "ภาค 1": [{
      criteria: "การดูแล ความเอาใจใส่",
      score: 4.5
    }, {
      criteria: "ความน่าเชื่อถือฯ",
      score: 4.2
    }, {
      criteria: "ความรวดเร็วฯ",
      score: 4.0
    }, {
      criteria: "ความถูกต้องฯ",
      score: 4.8
    }, {
      criteria: "ความพร้อมฯ",
      score: 4.1
    }, {
      criteria: "สภาพแวดล้อมฯ",
      score: 4.3
    }, {
      criteria: "ความประทับใจฯ",
      score: 4.4
    }],
    "ภาค 2": [{
      criteria: "การดูแล ความเอาใจใส่",
      score: 3.9
    }, {
      criteria: "ความน่าเชื่อถือฯ",
      score: 4.3
    }, {
      criteria: "ความรวดเร็วฯ",
      score: 3.6
    }, {
      criteria: "ความถูกต้องฯ",
      score: 4.5
    }, {
      criteria: "ความพร้อมฯ",
      score: 3.7
    }, {
      criteria: "สภาพแวดล้อมฯ",
      score: 3.8
    }, {
      criteria: "ความประทับใจฯ",
      score: 4.0
    }]
  };

  // Generate mock data for other regions
  const allRegionsData = {
    ...satisfactionDataByRegion
  };
  for (let i = 3; i <= 18; i++) {
    const regionKey = `ภาค ${i}`;
    allRegionsData[regionKey] = [{
      criteria: "การดูแล ความเอาใจใส่",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "ความน่าเชื่อถือฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "ความรวดเร็วฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "ความถูกต้องฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "ความพร้อมฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "สภาพแวดล้อมฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }, {
      criteria: "ความประทับใจฯ",
      score: +(Math.random() * 1.5 + 3.5).toFixed(1)
    }];
  }
  const satisfactionRadarData = allRegionsData[selectedRegion] || allRegionsData["เลือกทั้งหมด"];

  // Calculate average score
  const averageScore = satisfactionRadarData.reduce((sum, item) => sum + item.score, 0) / satisfactionRadarData.length;

  // Mock data for regional comparison bar chart
  const regionalComparisonData = Array.from({
    length: 18
  }, (_, i) => ({
    region: `ภาค ${i + 1}`,
    lastMonth: +(Math.random() * 2 + 3).toFixed(1),
    // 3.0-5.0
    currentMonth: +(Math.random() * 2 + 3).toFixed(1) // 3.0-5.0
  }));

  // Mock data for KPI cards
  const kpiData = [{
    icon: FileText,
    title: "แบบฟอร์มทั้งหมด",
    value: 1247,
    change: 12.5,
    isPositive: true,
    lastMonth: 1109
  }, {
    icon: Phone,
    title: "ให้ข้อมูลติดต่อ",
    value: 892,
    change: -5.3,
    isPositive: false,
    lastMonth: 941
  }, {
    icon: Lightbulb,
    title: "มีข้อเสนอแนะ",
    value: 456,
    change: 18.7,
    isPositive: true,
    lastMonth: 384
  }, {
    icon: AlertTriangle,
    title: "ข้อร้องเรียนรุนแรง",
    value: 23,
    change: -34.2,
    isPositive: false,
    lastMonth: 35
  }];

  // Mock data for branch type donut chart
  const branchTypeData = [{
    name: "ให้บริการ 5 วัน",
    value: 68,
    fill: "url(#branchGradient)"
  }, {
    name: "ให้บริการ 7 วัน",
    value: 32,
    fill: "hsl(200, 60%, 75%)"
  } // Light blue
  ];

  // Mock data for service type bar chart
  const serviceTypeData = [{
    category: "ฝาก/ถอน",
    lastMonth: 320,
    currentMonth: 380
  }, {
    category: "ชำระเงิน",
    lastMonth: 250,
    currentMonth: 290
  }, {
    category: "สมัครบริการ",
    lastMonth: 180,
    currentMonth: 220
  }, {
    category: "สอบถาม",
    lastMonth: 150,
    currentMonth: 170
  }, {
    category: "อื่นๆ",
    lastMonth: 90,
    currentMonth: 110
  }];

  // Mock data for form submission line chart
  const formSubmissionData = [{
    day: "1",
    blue: 45,
    red: 38
  }, {
    day: "5",
    blue: 52,
    red: 42
  }, {
    day: "10",
    blue: 48,
    red: 35
  }, {
    day: "15",
    blue: 61,
    red: 48
  }, {
    day: "20",
    blue: 58,
    red: 44
  }, {
    day: "25",
    blue: 65,
    red: 52
  }, {
    day: "30",
    blue: 72,
    red: 58
  }];

  // Mock data for comments/suggestions section

  // Sentiment distribution for donut chart
  const sentimentData = [{
    name: "เชิงบวก",
    value: 72.3,
    count: 892,
    fill: "hsl(142, 76%, 36%)"
  },
  // Green
  {
    name: "เชิงลบ",
    value: 27.7,
    count: 342,
    fill: "hsl(0, 84%, 60%)"
  } // Red
  ];

  // Filter topics based on selected main topics
  const filteredTopicsData = butterflyData.filter(topic => selectedMainTopics.length > 0 && selectedMainTopics.includes(topic.mainTopic));

  // Sort topics based on selected sort criteria
  const sortedTopicsData = [...filteredTopicsData].sort((a, b) => {
    const aValue = sortBy === "positive" ? a.positive : a.negative;
    const bValue = sortBy === "positive" ? b.positive : b.negative;
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  // Take top 10 topics
  const topicsData = sortedTopicsData.slice(0, 10);

  // Regional sentiment data for bar chart (18 regions)
  const regionalSentimentData = Array.from({
    length: 18
  }, (_, i) => ({
    region: `ภาค ${i + 1}`,
    currentMonthPositive: Math.floor(Math.random() * 100) + 50,
    currentMonthNegative: Math.floor(Math.random() * 60) + 20,
    lastMonthPositive: Math.floor(Math.random() * 90) + 40,
    lastMonthNegative: Math.floor(Math.random() * 50) + 15
  }));
  const chartConfig = {
    lastMonth: {
      label: "เดือนที่แล้ว",
      color: "hsl(220, 5%, 65%)" // Light gray
    },
    currentMonth: {
      label: "เดือนปัจจุบัน",
      color: "hsl(var(--primary))"
    },
    blue: {
      label: "แบบฟอร์มทั้งหมด",
      color: "hsl(220, 70%, 50%)"
    },
    red: {
      label: "ไม่พอใจการให้บริการ",
      color: "hsl(0, 70%, 50%)"
    },
    "ให้บริการ 5 วัน": {
      label: "ให้บริการ 5 วัน",
      color: "hsl(330, 60%, 65%)"
    },
    "ให้บริการ 7 วัน": {
      label: "ให้บริการ 7 วัน",
      color: "hsl(200, 60%, 75%)"
    },
    positive: {
      label: "เชิงบวก",
      color: "hsl(142, 76%, 36%)"
    },
    negative: {
      label: "เชิงลบ",
      color: "hsl(0, 84%, 60%)"
    }
  };
  return <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              สรุปภาพรวมประจำเดือน
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              ภาพรวมข้อมูลการให้บริการและข้อร้องเรียนของลูกค้าในเดือนปัจจุบัน
            </p>
          </div>
          
          <div className="flex-shrink-0 flex gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24 bg-card">
                <SelectValue placeholder="ปี" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMonthOnly} onValueChange={setSelectedMonthOnly}>
              <SelectTrigger className="w-32 bg-card">
                <SelectValue placeholder="เดือน" />
              </SelectTrigger>
              <SelectContent>
                {monthsOnly.map(month => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* การส่งแบบประเมิน */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                การส่งแบบประเมิน
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => {
              const colors = [{
                bg: "from-blue-50 to-blue-100",
                border: "border-blue-200",
                text: "text-blue-800",
                number: "text-blue-900",
                desc: "text-blue-600"
              }, {
                bg: "from-green-50 to-green-100",
                border: "border-green-200",
                text: "text-green-800",
                number: "text-green-900",
                desc: "text-green-600"
              }, {
                bg: "from-yellow-50 to-yellow-100",
                border: "border-yellow-200",
                text: "text-yellow-800",
                number: "text-yellow-900",
                desc: "text-yellow-600"
              }, {
                bg: "from-red-50 to-red-100",
                border: "border-red-200",
                text: "text-red-800",
                number: "text-red-900",
                desc: "text-red-600"
              }];
              const colorSet = colors[index];
              return <Card key={index} className={`bg-gradient-to-br ${colorSet.bg} ${colorSet.border}`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <kpi.icon className={`w-6 h-6 ${colorSet.text}`} />
                        </div>
                        <h3 className={`font-semibold ${colorSet.text} mb-1 text-sm`}>{kpi.title}</h3>
                        <p className={`text-2xl font-bold ${colorSet.number} mb-1`}>
                          {kpi.value.toLocaleString()} ครั้ง
                        </p>
                        <div className={`flex items-center justify-center gap-1 text-xs ${colorSet.desc}`}>
                          {kpi.isPositive ? <ArrowUp className="w-3 h-3 text-green-600" /> : <ArrowDown className="w-3 h-3 text-red-600" />}
                          <span className={kpi.isPositive ? "text-green-600" : "text-red-600"}>
                            {Math.abs(kpi.change).toFixed(1)}%
                          </span>
                          <span>(จากเดือนที่แล้ว {kpi.lastMonth} ครั้ง)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
            })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch Type Donut Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2 text-center">ประเภทของสาขา</h3>
                  <div className="flex justify-center">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <Pie data={branchTypeData} cx="50%" cy="45%" innerRadius={40} outerRadius={70} paddingAngle={5} startAngle={90} endAngle={450} dataKey="value" label={({
                          name,
                          value
                        }) => `${name}: ${value}%`} labelLine={false}>
                            {branchTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Service Type Bar Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2 text-center">ประเภทการใช้บริการ</h3>
                  <div className="flex justify-center items-center h-full">
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceTypeData} margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 10
                      }}>
                          <defs>
                            <linearGradient id="currentMonthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="category" tick={{
                          fontSize: 10
                        }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{
                          fontSize: 10
                        }} stroke="hsl(var(--muted-foreground))" width={35} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="lastMonth" fill="hsl(220, 5%, 80%)" name="เดือนที่แล้ว" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="currentMonth" fill="url(#currentMonthGradient)" name="เดือนปัจจุบัน" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Form Submission Line Chart */}
              
            </div>
          </CardContent>
        </Card>

        {/* คะแนนความพึงพอใจ */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                คะแนนความพึงพอใจ
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {/* Left Side - Spider/Radar Chart */}
              <div className="lg:col-span-1">
                <Card className="bg-card border">
                  <CardContent className="p-4 flex flex-col min-h-[360px]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-foreground text-center flex-1">
                        คะแนนเฉลี่ยตามเกณฑ์
                      </h3>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-32 bg-card text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                      <ChartContainer config={chartConfig} className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={satisfactionRadarData}>
                            <defs>
                              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                              </linearGradient>
                            </defs>
                            <PolarGrid gridType="polygon" />
                            <PolarAngleAxis dataKey="criteria" tick={{
                            fontSize: 10,
                            fill: "hsl(var(--foreground))"
                          }} tickFormatter={(value, index) => {
                            const dataPoint = satisfactionRadarData[index];
                            return `${value}\n(${dataPoint?.score?.toFixed(1) || '0'})`;
                          }} />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{
                            fontSize: 8,
                            fill: "hsl(var(--muted-foreground))"
                          }} tickCount={6} />
                            <Radar name="คะแนน" dataKey="score" stroke="hsl(var(--primary))" fill="url(#radarGradient)" strokeWidth={2} />
                            <ChartTooltip content={({
                            active,
                            payload
                          }) => {
                            if (active && payload && payload.length) {
                              return <div className="bg-card border rounded-lg p-2 shadow-md">
                                      <p className="text-sm font-medium">{payload[0].payload.criteria}</p>
                                      <p className="text-xs text-primary">
                                       คะแนน: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}
                                      </p>
                                    </div>;
                            }
                            return null;
                          }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      {/* Average Score Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center bg-card/80 rounded-lg px-2 py-1 backdrop-blur-sm">
                          <div className="text-lg font-bold text-primary">
                            {averageScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Regional Comparison Bar Chart */}
              <div className="lg:col-span-2">
                <Card className="bg-card border">
                  <CardContent className="p-4 flex flex-col min-h-[360px]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-foreground text-center flex-1">
                        เปรียบเทียบคะแนนรายภาค
                      </h3>
                      <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
                        <SelectTrigger className="w-40 bg-card text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {criteria.map(criterion => <SelectItem key={criterion} value={criterion}>
                              {criterion}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <ChartContainer config={chartConfig} className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={regionalComparisonData} margin={{
                          top: 10,
                          right: 15,
                          left: 0,
                          bottom: 30
                        }}>
                            <defs>
                              <linearGradient id="regionalCurrentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F13596" />
                                <stop offset="50%" stopColor="#FD85D7" />
                                <stop offset="100%" stopColor="#FFA0E2" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="region" tick={{
                            fontSize: 9
                          }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={60} />
                            <YAxis domain={[0, 5]} tick={{
                            fontSize: 10
                          }} stroke="hsl(var(--muted-foreground))" width={35} />
                            <ChartTooltip content={({
                            active,
                            payload,
                            label
                          }) => {
                            if (active && payload && payload.length) {
                              return <div className="bg-card border rounded-lg p-2 shadow-md">
                                      <p className="text-sm font-medium">{label}</p>
                                      {payload.map((entry, index) => <p key={index} className="text-xs" style={{
                                  color: entry.color
                                }}>
                                          {entry.name}: {entry.value}
                                        </p>)}
                                    </div>;
                            }
                            return null;
                          }} />
                            <Bar dataKey="lastMonth" fill="hsl(220, 5%, 80%)" name="เดือนที่แล้ว" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="currentMonth" fill="url(#regionalCurrentGradient)" name="เดือนปัจจุบัน" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile/Tablet Layout - Stacked */}
            <div className="lg:hidden space-y-6">
              {/* Spider/Radar Chart */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-foreground text-center flex-1">
                      คะแนนเฉลี่ยตามเกณฑ์
                    </h3>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-32 bg-card text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(region => <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-center items-center">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={satisfactionRadarData}>
                          <defs>
                            <linearGradient id="radarGradientMobile" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                            </linearGradient>
                          </defs>
                          <PolarGrid gridType="polygon" />
                          <PolarAngleAxis dataKey="criteria" tick={{
                          fontSize: 8,
                          fill: "hsl(var(--foreground))"
                        }} />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{
                          fontSize: 7,
                          fill: "hsl(var(--muted-foreground))"
                        }} tickCount={6} />
                          <Radar name="คะแนน" dataKey="score" stroke="hsl(var(--primary))" fill="url(#radarGradientMobile)" strokeWidth={2} />
                          <ChartTooltip content={({
                          active,
                          payload
                        }) => {
                          if (active && payload && payload.length) {
                            return <div className="bg-card border rounded-lg p-2 shadow-md">
                                    <p className="text-sm font-medium">{payload[0].payload.criteria}</p>
                                    <p className="text-xs text-primary">
                                      คะแนน: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}
                                    </p>
                                  </div>;
                          }
                          return null;
                        }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xl font-bold text-primary">
                      {averageScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Comparison - Mobile shows current month only */}
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-foreground text-center flex-1">
                      คะแนนรายภาค (เดือนปัจจุบัน)
                    </h3>
                    <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
                      <SelectTrigger className="w-40 bg-card text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {criteria.map(criterion => <SelectItem key={criterion} value={criterion}>
                            {criterion}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-center items-center h-full">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionalComparisonData} margin={{
                        top: 10,
                        right: 15,
                        left: 0,
                        bottom: 30
                      }}>
                          <defs>
                            <linearGradient id="regionalCurrentGradientMobile" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F13596" />
                              <stop offset="50%" stopColor="#FD85D7" />
                              <stop offset="100%" stopColor="#FFA0E2" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="region" tick={{
                          fontSize: 8
                        }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={50} />
                          <YAxis domain={[0, 5]} tick={{
                          fontSize: 9
                        }} stroke="hsl(var(--muted-foreground))" width={30} />
                          <ChartTooltip content={({
                          active,
                          payload,
                          label
                        }) => {
                          if (active && payload && payload.length) {
                            return <div className="bg-card border rounded-lg p-2 shadow-md">
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-xs text-primary">
                                      เดือนปัจจุบัน: {payload[0].value}
                                    </p>
                                  </div>;
                          }
                          return null;
                        }} />
                          <Bar dataKey="currentMonth" fill="url(#regionalCurrentGradientMobile)" name="เดือนปัจจุบัน" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* ข้อคิดเห็น/ข้อเสนอแนะ */}
        <Card className="relative overflow-hidden bg-card shadow-soft">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-4">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                ข้อคิดเห็น/ข้อเสนอแนะ
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Container บน - ทัศนคติข้อคิดเห็น และ ประเด็นที่ถูกกล่าวถึง */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
              {/* ทัศนคติข้อคิดเห็น - Donut Chart */}
              <div className="lg:col-span-1 min-w-0" ref={leftContainerRef}>
                <Card className="bg-card border">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-4 text-center">
                      ทัศนคติข้อคิดเห็น
                    </h3>
                    <div className="flex justify-center">
                      <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={sentimentData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({
                            name,
                            value,
                            count
                          }) => `${value.toFixed(1)}% (จาก ${count.toLocaleString()} ความคิดเห็น)`} labelLine={false}>
                              {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <ChartTooltip content={({
                            active,
                            payload
                          }) => {
                            if (active && payload && payload.length) {
                              return <div className="bg-card border rounded-lg p-3 shadow-md">
                                      <p className="text-sm font-medium">{payload[0].payload.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {payload[0].payload.value.toFixed(1)}% (จาก {payload[0].payload.count.toLocaleString()} ความคิดเห็น)
                                      </p>
                                    </div>;
                            }
                            return null;
                          }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                        <span className="text-xs text-muted-foreground">เชิงบวก</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                        <span className="text-xs text-muted-foreground">เชิงลบ</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ประเด็นที่ถูกกล่าวถึง - Butterfly Chart */}
              <div className="lg:col-span-1 min-w-0">
                <Card className="bg-card border" style={{
                minHeight: leftContainerHeight > 0 ? `${leftContainerHeight}px` : 'auto'
              }}>
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header with 3-column grid layout */}
                    <div className="grid grid-cols-3 items-center mb-4">
                      {/* Empty left column for balance */}
                      <div></div>
                      
                       {/* Centered title */}
                       <div className="flex justify-center">
                         <h3 className="font-medium text-foreground text-xs pointer-events-none">
                           ประเด็นที่ถูกกล่าวถึง
                         </h3>
                       </div>
                      
                      {/* Right column with controls */}
                      <div className="flex justify-end">
                        <div className="flex gap-1 items-center">
                          {/* Sort buttons - extra small */}
                          <div className="flex gap-0.5">
                            <Button variant="outline" size="sm" onClick={() => handleSortChange("positive")} className={`h-6 w-6 p-0 text-xs ${sortBy === "positive" ? "bg-green-100 border-green-300 text-green-700" : "bg-background"}`} title="เรียงตามเชิงบวก">
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSortChange("negative")} className={`h-6 w-6 p-0 text-xs ${sortBy === "negative" ? "bg-red-100 border-red-300 text-red-700" : "bg-background"}`} title="เรียงตามเชิงลบ">
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Filter dropdown as icon button */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-6 w-6 p-0" title="เลือกหัวข้อหลัก">
                                <Filter className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3" align="end">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">หัวข้อหลัก</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {mainTopics.map(topic => <div key={topic} className="flex items-center space-x-2">
                                      <Checkbox id={topic} checked={selectedMainTopics.includes(topic)} onCheckedChange={checked => {
                                    if (checked) {
                                      setSelectedMainTopics([...selectedMainTopics, topic]);
                                    } else {
                                      setSelectedMainTopics(selectedMainTopics.filter(t => t !== topic));
                                    }
                                  }} />
                                      <label htmlFor={topic} className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {topic}
                                      </label>
                                    </div>)}
                                </div>
                                <div className="pt-2 border-t">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedMainTopics(mainTopics)} className="w-full text-xs h-6">
                                    เลือกทั้งหมด
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1 sm:space-y-2">
                      {topicsData.length > 0 ? topicsData.map((item, index) => <div key={index} className="flex items-center justify-between">
                           {/* Negative bar (left) - now starts from center and extends left */}
                           <div className="flex-1 flex justify-end px-1">
                             <div className="w-full max-w-[120px] sm:max-w-[140px] h-4 sm:h-5 bg-gray-100 relative">
                               <div className="h-full bg-red-500 flex items-center justify-start pl-1 absolute right-0" style={{
                            width: `${Math.min(100, item.negative / Math.max(...butterflyData.map(d => Math.max(d.positive, d.negative))) * 100)}%`
                          }}>
                                 <span className="text-[10px] text-white font-medium">{item.negative}</span>
                               </div>
                             </div>
                           </div>
                           
                           {/* Topic name (center) */}
                           <div className="px-1 sm:px-2 min-w-0 flex-shrink-0 w-32 sm:w-44">
                             <p className="text-[10px] text-center text-foreground truncate" title={item.topic}>
                               {item.topic}
                             </p>
                           </div>
                           
                           {/* Positive bar (right) - extended */}
                           <div className="flex-1 px-1">
                             <div className="w-full max-w-[120px] sm:max-w-[140px] h-4 sm:h-5 bg-gray-100 relative">
                               <div className="h-full bg-green-500 flex items-center justify-end pr-1" style={{
                            width: `${Math.min(100, item.positive / Math.max(...butterflyData.map(d => Math.max(d.positive, d.negative))) * 100)}%`
                          }}>
                                 <span className="text-[10px] text-white font-medium">{item.positive}</span>
                               </div>
                             </div>
                           </div>
                         </div>) : <div className="flex items-center justify-center h-32">
                          <p className="text-sm text-muted-foreground">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
                        </div>}
                    </div>
                    
                     {/* Legend */}
                     <div className="flex justify-center space-x-3 sm:space-x-6 mt-3">
                       <div className="flex items-center">
                         <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>
                         <span className="text-[10px] text-muted-foreground">เชิงลบ (ครั้ง)</span>
                       </div>
                       <div className="flex items-center">
                         <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
                         <span className="text-[10px] text-muted-foreground">เชิงบวก (ครั้ง)</span>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Container ล่าง - ทัศนคติความคิดเห็นรายพื้นที่ */}
            <Card className="bg-card border">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="font-medium text-foreground mb-2 sm:mb-0">
                    ทัศนคติความคิดเห็นรายพื้นที่
                  </h3>
                  
                  {/* Sentiment Filter Buttons */}
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedSentiment(selectedSentiment === "positive" ? null : "positive")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedSentiment === "positive" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                      เชิงบวก
                    </button>
                    <button onClick={() => setSelectedSentiment(selectedSentiment === "negative" ? null : "negative")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedSentiment === "negative" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                      เชิงลบ
                    </button>
                  </div>
                </div>

                {/* Desktop Chart - Show comparison */}
                <div className="hidden md:block">
                  <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalSentimentData} margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 50
                    }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="region" tick={{
                        fontSize: 10
                      }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{
                        fontSize: 10
                      }} stroke="hsl(var(--muted-foreground))" label={{
                        value: 'จำนวนครั้ง',
                        angle: -90,
                        position: 'insideLeft'
                      }} />
                        <ChartTooltip content={({
                        active,
                        payload,
                        label
                      }) => {
                        if (active && payload && payload.length) {
                          return <div className="bg-card border rounded-lg p-3 shadow-md">
                                  <p className="text-sm font-medium">{label}</p>
                                  {payload.map((entry, index) => <p key={index} className="text-xs" style={{
                              color: entry.color
                            }}>
                                      {entry.name}: {entry.value} ครั้ง
                                    </p>)}
                                </div>;
                        }
                        return null;
                      }} />
                        
                        {/* Show bars based on selected sentiment */}
                        {!selectedSentiment && <>
                            <Bar dataKey="lastMonthPositive" fill="hsl(220, 5%, 65%)" name="เดือนที่แล้ว (เชิงบวก)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="currentMonthPositive" fill="hsl(142, 76%, 36%)" name="เดือนปัจจุบัน (เชิงบวก)" radius={[2, 2, 0, 0]} />
                          </>}
                        
                        {selectedSentiment === "positive" && <>
                            <Bar dataKey="lastMonthPositive" fill="hsl(220, 5%, 65%)" name="เดือนที่แล้ว" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="currentMonthPositive" fill="hsl(142, 76%, 36%)" name="เดือนปัจจุบัน" radius={[2, 2, 0, 0]} />
                          </>}
                        
                        {selectedSentiment === "negative" && <>
                            <Bar dataKey="lastMonthNegative" fill="hsl(220, 5%, 65%)" name="เดือนที่แล้ว" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="currentMonthNegative" fill="hsl(0, 84%, 60%)" name="เดือนปัจจุบัน" radius={[2, 2, 0, 0]} />
                          </>}
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Mobile Chart - Show current month only */}
                <div className="md:hidden">
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalSentimentData} margin={{
                      top: 20,
                      right: 15,
                      left: 20,
                      bottom: 50
                    }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="region" tick={{
                        fontSize: 8
                      }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={60} />
                        <YAxis tick={{
                        fontSize: 9
                      }} stroke="hsl(var(--muted-foreground))" width={35} />
                        <ChartTooltip content={({
                        active,
                        payload,
                        label
                      }) => {
                        if (active && payload && payload.length) {
                          return <div className="bg-card border rounded-lg p-2 shadow-md">
                                  <p className="text-sm font-medium">{label}</p>
                                  <p className="text-xs" style={{
                              color: payload[0].color
                            }}>
                                    {payload[0].name}: {payload[0].value} ครั้ง
                                  </p>
                                </div>;
                        }
                        return null;
                      }} />
                        
                        {/* Mobile shows current month only */}
                        {(!selectedSentiment || selectedSentiment === "positive") && <Bar dataKey="currentMonthPositive" fill="hsl(142, 76%, 36%)" name="เชิงบวก (เดือนปัจจุบัน)" radius={[2, 2, 0, 0]} />}
                        
                        {(!selectedSentiment || selectedSentiment === "negative") && <Bar dataKey="currentMonthNegative" fill="hsl(0, 84%, 60%)" name="เชิงลบ (เดือนปัจจุบัน)" radius={[2, 2, 0, 0]} />}
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 mt-4 flex-wrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                    <span className="text-xs text-muted-foreground">เดือนที่แล้ว</span>
                  </div>
                  {(!selectedSentiment || selectedSentiment === "positive") && <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                      <span className="text-xs text-muted-foreground">เชิงบวก</span>
                    </div>}
                  {(!selectedSentiment || selectedSentiment === "negative") && <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                      <span className="text-xs text-muted-foreground">เชิงลบ</span>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>;
}