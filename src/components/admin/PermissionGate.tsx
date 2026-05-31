import React from 'react';
import { useAuth, AdminRole } from '../../context/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles: AdminRole[];
  fallback?: React.ReactNode;
}

export const PermissionGate = ({ children, allowedRoles, fallback = null }: PermissionGateProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
