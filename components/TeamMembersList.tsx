'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Edit, Eye, MoreHorizontal, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { hasTeamPermission, getAvailableRoles } from '@/lib/team-roles';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  role: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamMembersListProps {
  team: Team;
  userRole: string;
  onMemberUpdate: () => void;
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

export function TeamMembersList({ team, userRole, onMemberUpdate }: TeamMembersListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const canManageMembers = hasTeamPermission(userRole as any, 'members:remove');
  const availableRoles = getAvailableRoles(userRole as any);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setLoading(memberId);
    try {
      const response = await fetch('/api/team/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          memberId,
          role: newRole
        })
      });

      if (response.ok) {
        toast.success('Member role updated');
        onMemberUpdate();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update member role');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setLoading(memberId);
    try {
      const response = await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          memberId
        })
      });

      if (response.ok) {
        toast.success('Member removed');
        onMemberUpdate();
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.members.map((member, index) => {
            const IconComponent = roleIcons[member.role as keyof typeof roleIcons];
            const isCurrentUser = member.user.email === userRole; // This should be session.user.email
            const canManageThisMember = canManageMembers && !isCurrentUser && member.role !== 'owner';

            return (
              <motion.div
                key={member.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user.image} alt={member.user.name} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{member.user.name || 'Unknown'}</h3>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                    <IconComponent className="w-3 h-3 mr-1" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>

                  {canManageThisMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={loading === member.id}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {availableRoles.map(role => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(member.id, role)}
                            disabled={role === member.role}
                          >
                            Change to {role.charAt(0).toUpperCase() + role.slice(1)}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}