'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Plus, Settings, Key, BarChart3, Upload, Crown, Shield, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { TeamMembersList } from '@/components/TeamMembersList';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { TeamInviteModal } from '@/components/TeamInviteModal';
import { BulkProcessor } from '@/components/BulkProcessor';
import { TeamAnalytics } from '@/components/TeamAnalytics';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      name: string;
      email: string;
      image?: string;
    };
    joinedAt: string;
  }>;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: Eye
};

const roleColors = {
  owner: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ua'>('en');
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTeam();
    }
  }, [session]);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      }
    } catch (error) {
      console.error('Failed to fetch team:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !team) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
            <p className="text-muted-foreground mb-4">
              You don't have access to any team or the team doesn't exist.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const userMember = team.members.find(m => m.user.email === session.user?.email);
  const userRole = userMember?.role || 'viewer';
  const canManageTeam = ['owner', 'admin'].includes(userRole);
  const canInvite = ['owner', 'admin'].includes(userRole);

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="capitalize">
                  {team.plan} Plan
                </Badge>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {canInvite && (
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {/* User Role Badge */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Your role:</span>
              <Badge className={roleColors[userRole as keyof typeof roleColors]}>
                {React.createElement(roleIcons[userRole as keyof typeof roleIcons], { className: "w-3 h-3 mr-1" })}
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Bulk Processing</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <TeamMembersList 
              team={team} 
              userRole={userRole}
              onMemberUpdate={fetchTeam}
            />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager teamId={team.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkProcessor teamId={team.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="analytics">
            <TeamAnalytics teamId={team.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Team Name</label>
                    <p className="text-sm text-muted-foreground">{team.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <p className="text-sm text-muted-foreground capitalize">{team.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {userRole === 'owner' && (
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                      <Button variant="destructive" size="sm">
                        Delete Team
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {showInviteModal && (
        <TeamInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamId={team.id}
          onInviteSent={() => {
            setShowInviteModal(false);
            toast.success('Invitation sent successfully');
          }}
        />
      )}
    </div>
  );
}