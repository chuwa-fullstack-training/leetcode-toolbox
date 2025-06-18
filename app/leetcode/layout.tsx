'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/components/app-sidebar';

export default function LeetcodeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppSidebar>{children}</AppSidebar>
    </QueryClientProvider>
  );
}
