import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Activity, Brain, Zap, Shield, FileText, Search, CreditCard } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  tasksCompleted: number;
  currentTask?: string;
  efficiency: number;
  icon: React.ReactNode;
}

const AgentOrchestrationDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'cipc_commander',
      name: 'CIPC Commander',
      status: 'active',
      tasksCompleted: 47,
      currentTask: 'Routing compliance query',
      efficiency: 94,
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'lead_scout',
      name: 'Lead Scout',
      status: 'processing',
      tasksCompleted: 23,
      currentTask: 'Analyzing potential clients',
      efficiency: 87,
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'kyc_onboarder',
      name: 'KYC Onboarder',
      status: 'idle',
      tasksCompleted: 31,
      efficiency: 91,
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'compliance_copilot',
      name: 'Compliance Copilot',
      status: 'active',
      tasksCompleted: 56,
      currentTask: 'Validating BO submission',
      efficiency: 96,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'form_autopilot',
      name: 'Form Autopilot',
      status: 'processing',
      tasksCompleted: 42,
      currentTask: 'Generating BO form',
      efficiency: 89,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'payment_runner',
      name: 'Payment Runner',
      status: 'idle',
      tasksCompleted: 18,
      efficiency: 93,
      icon: <CreditCard className="w-5 h-5" />
    }
  ]);

  const [orchestrationMetrics, setOrchestrationMetrics] = useState({
    totalTasks: 217,
    successRate: 94.2,
    avgResponseTime: 1.3,
    activeAgents: 3
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'idle': return 'bg-gray-400';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'processing': return 'secondary';
      case 'idle': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Agent Orchestration</h1>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* Orchestration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orchestrationMetrics.totalTasks}</div>
            <p className="text-sm text-muted-foreground">Total Tasks Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{orchestrationMetrics.successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orchestrationMetrics.avgResponseTime}s</div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{orchestrationMetrics.activeAgents}</div>
            <p className="text-sm text-muted-foreground">Active Agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {agent.icon}
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <Badge variant={getStatusBadgeVariant(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-semibold">{agent.tasksCompleted}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Efficiency</span>
                  <span className="font-semibold">{agent.efficiency}%</span>
                </div>
                <Progress value={agent.efficiency} className="h-2" />
              </div>

              {agent.currentTask && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Current Task:</span>
                  <p className="font-medium mt-1">{agent.currentTask}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Logs
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Configure
                </Button>
              </div>
            </CardContent>
            
            {/* Status indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor(agent.status)}`} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentOrchestrationDashboard;