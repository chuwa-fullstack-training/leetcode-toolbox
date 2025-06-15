'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Layers,
  BarChartBig,
  MailIcon,
  Bell,
  Code,
  User,
  Settings,
  BarChart
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/app/protected/actions';

interface GlobalSidebarProps {
  children: React.ReactNode;
}

type UserProfile = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  isStaff: boolean;
  isTrainee: boolean;
  isTrainer: boolean;
} | null;

export default function GlobalSidebar({ children }: GlobalSidebarProps) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        console.log('Fetching user profile...');
        const profile = await getUserProfile();
        console.log('User profile result:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r bg-sidebar text-sidebar-foreground z-10">
          <div className="p-4 h-full overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 ml-64">
          <main className="p-6 h-full overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

  // Don't render sidebar if no user profile
  if (!userProfile) {
    console.log('No user profile, rendering without sidebar');
    return <div className="flex-1">{children}</div>;
  }

  const isLinkActive = (href: string) => {
    if (href === '/staff' || href === '/leetcode' || href === '/protected') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getLinkClasses = (href: string) => {
    const baseClasses =
      'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors';
    return isLinkActive(href)
      ? `${baseClasses} bg-sidebar-accent text-sidebar-accent-foreground`
      : baseClasses;
  };

  const getSubLinkClasses = (href: string) => {
    const baseClasses =
      'flex items-center gap-3 px-6 py-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm';
    return isLinkActive(href)
      ? `${baseClasses} bg-sidebar-accent text-sidebar-accent-foreground`
      : baseClasses;
  };

  const isOnLeetCodeRoute = pathname.startsWith('/leetcode');

  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r bg-sidebar text-sidebar-foreground z-10">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">
            {userProfile.isStaff ? 'Staff Portal' : 'Student Portal'}
          </h2>

          <nav className="space-y-2">
            {/* LeetCode - Available to all users */}
            <div className="mb-4">
              <Link href="/leetcode" className={getLinkClasses('/leetcode')}>
                <Code size={18} />
                <span>LeetCode</span>
              </Link>

              {/* LeetCode sub-navigation - only show when on LeetCode route */}
              {isOnLeetCodeRoute && (
                <div className="mt-2 space-y-1">
                  <Link
                    href="/leetcode"
                    className={getSubLinkClasses('/leetcode')}
                  >
                    <Settings size={16} />
                    <span>Configuration</span>
                  </Link>
                  {/* Overview is only available to staff */}
                  {userProfile.isStaff && (
                    <Link
                      href="/leetcode/overview"
                      className={getSubLinkClasses('/leetcode/overview')}
                    >
                      <BarChart size={16} />
                      <span>Overview</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Profile - Available to all users */}
            <div className="mb-6">
              <Link href="/protected" className={getLinkClasses('/protected')}>
                <User size={18} />
                <span>Profile</span>
              </Link>
            </div>

            {/* Staff-only navigation */}
            {userProfile.isStaff && (
              <>
                <div className="mb-6">
                  <Link href="/staff" className={getLinkClasses('/staff')}>
                    <Users size={18} />
                    <span>Dashboard</span>
                  </Link>
                </div>

                <div className="mb-6">
                  <Link
                    href="/staff/batch"
                    className={getLinkClasses('/staff/batch')}
                  >
                    <Layers size={18} />
                    <span>Batch Management</span>
                  </Link>
                </div>

                <div className="mb-6">
                  <Link
                    href="/staff/performance"
                    className={getLinkClasses('/staff/performance')}
                  >
                    <BarChartBig size={18} />
                    <span>Performance</span>
                  </Link>
                </div>

                <div className="mb-6">
                  <Link
                    href="/staff/tokens"
                    className={getLinkClasses('/staff/tokens')}
                  >
                    <MailIcon size={18} />
                    <span>Invitation</span>
                  </Link>
                </div>

                <div className="mb-6">
                  <Link
                    href="/staff/notifications"
                    className={getLinkClasses('/staff/notifications')}
                  >
                    <Bell size={18} />
                    <span>Notifications</span>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main content with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        <main className="p-6 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
