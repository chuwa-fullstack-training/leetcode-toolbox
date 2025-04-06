'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/leetcode/sidebar';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function LeetcodeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        if (error || !user) {
          setIsAdmin(false);
          return;
        }

        // Check if user has admin role in any of the possible locations
        const hasAdminRole =
          user?.app_metadata?.role === 'admin' ||
          user?.user_metadata?.role === 'admin' ||
          user?.app_metadata?.is_admin === true ||
          user?.user_metadata?.is_admin === true;

        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {!isLoading && isAdmin ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </QueryClientProvider>
  );
}
