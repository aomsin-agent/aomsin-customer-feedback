import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface CategoryRef {
  main_topic: string;
  sub_topic: string;
  definition: string | null;
  example_sentence: string | null;
  allow: string;
  no: number;
  create_at: string;
  last_update: string;
}

interface BranchRef {
  branch_id: number | null;
  branch_name: string;
  address: string | null;
  district: string | null;
  province: string | null;
  region: number | null;
  division: number | null;
  resdesc: string | null;
  branch_type: string | null;
  telephone: string | null;
  fax: string | null;
  service_time: string | null;
  work_time: string | null;
  parent_branch: string | null;
}

export default function Documents() {
  const [categoryData, setCategoryData] = useState<CategoryRef[]>([]);
  const [branchData, setBranchData] = useState<BranchRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingCategory, setRefreshingCategory] = useState(false);
  const [refreshingBranch, setRefreshingBranch] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch category_ref data
      const { data: categories, error: categoryError } = await supabase
        .from('category_ref')
        .select('*')
        .order('no', { ascending: true });

      if (categoryError) throw categoryError;

      // Fetch branch_ref data
      const { data: branches, error: branchError } = await supabase
        .from('branch_ref')
        .select('*');

      if (branchError) throw branchError;

      setCategoryData(categories || []);
      setBranchData((branches as unknown as BranchRef[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCategoryData = async () => {
    setRefreshingCategory(true);
    try {
      const { data: categories, error: categoryError } = await supabase
        .from('category_ref')
        .select('*')
        .order('no', { ascending: true });

      if (categoryError) throw categoryError;
      setCategoryData(categories || []);
      
      toast({
        title: "รีเฟรชสำเร็จ",
        description: "ข้อมูลตารางอ้างอิงหมวดหมู่ได้รับการอัพเดทแล้ว",
      });
    } catch (error) {
      console.error('Error refreshing category data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเฟรชข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setRefreshingCategory(false);
    }
  };

  const refreshBranchData = async () => {
    setRefreshingBranch(true);
    try {
      const { data: branches, error: branchError } = await supabase
        .from('branch_ref')
        .select('*');

      if (branchError) throw branchError;
      setBranchData((branches as unknown as BranchRef[]) || []);
      
      toast({
        title: "รีเฟรชสำเร็จ",
        description: "ข้อมูลตารางอ้างอิงสาขาได้รับการอัพเดทแล้ว",
      });
    } catch (error) {
      console.error('Error refreshing branch data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเฟรชข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setRefreshingBranch(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-32 md:h-64">
          <div className="text-base md:text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6 p-4 md:p-6 lg:pl-72 xl:pl-80">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          เอกสารอ้างอิง
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          รวบรวมเอกสาร นโยบาย และคู่มือที่เกี่ยวข้องกับการจัดการข้อร้องเรียน
        </p>
      </div>

      {/* Category Reference Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg md:text-xl">ตารางอ้างอิงหมวดหมู่ (Category Reference)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCategoryData}
              disabled={refreshingCategory}
              className="self-start sm:self-center"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingCategory ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-max pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ลำดับ</TableHead>
                    <TableHead className="whitespace-nowrap">หมวดหมู่ย่อย</TableHead>
                    <TableHead className="whitespace-nowrap">หมวดหมู่หลัก</TableHead>
                    <TableHead className="whitespace-nowrap">คำนิยาม</TableHead>
                    <TableHead className="whitespace-nowrap">ตัวอย่างประโยค</TableHead>
                    <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                    <TableHead className="whitespace-nowrap">วันที่สร้าง</TableHead>
                    <TableHead className="whitespace-nowrap">วันที่อัพเดท</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.no}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{item.sub_topic}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.main_topic}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.definition || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.example_sentence || '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.allow === 'yes' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.allow === 'yes' ? 'อนุญาต' : 'ไม่อนุญาต'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(item.create_at).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(item.last_update).toLocaleDateString('th-TH')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Branch Reference Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg md:text-xl">ตารางอ้างอิงสาขา (Branch Reference)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBranchData}
              disabled={refreshingBranch}
              className="self-start sm:self-center"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingBranch ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-max pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">รหัสสาขา</TableHead>
                    <TableHead className="whitespace-nowrap">ชื่อสาขา</TableHead>
                    <TableHead className="whitespace-nowrap">ที่อยู่</TableHead>
                    <TableHead className="whitespace-nowrap">อำเภอ/เขต</TableHead>
                    <TableHead className="whitespace-nowrap">จังหวัด</TableHead>
                    <TableHead className="whitespace-nowrap">ภาค</TableHead>
                    <TableHead className="whitespace-nowrap">กอง</TableHead>
                    <TableHead className="whitespace-nowrap">คำอธิบาย</TableHead>
                    <TableHead className="whitespace-nowrap">ประเภทสาขา</TableHead>
                    <TableHead className="whitespace-nowrap">โทรศัพท์</TableHead>
                    <TableHead className="whitespace-nowrap">โทรสาร</TableHead>
                    <TableHead className="whitespace-nowrap">เวลาให้บริการ</TableHead>
                    <TableHead className="whitespace-nowrap">เวลาทำงาน</TableHead>
                    <TableHead className="whitespace-nowrap">สาขาแม่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.branch_id || '-'}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{item.branch_name}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.address || '-'}>{item.address || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.district || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.province || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.region || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.division || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.resdesc || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.branch_type || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.telephone || '-'}>{item.telephone || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.fax || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.service_time || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.work_time || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.parent_branch || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}