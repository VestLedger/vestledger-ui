"use client";

import { useAuth } from "@/contexts/auth-context";
import { resolveRoleDashboard } from "@/config/role-dashboards";

export function HomeDashboard() {
  const { user } = useAuth();
  const Dashboard = resolveRoleDashboard(user?.role);
  return <Dashboard />;
}
