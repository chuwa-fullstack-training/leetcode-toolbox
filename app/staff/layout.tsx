'use client';

import GlobalSidebar from '@/components/global-sidebar';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return <GlobalSidebar>{children}</GlobalSidebar>;
}
