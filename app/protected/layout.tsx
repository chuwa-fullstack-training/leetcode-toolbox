'use client';

import { AppSidebar } from '@/components/app-sidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <AppSidebar>{children}</AppSidebar>;
}
