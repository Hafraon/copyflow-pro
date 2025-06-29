'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { hasTeamPermission } from '@/lib/team-roles';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  usageCount: number;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ApiKeyManagerProps {
  teamId: string;
  userRole: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'content:generate', label: 'Generate Content', description: 'Create product descriptions' },
  { id: 'bulk:process', label: 'Bulk Processing', description: 'Process multiple items at once' },
  { id: 'analytics:view', label: 'View Analytics', description: 'Access usage statistics' },
  { id: '*', label: 'All Permissions', description: 'Full API access' }
];

export function ApiKeyManager({ teamId, userRole }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['content:generate']);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const canManageKeys = hasTeamPermission(userRole as any, 'api:manage');

  useEffect(() => {
    fetchApiKeys();
  }, [teamId]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`/api/v1/keys?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) {
      toast.error('Please provide a name and select at least one permission');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          name: newKeyName,
          permissions: selectedPermissions
        })
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys(prev => [newKey, ...prev]);
        setShowCreateDialog(false);
        setNewKeyName('');
        setSelectedPermissions(['content:generate']);
        toast.success('API key created successfully');
        
        // Show the full key temporarily
        setVisibleKeys(prev => new Set(prev).add(newKey.id));
        setTimeout(() => {
          setVisibleKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(newKey.id);
            return newSet;
          });
        }, 30000); // Hide after 30 seconds
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/keys?keyId=${keyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast.success('API key deleted');
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>API Keys</span>
          </CardTitle>
          
          {canManageKeys && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                    />
                  </div>
                  
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      {AVAILABLE_PERMISSIONS.map(permission => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions(prev => [...prev, permission.id]);
                              } else {
                                setSelectedPermissions(prev => prev.filter(p => p !== permission.id));
                              }
                            }}
                          />
                          <div>
                            <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                              {permission.label}
                            </label>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={creating}>
                      {creating ? 'Creating...' : 'Create Key'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No API Keys</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API key to start using the CopyFlow API.
            </p>
            {canManageKeys && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{apiKey.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Used {apiKey.usageCount} times
                      </span>
                    </div>
                  </div>
                  
                  {canManageKeys && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">API Key</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key}
                        readOnly
                        className="font-mono text-sm"
                        type={visibleKeys.has(apiKey.id) ? 'text' : 'password'}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Permissions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {apiKey.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission === '*' ? 'All Permissions' : permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.lastUsed && (
                      <span> • Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}