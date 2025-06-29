'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { hasTeamPermission } from '@/lib/team-roles';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface BulkJob {
  id: string;
  name: string;
  status: string;
  totalItems: number;
  processed: number;
  successful: number;
  failed: number;
  createdAt: string;
  completedAt?: string;
}

interface BulkProcessorProps {
  teamId: string;
  userRole: string;
}

const statusIcons = {
  pending: Clock,
  processing: Clock,
  completed: CheckCircle,
  failed: AlertCircle
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export function BulkProcessor({ teamId, userRole }: BulkProcessorProps) {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const canProcess = hasTeamPermission(userRole as any, 'bulk:process');

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [teamId]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/team/bulk-jobs?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch bulk jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);

    try {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const items = results.data.filter((row: any) => 
            row.productName && row.category && row.writingStyle && row.language
          );

          if (items.length === 0) {
            toast.error('No valid items found in CSV. Please check the format.');
            setUploading(false);
            return;
          }

          if (items.length > 100) {
            toast.error('Maximum 100 items per batch');
            setUploading(false);
            return;
          }

          // Submit bulk job
          const response = await fetch('/api/team/bulk-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId,
              name: file.name.replace('.csv', ''),
              items
            })
          });

          if (response.ok) {
            toast.success('Bulk processing job started');
            fetchJobs();
          } else {
            throw new Error('Failed to start bulk job');
          }
        },
        error: (error) => {
          toast.error('Failed to parse CSV file');
          console.error('CSV parse error:', error);
        }
      });
    } catch (error) {
      toast.error('Failed to process file');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: !canProcess || uploading
  });

  const downloadTemplate = () => {
    const template = `productName,category,writingStyle,language
iPhone 15 Pro,electronics,professional,en
Wireless Headphones,electronics,casual,en
Gaming Laptop,electronics,technical,en`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResults = async (jobId: string) => {
    try {
      const response = await fetch(`/api/team/bulk-jobs/${jobId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk_results_${jobId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to download results');
    }
  };

  if (!canProcess) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Bulk Processing</h3>
          <p className="text-muted-foreground">
            You don't have permission to access bulk processing features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Bulk Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-border hover:border-blue-400 hover:bg-accent/50'
              } ${!canProcess || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div>
                <p className="text-lg font-medium mb-2">
                  {uploading ? 'Processing...' : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Or click to select a file (max 100 items)
                </p>
                <Button variant="outline" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Select File'}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="ghost" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Processing Jobs</h3>
              <p className="text-muted-foreground">
                Upload a CSV file to start bulk processing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => {
                const StatusIcon = statusIcons[job.status as keyof typeof statusIcons];
                const progress = job.totalItems > 0 ? (job.processed / job.totalItems) * 100 : 0;

                return (
                  <motion.div
                    key={job.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{job.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {job.processed}/{job.totalItems} items
                          </span>
                        </div>
                      </div>
                      
                      {job.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResults(job.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {job.status === 'processing' && (
                      <div className="mb-3">
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Successful:</span>
                        <span className="ml-1 font-medium text-green-600">{job.successful}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="ml-1 font-medium text-red-600">{job.failed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <span className="ml-1">{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}