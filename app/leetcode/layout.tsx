'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSidebar from '@/components/global-sidebar';

export default function LeetcodeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSidebar>{children}</GlobalSidebar>
    </QueryClientProvider>
  );
}
