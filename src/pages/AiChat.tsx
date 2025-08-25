import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Bot, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'สวัสดีครับ! ผมคือ AI ช่วยวิเคราะห์ ผมสามารถช่วยวิเคราะห์ข้อมูลและให้คำแนะนำเชิงลึกเกี่ยวกับข้อร้องเรียนได้ครับ',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch webhook URL from Supabase on component mount
  useEffect(() => {
    fetchWebhookFromSupabase();
  }, []);

  const fetchWebhookFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('link_ref')
        .select('*')
        .eq('topic', 'webhook chatbot')
        .single();

      if (error) {
        console.error('Error fetching webhook:', error);
        // Fallback to default URL
        setWebhookUrl('https://webhook.example.com/chat');
        return;
      }

      if (data && data.linked) {
        setWebhookUrl(data.linked);
        console.log('Webhook URL loaded from Supabase:', data.linked);
      } else {
        setWebhookUrl('https://webhook.example.com/chat');
      }
    } catch (error) {
      console.error('Error fetching webhook URL:', error);
      setWebhookUrl('https://webhook.example.com/chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveWebhookConfig = async (newUrl: string) => {
    try {
      const { error } = await supabase
        .from('link_ref')
        .update({ 
          linked: newUrl,
          description: 'webhook chatbot',
          update_at: new Date().toISOString()
        })
        .eq('topic', 'webhook chatbot');

      if (error) {
        console.error('Error updating webhook:', error);
        toast.error("ไม่สามารถบันทึกการตั้งค่าได้");
        return;
      }

      setWebhookUrl(newUrl);
      toast.success("บันทึกการตั้งค่า Webhook สำเร็จ");
    } catch (error) {
      console.error('Error saving webhook config:', error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleWebhookUrlChange = (newUrl: string) => {
    if (newUrl.trim()) {
      saveWebhookConfig(newUrl.trim());
      setIsSettingsOpen(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.output || data.response || 'ขอบคุณสำหรับข้อความของคุณ ฉันได้รับข้อมูลแล้ว',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("ไม่สามารถส่งข้อความได้ กรุณาตรวจสอบการตั้งค่า Webhook");
      
      // Add fallback bot message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'ขออพัยครับ ระบบมีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-4 xl:pl-3 xl:pr-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AI Chat ช่วยวิเคราะห์
        </h1>
        <p className="text-muted-foreground">
          ใช้ปัญญาประดิษฐ์ในการวิเคราะห์ข้อมูลและให้คำแนะนำเชิงลึก
        </p>
      </div>
      
      {/* Chatbot Container */}
      <div className="bg-card rounded-lg shadow-soft overflow-hidden">
        {/* Header with pink gradient */}
        <div className="bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 border-b border-pink-200 dark:border-pink-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-200 dark:bg-pink-800/50 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-pink-900 dark:text-pink-100">AI Assistant</h3>
                <p className="text-sm text-pink-700 dark:text-pink-300">พร้อมช่วยวิเคราะห์ข้อมูลของคุณ</p>
              </div>
            </div>
            
            {/* Settings Button */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800/50"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>ตั้งค่า Webhook URL</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Webhook URL (จาก Supabase)</label>
                    <Input
                      placeholder="https://your-webhook-url.com/chat"
                      defaultValue={webhookUrl}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleWebhookUrlChange(e.currentTarget.value);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>• URL นี้จะถูกบันทึกใน Supabase table: link_ref</p>
                    <p>• กด Enter เพื่อบันทึกการตั้งค่า</p>
                    <p className="mt-2 font-medium">URL ปัจจุบัน: <span className="text-primary">{webhookUrl}</span></p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="h-[400px] sm:h-[500px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 dark:bg-pink-950/50 text-foreground border border-pink-200 dark:border-pink-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' 
                      ? 'text-pink-100' 
                      : 'text-pink-600 dark:text-pink-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('th-TH', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-pink-200 dark:border-pink-800/50 p-4 bg-pink-50/30 dark:bg-pink-950/20">
          <div className="flex gap-2 sm:gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความของคุณที่นี่..."
              className="flex-1 border-pink-200 dark:border-pink-800 focus-visible:ring-pink-400 focus-visible:border-pink-400"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white flex-shrink-0 px-3 sm:px-4"
              size="default"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">ส่ง</span>
            </Button>
          </div>
          <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 text-center">
            กด Enter เพื่อส่งข้อความ • Webhook จาก Supabase: {webhookUrl.length > 50 ? `${webhookUrl.substring(0, 50)}...` : webhookUrl}
          </p>
        </div>
      </div>
    </div>
  );
}