export const TEAM_ROLES = {
  owner: {
    name: 'Owner',
    permissions: [
      'team:manage',
      'team:delete',
      'billing:manage',
      'members:invite',
      'members:remove',
      'members:manage-roles',
      'content:generate',
      'content:view-all',
      'content:delete',
      'api:manage',
      'analytics:view',
      'bulk:process',
      'settings:manage'
    ]
  },
  admin: {
    name: 'Admin',
    permissions: [
      'members:invite',
      'members:remove',
      'content:generate',
      'content:view-all',
      'content:delete',
      'api:manage',
      'analytics:view',
      'bulk:process',
      'settings:view'
    ]
  },
  editor: {
    name: 'Editor',
    permissions: [
      'content:generate',
      'content:view-own',
      'content:edit-own',
      'analytics:view-own',
      'bulk:process'
    ]
  },
  viewer: {
    name: 'Viewer',
    permissions: [
      'content:view-shared',
      'analytics:view-shared'
    ]
  }
} as const;

export type TeamRole = keyof typeof TEAM_ROLES;

export function hasTeamPermission(role: TeamRole, permission: string): boolean {
  return TEAM_ROLES[role].permissions.includes(permission);
}

export function canManageRole(userRole: TeamRole, targetRole: TeamRole): boolean {
  const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'];
  const userLevel = roleHierarchy.indexOf(userRole);
  const targetLevel = roleHierarchy.indexOf(targetRole);
  
  return userLevel > targetLevel;
}

export function getAvailableRoles(userRole: TeamRole): TeamRole[] {
  switch (userRole) {
    case 'owner':
      return ['admin', 'editor', 'viewer'];
    case 'admin':
      return ['editor', 'viewer'];
    default:
      return [];
  }
}