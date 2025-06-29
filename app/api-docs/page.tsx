'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Key, Book, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function ApiDocsPage() {
  const [language, setLanguage] = useState<'en' | 'ua'>('en');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/generate',
      description: 'Generate product content for a single item',
      permissions: ['content:generate'],
      rateLimit: 'Based on your plan',
      example: {
        request: {
          productName: "iPhone 15 Pro",
          category: "electronics",
          writingStyle: "professional",
          language: "en"
        },
        response: {
          productTitle: "iPhone 15 Pro - Advanced Pro Camera System",
          productDescription: "Experience the most advanced iPhone yet...",
          seoTitle: "iPhone 15 Pro | Advanced Camera & A17 Pro Chip",
          metaDescription: "Discover the iPhone 15 Pro with titanium design...",
          callToAction: "Order now with free delivery",
          keyFeatures: [
            "A17 Pro chip with 6-core GPU",
            "Pro camera system with 5x Telephoto",
            "Titanium design",
            "Action Button",
            "USB-C connectivity"
          ],
          tagsKeywords: [
            "iPhone 15 Pro",
            "Apple smartphone",
            "Pro camera",
            "A17 Pro chip",
            "titanium",
            "5G",
            "iOS 17",
            "premium phone",
            "mobile photography",
            "wireless charging"
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/bulk',
      description: 'Process multiple products in batch (max 100 items)',
      permissions: ['bulk:process'],
      rateLimit: 'Business+ plans only',
      example: {
        request: {
          name: "Electronics Batch #1",
          items: [
            {
              productName: "iPhone 15 Pro",
              category: "electronics",
              writingStyle: "professional",
              language: "en"
            },
            {
              productName: "MacBook Pro M3",
              category: "electronics",
              writingStyle: "technical",
              language: "en"
            }
          ]
        },
        response: {
          jobId: "bulk_123456789",
          status: "pending",
          totalItems: 2,
          message: "Bulk processing job started"
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/bulk?jobId={id}',
      description: 'Get status and results of a bulk processing job',
      permissions: ['bulk:process'],
      rateLimit: 'No limit',
      example: {
        response: {
          jobId: "bulk_123456789",
          name: "Electronics Batch #1",
          status: "completed",
          totalItems: 2,
          processed: 2,
          successful: 2,
          failed: 0,
          createdAt: "2024-01-15T10:00:00Z",
          completedAt: "2024-01-15T10:05:00Z",
          results: [
            {
              success: true,
              data: {
                productTitle: "iPhone 15 Pro - Advanced Pro Camera System",
                // ... full content
              }
            }
          ]
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/usage',
      description: 'Get API usage statistics and analytics',
      permissions: ['analytics:view'],
      rateLimit: 'No limit',
      example: {
        response: {
          period: "30d",
          summary: {
            totalRequests: 1250,
            successfulRequests: 1200,
            failedRequests: 50,
            generationsCount: 1150,
            successRate: 96.0
          },
          dailyUsage: [
            {
              date: "2024-01-15",
              requests: 45
            }
          ],
          endpointUsage: [
            {
              endpoint: "/api/v1/generate",
              requests: 1000
            },
            {
              endpoint: "/api/v1/bulk",
              requests: 250
            }
          ]
        }
      }
    }
  ];

  const rateLimits = [
    { plan: 'Basic', limit: '100 requests/hour', features: ['Standard generation'] },
    { plan: 'Premium', limit: '1,000 requests/hour', features: ['Standard generation', 'Photo analysis', 'URL scraping'] },
    { plan: 'Enterprise', limit: '10,000 requests/hour', features: ['All features', 'Bulk processing', 'Priority support'] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">CopyFlow API Documentation</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Integrate CopyFlow's AI-powered content generation into your applications with our REST API.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Generate high-quality content in seconds with 99.9% uptime
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Key className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  API key authentication with granular permissions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Code className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Developer Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  RESTful API with comprehensive documentation
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="quickstart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Get Your API Key</h3>
                  <p className="text-muted-foreground mb-4">
                    Navigate to your team settings and create a new API key with the required permissions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Make Your First Request</h3>
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(`curl -X POST "https://api.copyflow.com/v1/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productName": "iPhone 15 Pro",
    "category": "electronics",
    "writingStyle": "professional",
    "language": "en"
  }'`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
{`curl -X POST "https://api.copyflow.com/v1/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productName": "iPhone 15 Pro",
    "category": "electronics",
    "writingStyle": "professional",
    "language": "en"
  }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Handle the Response</h3>
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(JSON.stringify(endpoints[0].example.response, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(endpoints[0].example.response, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </CardTitle>
                      <div className="flex space-x-2">
                        {endpoint.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Rate Limit</h4>
                      <p className="text-sm text-muted-foreground">{endpoint.rateLimit}</p>
                    </div>

                    {endpoint.example.request && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Request Example</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.example.request, null, 2))}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            {JSON.stringify(endpoint.example.request, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Response Example</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(endpoint.example.response, null, 2))}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-gray-300 overflow-x-auto">
                          {JSON.stringify(endpoint.example.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  All API requests must include your API key in the Authorization header using Bearer authentication.
                </p>

                <div>
                  <h3 className="font-semibold mb-2">Header Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
                      Authorization: Bearer YOUR_API_KEY
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Error Responses</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-gray-300">
{`// 401 Unauthorized
{
  "error": "Invalid or missing API key"
}

// 403 Forbidden
{
  "error": "Insufficient permissions"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  
                  <h3 className="font-semibold mb-2">Permissions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">content:generate</Badge>
                      <span className="text-sm">Generate product descriptions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">bulk:process</Badge>
                      <span className="text-sm">Process bulk requests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">analytics:view</Badge>
                      <span className="text-sm">Access usage analytics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">*</Badge>
                      <span className="text-sm">All permissions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rateLimits.map((limit, index) => (
                    <motion.div
                      key={limit.plan}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{limit.plan}</h3>
                        <Badge variant="outline">{limit.limit}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {limit.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Rate Limit Headers</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Every API response includes rate limit information in the headers:
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}