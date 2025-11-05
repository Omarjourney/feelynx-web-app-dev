export type Role = 'viewer' | 'creator' | 'moderator' | 'admin' | 'compliance' | 'finance';

export interface PolicyCheck {
  action: string;
  resource: string;
}

const roleMatrix: Record<Role, PolicyCheck[]> = {
  viewer: [
    { action: 'read', resource: 'stream' },
    { action: 'create', resource: 'tip' }
  ],
  creator: [
    { action: 'read', resource: 'stream' },
    { action: 'create', resource: 'stream' },
    { action: 'update', resource: 'profile' },
    { action: 'manage', resource: 'inventory' }
  ],
  moderator: [
    { action: 'review', resource: 'content' },
    { action: 'ban', resource: 'user' },
    { action: 'read', resource: 'audit-log' }
  ],
  admin: [
    { action: 'manage', resource: 'platform' },
    { action: 'read', resource: 'audit-log' },
    { action: 'manage', resource: 'billing' }
  ],
  compliance: [
    { action: 'read', resource: 'kyc' },
    { action: 'process', resource: 'dsar' },
    { action: 'hold', resource: 'legal' }
  ],
  finance: [
    { action: 'read', resource: 'ledger' },
    { action: 'approve', resource: 'payout' },
    { action: 'review', resource: 'fraud' }
  ]
};

export const can = (roles: Role[] = [], action: string, resource: string) => {
  return roles.some((role) =>
    roleMatrix[role]?.some((check) => check.action === action && check.resource === resource)
  );
};

export const requiresStepUp = (roles: Role[] = [], action: string, resource: string) => {
  if (resource === 'payout' || resource === 'legal') {
    return true;
  }

  if (resource === 'audit-log') {
    return !roles.includes('compliance') && !roles.includes('admin');
  }

  return false;
};
