'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Zap, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { hasTeamPermission } from '@/lib/team-roles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TeamAnalyticsProps {
  teamId: string;
  userRole: string;
}

interface AnalyticsData {
  summary: {
    totalGenerations: number;
    totalMembers: number;
    apiRequests: number;
    successRate: number;
  };
  dailyUsage: Array<{
    date: string;
    generations: number;
    apiRequests: number;
  }>;
  memberActivity: Array<{
    memberName: string;
    generations: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  languageBreakdown: Array<{
    language: string;
    count: number;
  }>;
}

export function TeamAnalytics({ teamId, userRole }: TeamAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const canViewAnalytics = hasTeamPermission(userRole as any, 'analytics:view');

  useEffect(() => {
    if (canViewAnalytics) {
      fetchAnalytics();
    }
  }, [teamId, period, canViewAnalytics]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/team/analytics?teamId=${teamId}&period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/team/analytics/export?teamId=${teamId}&period=${period}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${period}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (!canViewAnalytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Analytics</h3>
          <p className="text-muted-foreground">
            You don't have permission to view team analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available.</p>
        </CardContent>
      </Card>
    );
  }

  const dailyUsageChart = {
    labels: data.dailyUsage.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Generations',
        data: data.dailyUsage.map(d => d.generations),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'API Requests',
        data: data.dailyUsage.map(d => d.apiRequests),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const categoryChart = {
    labels: data.categoryBreakdown.map(c => c.category),
    datasets: [{
      data: data.categoryBreakdown.map(c => c.count),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ]
    }]
  };

  const memberActivityChart = {
    labels: data.memberActivity.map(m => m.memberName),
    datasets: [{
      label: 'Generations',
      data: data.memberActivity.map(m => m.generations),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }]
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={exportReport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.totalGenerations}</p>
                  <p className="text-sm text-muted-foreground">Total Generations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.apiRequests}</p>
                  <p className="text-sm text-muted-foreground">API Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{data.summary.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={dailyUsageChart} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={categoryChart} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={memberActivityChart} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.languageBreakdown.map((lang, index) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <span className="text-sm">{lang.language.toUpperCase()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ 
                          width: `${(lang.count / data.summary.totalGenerations) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{lang.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}