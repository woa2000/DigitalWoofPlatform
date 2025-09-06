import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { RefreshCw, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  operationBreakdown: Record<string, {
    count: number;
    averageTime: number;
    successRate: number;
  }>;
}

interface PerformanceError {
  operation: string;
  duration: number;
  timestamp: number;
  error: string;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  stats: PerformanceStats;
  recentErrors: PerformanceError[];
  slowestOperations: any[];
  recommendations: string[];
}

export const PerformanceDashboard: React.FC = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(60 * 60 * 1000); // 1 hour
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/performance/report?window=${timeWindow}`);
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch performance data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, [timeWindow]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-600';
    if (rate >= 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms <= 1000) return 'text-green-600';
    if (ms <= 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance data...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load performance data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            System performance metrics and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={15 * 60 * 1000}>Last 15 minutes</option>
            <option value={60 * 60 * 1000}>Last hour</option>
            <option value={6 * 60 * 60 * 1000}>Last 6 hours</option>
            <option value={24 * 60 * 60 * 1000}>Last 24 hours</option>
          </select>
          <Button onClick={fetchPerformanceData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleString()}
        </p>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.stats.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResponseTimeColor(report.stats.averageResponseTime)}`}>
              {formatDuration(report.stats.averageResponseTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(report.stats.successRate)}`}>
              {(report.stats.successRate * 100).toFixed(1)}%
            </div>
            <Progress 
              value={report.stats.successRate * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.stats.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
              {(report.stats.errorRate * 100).toFixed(2)}%
            </div>
            <Progress 
              value={report.stats.errorRate * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="slow">Slow Operations</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operation Breakdown</CardTitle>
              <CardDescription>Performance by operation type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.stats.operationBreakdown).map(([operation, stats]) => (
                  <div key={operation} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{operation.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        {stats.count} requests
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getResponseTimeColor(stats.averageTime)}`}>
                        {formatDuration(stats.averageTime)}
                      </div>
                      <div className={`text-sm ${getSuccessRateColor(stats.successRate)}`}>
                        {(stats.successRate * 100).toFixed(1)}% success
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest error occurrences for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              {report.recentErrors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  No recent errors found
                </div>
              ) : (
                <div className="space-y-3">
                  {report.recentErrors.map((error, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{error.operation}</span>
                          <Badge variant="destructive">{formatTimestamp(error.timestamp)}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(error.duration)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-red-700">
                        {error.error}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slowest Operations</CardTitle>
              <CardDescription>Operations that took the longest time</CardDescription>
            </CardHeader>
            <CardContent>
              {report.slowestOperations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  No slow operations detected
                </div>
              ) : (
                <div className="space-y-3">
                  {report.slowestOperations.map((operation, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{operation.operation}</span>
                          <Badge variant="outline">{formatTimestamp(operation.timestamp)}</Badge>
                        </div>
                        <span className={`text-sm font-medium ${getResponseTimeColor(operation.duration)}`}>
                          {formatDuration(operation.duration)}
                        </span>
                      </div>
                      {operation.metadata && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {JSON.stringify(operation.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Percentiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className={getResponseTimeColor(report.stats.averageResponseTime)}>
                      {formatDuration(report.stats.averageResponseTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>95th Percentile:</span>
                    <span className={getResponseTimeColor(report.stats.p95ResponseTime)}>
                      {formatDuration(report.stats.p95ResponseTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>99th Percentile:</span>
                    <span className={getResponseTimeColor(report.stats.p99ResponseTime)}>
                      {formatDuration(report.stats.p99ResponseTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span className="font-medium">{report.stats.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className={getSuccessRateColor(report.stats.successRate)}>
                      {(report.stats.successRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className={report.stats.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}>
                      {(report.stats.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};