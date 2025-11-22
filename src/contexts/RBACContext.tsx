import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define permission hierarchy
export enum Permission {
  // Read permissions
  READ_USERS = 'read:users',
  READ_INVOICES = 'read:invoices',
  READ_INVENTORY = 'read:inventory',
  READ_ACCOUNTS = 'read:accounts',
  READ_HR = 'read:hr',
  READ_REPORTS = 'read:reports',
  READ_AUDIT_LOGS = 'read:audit_logs',

  // Write permissions
  WRITE_USERS = 'write:users',
  WRITE_INVOICES = 'write:invoices',
  WRITE_INVENTORY = 'write:inventory',
  WRITE_ACCOUNTS = 'write:accounts',
  WRITE_HR = 'write:hr',
  WRITE_REPORTS = 'write:reports',

  // Delete permissions
  DELETE_USERS = 'delete:users',
  DELETE_INVOICES = 'delete:invoices',
  DELETE_INVENTORY = 'delete:inventory',
  DELETE_ACCOUNTS = 'delete:accounts',
  DELETE_HR = 'delete:hr',

  // Admin permissions
  MANAGE_ROLES = 'manage:roles',
  MANAGE_SETTINGS = 'manage:settings',
  SYSTEM_ADMIN = 'system:admin',
}

// Role definitions with associated permissions
export const ROLE_PERMISSIONS = {
  ADMIN: [
    Permission.READ_USERS, Permission.WRITE_USERS, Permission.DELETE_USERS,
    Permission.READ_INVOICES, Permission.WRITE_INVOICES, Permission.DELETE_INVOICES,
    Permission.READ_INVENTORY, Permission.WRITE_INVENTORY, Permission.DELETE_INVENTORY,
    Permission.READ_ACCOUNTS, Permission.WRITE_ACCOUNTS, Permission.DELETE_ACCOUNTS,
    Permission.READ_HR, Permission.WRITE_HR, Permission.DELETE_HR,
    Permission.READ_REPORTS, Permission.WRITE_REPORTS,
    Permission.READ_AUDIT_LOGS,
    Permission.MANAGE_ROLES, Permission.MANAGE_SETTINGS, Permission.SYSTEM_ADMIN,
  ],
  MANAGER: [
    Permission.READ_USERS, Permission.WRITE_USERS,
    Permission.READ_INVOICES, Permission.WRITE_INVOICES, Permission.DELETE_INVOICES,
    Permission.READ_INVENTORY, Permission.WRITE_INVENTORY, Permission.DELETE_INVENTORY,
    Permission.READ_ACCOUNTS, Permission.WRITE_ACCOUNTS, Permission.DELETE_ACCOUNTS,
    Permission.READ_HR, Permission.WRITE_HR,
    Permission.READ_REPORTS, Permission.READ_AUDIT_LOGS,
  ],
  ACCOUNTANT: [
    Permission.READ_INVOICES, Permission.WRITE_INVOICES,
    Permission.READ_ACCOUNTS, Permission.WRITE_ACCOUNTS, Permission.DELETE_ACCOUNTS,
    Permission.READ_REPORTS, Permission.WRITE_REPORTS,
  ],
  SALES_REP: [
    Permission.READ_INVOICES, Permission.WRITE_INVOICES,
    Permission.READ_INVENTORY, Permission.WRITE_INVENTORY,
  ],
  WAREHOUSE_WORKER: [
    Permission.READ_INVENTORY, Permission.WRITE_INVENTORY,
  ],
  EMPLOYEE: [
    Permission.READ_INVOICES, Permission.READ_INVENTORY,
  ],
  VIEWER: [
    Permission.READ_USERS, Permission.READ_INVOICES,
    Permission.READ_INVENTORY, Permission.READ_ACCOUNTS,
    Permission.READ_HR, Permission.READ_REPORTS,
  ],
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type PermissionType = Permission;

interface UserPermissionsContextType {
  userRole: UserRole | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canRead: (resource: string) => boolean;
  canWrite: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isLoading: boolean;
  updatePermissions: (role: UserRole) => void;
}

// Create context with undefined default (will be provided by provider)
const RBACContext = createContext<UserPermissionsContextType | undefined>(undefined);

// Provider component
export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user permissions on auth
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) {
        setUserRole(null);
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch user role from user_roles table
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.warn('Error fetching user role, using default:', error);
          // Default to VIEWER role if no role found
          assignRole('VIEWER');
          return;
        }

        const role = userRole?.role || 'VIEWER';
        // Map database role to app role
        const roleMap: Record<string, UserRole> = {
          'admin': 'ADMIN',
          'user': 'VIEWER'
        };
        assignRole(roleMap[role] || 'VIEWER');

      } catch (error) {
        console.error('Error loading permissions:', error);
        // Fallback to basic permissions
        assignRole('VIEWER');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  const assignRole = (role: UserRole) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.EMPLOYEE;
    setUserRole(role);
    setPermissions([...rolePermissions]); // Convert readonly array to mutable array
    setIsLoading(false);
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(`read:${resource}` as Permission);
  };

  const canWrite = (resource: string): boolean => {
    return hasPermission(`write:${resource}` as Permission);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`delete:${resource}` as Permission);
  };

  const updatePermissions = (role: UserRole) => {
    assignRole(role);
  };

  const contextValue: UserPermissionsContextType = {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead,
    canWrite,
    canDelete,
    isLoading,
    updatePermissions,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const usePermissions = (): UserPermissionsContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a RBACProvider');
  }
  return context;
};

// Higher-order component for permission checking
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission,
  fallback?: React.ComponentType | null
) => {
  return React.memo((props: P) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  });
};

// Component for conditional rendering based on permissions
export const PermissionGuard: React.FC<{
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const checkPermissions = permission
      ? hasPermission(permission)
      : requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

    return checkPermissions ? <>{children}</> : <>{fallback}</>;
  };

// Import supabase for the provider
import { supabase } from '@/integrations/supabase/client';
