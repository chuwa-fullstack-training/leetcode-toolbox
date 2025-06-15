'use client';

import GlobalSidebar from '@/components/global-sidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <GlobalSidebar>{children}</GlobalSidebar>;
}
