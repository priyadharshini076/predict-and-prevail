import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Bot,
  PhoneCall,
  Filter,
  RefreshCw,
  Upload,
  BarChart3,
  Activity,
  Trash2,
  Send
} from "lucide-react";

interface CallData {
  call_id: string;
  customer_name: string;
  phone_number: string;
  wait_time: number;
  issue_type: string;
  probability: number;
  predicted_action: string;
  priority: "High" | "Medium" | "Low";
  status: "Waiting" | "In Progress" | "Completed" | "Abandoned";
  agent_assigned?: string;
  timestamp: string;
}

interface DashboardMetrics {
  total_calls: number;
  avg_wait_time: number;
  predicted_abandonment_rate: number;
  active_agents: number;
  calls_answered: number;
  calls_abandoned: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [callQueue, setCallQueue] = useState<CallData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_calls: 0,
    avg_wait_time: 0,
    predicted_abandonment_rate: 0,
    active_agents: 0,
    calls_answered: 0,
    calls_abandoned: 0
  });
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("probability");
  const [singleCallForm, setSingleCallForm] = useState({
    customer_name: "",
    issue_type: "",
    wait_time: "",
    phone_number: ""
  });
  const [aiTriageQuery, setAiTriageQuery] = useState("");
  const [triageResponse, setTriageResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [callFile, setCallFile] = useState<File | null>(null);

  // Simulate real-time data
  useEffect(() => {
    const generateMockCall = (): CallData => {
      const issues = ["Billing", "Technical Support", "Account", "Delivery", "Refund", "General Inquiry"];
      const names = ["John Smith", "Sarah Johnson", "Mike Davis", "Emily Chen", "Robert Wilson", "Jessica Brown"];
      const probability = Math.random();
      
      return {
        call_id: `CALL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customer_name: names[Math.floor(Math.random() * names.length)],
        phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        wait_time: Math.floor(Math.random() * 600) + 30,
        issue_type: issues[Math.floor(Math.random() * issues.length)],
        probability: probability,
        predicted_action: probability > 0.7 ? "Priority Routing" : probability > 0.4 ? "Offer Callback" : "Continue Queue",
        priority: probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low",
        status: "Waiting",
        timestamp: new Date().toISOString()
      };
    };

    // Initial load
    const initialCalls = Array.from({ length: 12 }, generateMockCall);
    setCallQueue(initialCalls);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCallQueue(prev => {
        const updated = prev.map(call => ({
          ...call,
          wait_time: call.wait_time + 15,
          probability: Math.min(call.probability + 0.02, 0.95)
        }));

        // Occasionally add new calls
        if (Math.random() > 0.7 && updated.length < 20) {
          updated.push(generateMockCall());
        }

        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update metrics when queue changes
  useEffect(() => {
    const total = callQueue.length;
    const avgWait = total > 0 ? callQueue.reduce((sum, call) => sum + call.wait_time, 0) / total : 0;
    const highRisk = callQueue.filter(call => call.probability > 0.6).length;
    
    setMetrics({
      total_calls: total,
      avg_wait_time: Math.round(avgWait),
      predicted_abandonment_rate: total > 0 ? (highRisk / total) * 100 : 0,
      active_agents: 24,
      calls_answered: 156,
      calls_abandoned: 8
    });
  }, [callQueue]);

  const filteredCalls = callQueue
    .filter(call => filterPriority === "all" || call.priority.toLowerCase() === filterPriority)
    .sort((a, b) => {
      if (sortBy === "probability") return b.probability - a.probability;
      if (sortBy === "wait_time") return b.wait_time - a.wait_time;
      return 0;
    });

  const handlePredictSingle = () => {
    if (!singleCallForm.customer_name || !singleCallForm.issue_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and issue type",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const probability = Math.random() * 0.8 + 0.1;
      const newCall: CallData = {
        call_id: `CALL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customer_name: singleCallForm.customer_name,
        phone_number: singleCallForm.phone_number,
        wait_time: parseInt(singleCallForm.wait_time) || 0,
        issue_type: singleCallForm.issue_type,
        probability: probability,
        predicted_action: probability > 0.7 ? "Priority Routing" : probability > 0.4 ? "Offer Callback" : "Continue Queue",
        priority: probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low",
        status: "Waiting",
        timestamp: new Date().toISOString()
      };
      
      setCallQueue(prev => [newCall, ...prev]);
      setSingleCallForm({ customer_name: "", issue_type: "", wait_time: "", phone_number: "" });
      setIsLoading(false);
      
      toast({
        title: "Risk Assessment Complete",
        description: `Call ${newCall.call_id} added to queue with ${(probability * 100).toFixed(1)}% abandonment risk`,
        variant: probability > 0.7 ? "destructive" : "default"
      });
    }, 1500);
  };

  const handleAiTriage = () => {
    if (!aiTriageQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a customer query to process",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const responses = [
        "This appears to be a billing inquiry. I can help you check your account balance and recent charges. Your current balance is $45.67 with a payment due on March 15th. I've also found a $10 credit from last month that can be applied. Would you like me to process the payment or escalate to billing specialist?",
        "For delivery tracking, I can see your order #12345 is currently in transit and expected to arrive tomorrow by 3 PM. The package is with FedEx and tracking shows it's 2 stops away. I've sent you a tracking link via SMS. No escalation needed - issue resolved!",
        "This seems like a technical support issue. I've run a quick diagnostic and detected a connectivity issue with your router model RT-AC66U. I'm sending troubleshooting steps via email, but this requires escalation to Level 2 technical support due to potential hardware failure.",
        "Account verification completed successfully. I can help you reset your password and update your security settings. For advanced account changes like closing accounts or major profile updates, I'll connect you with a specialist. Standard changes processed automatically."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setTriageResponse(response);
      setIsLoading(false);
      
      toast({
        title: "AI Triage Complete",
        description: "Customer query processed and response generated",
        variant: "default"
      });
    }, 2000);
  };

  const handleTakeAction = (callId: string, action: string) => {
    const call = callQueue.find(c => c.call_id === callId);
    if (!call) return;

    setCallQueue(prev => prev.map(c => 
      c.call_id === callId 
        ? { 
            ...c, 
            status: action === "callback" ? "Completed" : "In Progress", 
            agent_assigned: action === "priority" ? `Agent #${Math.floor(Math.random() * 50 + 1)}` : undefined 
          }
        : c
    ));

    const actionMessages = {
      priority: `Call ${callId} moved to priority queue and assigned to ${call.agent_assigned || 'next available agent'}`,
      callback: `Callback scheduled for ${call.customer_name}. Customer will be contacted within 15 minutes`,
      bot: `${call.customer_name} transferred to AI assistant for immediate support`
    };

    toast({
      title: "Action Completed",
      description: actionMessages[action as keyof typeof actionMessages] || "Action processed successfully",
      variant: "default"
    });
  };

  // New handler functions for interactive buttons
  const handleEmergencyCallback = () => {
    const highRiskCalls = callQueue.filter(call => call.probability > 0.8);
    if (highRiskCalls.length === 0) {
      toast({
        title: "No Emergency Cases",
        description: "No calls currently require emergency intervention",
        variant: "default"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setCallQueue(prev => prev.map(call => 
        call.probability > 0.8 
          ? { ...call, status: "In Progress", agent_assigned: `Emergency Agent #${Math.floor(Math.random() * 5 + 1)}` }
          : call
      ));
      setIsLoading(false);
      
      toast({
        title: "Emergency Protocol Activated",
        description: `${highRiskCalls.length} high-risk calls moved to emergency callback queue`,
        variant: "destructive"
      });
    }, 1000);
  };

  const handleDeployAI = () => {
    toast({
      title: "AI Assistant Deployed",
      description: "Virtual assistant is now handling incoming calls for initial triage",
      variant: "default"
    });
  };

  const handleSendSMS = () => {
    const eligibleCalls = callQueue.filter(call => call.wait_time > 180);
    if (eligibleCalls.length === 0) {
      toast({
        title: "No Eligible Calls",
        description: "No calls have been waiting long enough for SMS deflection",
        variant: "default"
      });
      return;
    }

    toast({
      title: "SMS Deflection Sent",
      description: `${eligibleCalls.length} customers sent self-service SMS options`,
      variant: "default"
    });
  };

  const handleRefreshQueue = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate adding 2-3 new calls
      const newCalls = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
        const issues = ["Billing", "Technical Support", "Account", "Delivery", "Refund", "General Inquiry"];
        const names = ["Alex Rodriguez", "Maria Garcia", "David Kim", "Lisa Thompson", "James Wilson"];
        const probability = Math.random();
        
        return {
          call_id: `CALL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customer_name: names[Math.floor(Math.random() * names.length)],
          phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          wait_time: Math.floor(Math.random() * 120) + 30,
          issue_type: issues[Math.floor(Math.random() * issues.length)],
          probability: probability,
          predicted_action: probability > 0.7 ? "Priority Routing" : probability > 0.4 ? "Offer Callback" : "Continue Queue",
          priority: (probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low") as "High" | "Medium" | "Low",
          status: "Waiting" as const,
          timestamp: new Date().toISOString()
        };
      });

      setCallQueue(prev => [...newCalls, ...prev]);
      setIsLoading(false);
      
      toast({
        title: "Queue Refreshed",
        description: `${newCalls.length} new calls added to queue`,
        variant: "default"
      });
    }, 1000);
  };

  const handleClearQueue = () => {
    setCallQueue([]);
    toast({
      title: "Queue Cleared",
      description: "All calls have been removed from the queue",
      variant: "default"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCallFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} ready for upload. Click "Send Batch to API" to process.`,
        variant: "default"
      });
    }
  };

  const handleSendBatch = () => {
    if (!callFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a CSV file first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate processing a batch file
      const batchCalls = Array.from({ length: 8 }, (_, i) => {
        const issues = ["Billing", "Technical Support", "Account", "Delivery", "Refund"];
        const names = ["Batch Customer " + (i + 1)];
        const probability = Math.random();
        
        return {
          call_id: `BATCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customer_name: names[0],
          phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          wait_time: Math.floor(Math.random() * 300) + 60,
          issue_type: issues[Math.floor(Math.random() * issues.length)],
          probability: probability,
          predicted_action: probability > 0.7 ? "Priority Routing" : probability > 0.4 ? "Offer Callback" : "Continue Queue",
          priority: (probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low") as "High" | "Medium" | "Low",
          status: "Waiting" as const,
          timestamp: new Date().toISOString()
        };
      });

      setCallQueue(prev => [...batchCalls, ...prev]);
      setCallFile(null);
      setIsLoading(false);
      
      toast({
        title: "Batch Processing Complete",
        description: `${batchCalls.length} calls processed and added to queue`,
        variant: "default"
      });
    }, 2500);
  };

  const handleLoadSample = () => {
    setIsLoading(true);
    setTimeout(() => {
      const sampleCalls = Array.from({ length: 6 }, (_, i) => {
        const sampleData = [
          { name: "John Marketing", issue: "Campaign Analytics", phone: "+1-555-0101" },
          { name: "Sarah Finance", issue: "Budget Approval", phone: "+1-555-0102" },
          { name: "Mike Operations", issue: "System Integration", phone: "+1-555-0103" },
          { name: "Emma Support", issue: "Client Escalation", phone: "+1-555-0104" },
          { name: "Tom Development", issue: "API Documentation", phone: "+1-555-0105" },
          { name: "Lisa Quality", issue: "Process Review", phone: "+1-555-0106" }
        ];
        
        const data = sampleData[i] || sampleData[0];
        const probability = Math.random();
        
        return {
          call_id: `SAMPLE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customer_name: data.name,
          phone_number: data.phone,
          wait_time: Math.floor(Math.random() * 400) + 100,
          issue_type: data.issue,
          probability: probability,
          predicted_action: probability > 0.7 ? "Priority Routing" : probability > 0.4 ? "Offer Callback" : "Continue Queue",
          priority: (probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low") as "High" | "Medium" | "Low",
          status: "Waiting" as const,
          timestamp: new Date().toISOString()
        };
      });

      setCallQueue(prev => [...sampleCalls, ...prev]);
      setIsLoading(false);
      
      toast({
        title: "Sample Data Loaded",
        description: `${sampleCalls.length} sample calls added to queue for testing`,
        variant: "default"
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CallPredict AI</h1>
                <p className="text-sm text-muted-foreground">Call Abandonment Prevention System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Live Queue</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{metrics.active_agents} Agents Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-card border-r border-border p-6 space-y-6 h-[calc(100vh-81px)] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold mb-4">Queue Management</h3>
            <div className="space-y-3">
              <label htmlFor="file-upload">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <div>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Call Data
                  </div>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleRefreshQueue}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Queue
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleLoadSample}
                disabled={isLoading}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Load Sample Data
              </Button>
              {callFile && (
                <Button 
                  className="w-full justify-start bg-gradient-primary" 
                  onClick={handleSendBatch}
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Batch to API
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                size="sm" 
                className="w-full justify-start"
                onClick={handleEmergencyCallback}
                disabled={isLoading}
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Emergency Callback
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleDeployAI}
                disabled={isLoading}
              >
                <Bot className="w-4 h-4 mr-2" />
                Deploy AI Assistant
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleSendSMS}
                disabled={isLoading}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send SMS Deflection
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority Level</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="probability">Risk Score</SelectItem>
                    <SelectItem value="wait_time">Wait Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 h-[calc(100vh-81px)] overflow-y-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_calls}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +2.5% from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.floor(metrics.avg_wait_time / 60)}:{(metrics.avg_wait_time % 60).toString().padStart(2, '0')}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="inline w-3 h-3 mr-1" />
                  -8% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predicted Abandonment</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.predicted_abandonment_rate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  High risk calls: {callQueue.filter(c => c.probability > 0.6).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.8%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.calls_answered} answered, {metrics.calls_abandoned} abandoned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="queue" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="queue">Live Queue</TabsTrigger>
              <TabsTrigger value="ai-triage">AI Triage</TabsTrigger>
              <TabsTrigger value="callbacks">Smart Callbacks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Call Queue ({filteredCalls.length} calls)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRefreshQueue}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleClearQueue}
                      disabled={callQueue.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredCalls.map((call) => (
                      <div key={call.call_id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <p className="font-medium">{call.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{call.call_id}</p>
                          </div>
                          <div>
                            <p className="text-sm">{call.issue_type}</p>
                            <p className="text-sm text-muted-foreground">{call.phone_number}</p>
                          </div>
                          <div>
                            <p className="text-sm">Wait: {Math.floor(call.wait_time / 60)}:{(call.wait_time % 60).toString().padStart(2, '0')}</p>
                            <Badge variant={call.priority === "High" ? "destructive" : call.priority === "Medium" ? "default" : "secondary"}>
                              {call.priority}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-mono">{(call.probability * 100).toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">{call.predicted_action}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleTakeAction(call.call_id, "priority")}
                              disabled={call.status !== "Waiting"}
                            >
                              Priority
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleTakeAction(call.call_id, "callback")}
                              disabled={call.status !== "Waiting"}
                            >
                              Callback
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleTakeAction(call.call_id, "bot")}
                              disabled={call.status !== "Waiting"}
                            >
                              Bot
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Single Prediction Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input 
                      placeholder="Customer Name" 
                      value={singleCallForm.customer_name}
                      onChange={(e) => setSingleCallForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                    <Input 
                      placeholder="Phone Number" 
                      value={singleCallForm.phone_number}
                      onChange={(e) => setSingleCallForm(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                    <Input 
                      placeholder="Issue Type" 
                      value={singleCallForm.issue_type}
                      onChange={(e) => setSingleCallForm(prev => ({ ...prev, issue_type: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Wait Time (sec)" 
                        type="number"
                        value={singleCallForm.wait_time}
                        onChange={(e) => setSingleCallForm(prev => ({ ...prev, wait_time: e.target.value }))}
                      />
                      <Button 
                        onClick={handlePredictSingle}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Predict"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-triage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Virtual AI Triage Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Textarea 
                      placeholder="Enter customer query or issue description..."
                      value={aiTriageQuery}
                      onChange={(e) => setAiTriageQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleAiTriage} 
                      className="mt-2"
                      disabled={isLoading || !aiTriageQuery.trim()}
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      {isLoading ? "Processing..." : "Process with AI Triage"}
                    </Button>
                  </div>
                  
                  {triageResponse && (
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        AI Response:
                      </h4>
                      <p className="text-sm leading-relaxed">{triageResponse}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setTriageResponse("")}
                      >
                        Clear Response
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">FAQ Resolution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">78%</p>
                        <p className="text-sm text-muted-foreground">Resolved without human agent</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">2.4s</p>
                        <p className="text-sm text-muted-foreground">AI triage response time</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Escalation Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">22%</p>
                        <p className="text-sm text-muted-foreground">Complex issues escalated</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="callbacks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Smart Callback Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Pending Callbacks</h4>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-border rounded">
                            <div>
                              <p className="font-medium">Customer #{12340 + i}</p>
                              <p className="text-sm text-muted-foreground">Scheduled: {new Date(Date.now() + i * 15 * 60 * 1000).toLocaleTimeString()}</p>
                            </div>
                            <Badge variant="outline">VIP</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Omnichannel Deflection</h4>
                      <div className="space-y-2">
                        <div className="p-3 border border-border rounded">
                          <p className="font-medium">SMS Sent</p>
                          <p className="text-sm text-muted-foreground">Delivery tracking link sent to +1234567890</p>
                        </div>
                        <div className="p-3 border border-border rounded">
                          <p className="font-medium">WhatsApp Bot</p>
                          <p className="text-sm text-muted-foreground">Account balance inquiry resolved</p>
                        </div>
                        <div className="p-3 border border-border rounded">
                          <p className="font-medium">Email Support</p>
                          <p className="text-sm text-muted-foreground">Billing dispute redirected to portal</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Callback Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">96.2%</p>
                        <p className="text-sm text-muted-foreground">Customers answered callback</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Deflection Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">34%</p>
                        <p className="text-sm text-muted-foreground">Issues resolved via SMS/Chat</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Queue Reduction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">42%</p>
                        <p className="text-sm text-muted-foreground">Overall queue volume reduced</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Risk (&gt;70%)</span>
                        <span className="text-sm font-mono">{callQueue.filter(c => c.probability > 0.7).length} calls</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium Risk (40-70%)</span>
                        <span className="text-sm font-mono">{callQueue.filter(c => c.probability > 0.4 && c.probability <= 0.7).length} calls</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low Risk (&lt;40%)</span>
                        <span className="text-sm font-mono">{callQueue.filter(c => c.probability <= 0.4).length} calls</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Model Accuracy</span>
                        <span className="text-sm font-mono">94.7%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Prediction Confidence</span>
                        <span className="text-sm font-mono">87.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">False Positive Rate</span>
                        <span className="text-sm font-mono">5.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;