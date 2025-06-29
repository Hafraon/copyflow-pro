'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAvailableRoles } from '@/lib/team-roles';
import { toast } from 'sonner';

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onInviteSent: () => void;
}

export function TeamInviteModal({ isOpen, onClose, teamId, onInviteSent }: TeamInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [sending, setSending] = useState(false);

  const availableRoles = getAvailableRoles('owner'); // Assuming owner is inviting

  const handleInvite = async () => {
    if (!email.trim() || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          email: email.trim(),
          role
        })
      });

      if (response.ok) {
        onInviteSent();
        setEmail('');
        setRole('editor');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send invitation');
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Invite Team Member</span>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={sending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(roleOption => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Role Permissions:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {role === 'admin' && (
                <>
                  <p>• Manage team members and settings</p>
                  <p>• Generate content and view analytics</p>
                  <p>• Manage API keys and bulk processing</p>
                </>
              )}
              {role === 'editor' && (
                <>
                  <p>• Generate content for the team</p>
                  <p>• View own content and analytics</p>
                  <p>• Use bulk processing features</p>
                </>
              )}
              {role === 'viewer' && (
                <>
                  <p>• View shared content</p>
                  <p>• Access shared analytics</p>
                  <p>• Read-only access</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={sending || !email.trim()}>
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}