'use client';

import { AppSidebar } from '@/components/app-sidebar';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return <AppSidebar>{children}</AppSidebar>;
}
