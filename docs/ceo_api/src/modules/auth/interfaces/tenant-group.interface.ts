export interface AvailableTenant {
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
  displayName: string;
  displayOrder: number;
  isDefault: boolean;
  accessLevel: string | null;
  canSwitch: boolean;
}

export interface TenantGroup {
  tenantGroupId: number;
  tenantGroupName: string;
  tenantGroupCode: string;
  tenants: AvailableTenant[];
}

export interface UserTenantAccess {
  email: string;
  tenantId: number;
  tenantGroupId: number;
  canAccess: boolean;
  canSwitch: boolean;
  accessLevel: string | null;
  grantedAt: Date;
  revokedAt: Date | null;
}
