-- Create link_ref table for external tools management
CREATE TABLE public.link_ref (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic TEXT NOT NULL,
  linked TEXT NOT NULL,
  description TEXT NOT NULL,
  update_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.link_ref ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access for link_ref"
ON public.link_ref
FOR SELECT
USING (true);

-- Create policy for public write access (since this appears to be a management tool)
CREATE POLICY "Allow public write access for link_ref"
ON public.link_ref
FOR ALL
USING (true);

-- Insert some initial data
INSERT INTO public.link_ref (topic, linked, description) VALUES
('เอกสารการใช้งาน', 'https://docs.example.com', 'คู่มือการใช้งานระบบ'),
('การตั้งค่าระบบ', 'https://settings.example.com', 'หน้าการตั้งค่าระบบ'),
('คู่มือการแก้ไขปัญหา', 'https://support.example.com', 'วิธีการแก้ไขปัญหาต่างๆ'),
('API Reference', 'https://api.example.com/docs', 'เอกสาร API สำหรับนักพัฒนา'),
('ติดต่อสนับสนุน', 'https://support.example.com/contact', 'ช่องทางติดต่อทีมสนับสนุน'),
('อัพเดทระบบ', 'https://updates.example.com', 'ข้อมูลการอัพเดทระบบ');