'use client';

import * as React from 'react';
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

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
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

export function AppSidebar({ children, ...props }: AppSidebarProps) {
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
      <SidebarProvider>
        <div className="flex h-screen min-w-[256px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Don't render sidebar if no user profile
  if (!userProfile) {
    console.log('No user profile, rendering without sidebar');
    return <div className="min-h-screen pt-16">{children}</div>;
  }

  const isLinkActive = (href: string) => {
    if (href === '/staff' || href === '/leetcode' || href === '/protected') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isOnLeetCodeRoute = pathname.startsWith('/leetcode');

  // Build navigation data based on user profile
  const navigationData = {
    navMain: [
      {
        title: 'Core Features',
        items: [
          {
            title: 'LeetCode',
            url: '/leetcode',
            icon: Code,
            isActive: isLinkActive('/leetcode'),
            subItems: isOnLeetCodeRoute
              ? [
                  {
                    title: 'Configuration',
                    url: '/leetcode',
                    icon: Settings,
                    isActive: pathname === '/leetcode'
                  },
                  ...(userProfile.isStaff
                    ? [
                        {
                          title: 'Overview',
                          url: '/leetcode/overview',
                          icon: BarChart,
                          isActive: isLinkActive('/leetcode/overview')
                        }
                      ]
                    : [])
                ]
              : []
          },
          {
            title: 'Profile',
            url: '/protected',
            icon: User,
            isActive: isLinkActive('/protected')
          }
        ]
      },
      ...(userProfile.isStaff
        ? [
            {
              title: 'Staff Portal',
              items: [
                {
                  title: 'Dashboard',
                  url: '/staff',
                  icon: Users,
                  isActive: isLinkActive('/staff')
                },
                {
                  title: 'Batch Management',
                  url: '/staff/batch',
                  icon: Layers,
                  isActive: isLinkActive('/staff/batch')
                },
                {
                  title: 'Performance',
                  url: '/staff/performance',
                  icon: BarChartBig,
                  isActive: isLinkActive('/staff/performance')
                },
                {
                  title: 'Invitation',
                  url: '/staff/tokens',
                  icon: MailIcon,
                  isActive: isLinkActive('/staff/tokens')
                },
                {
                  title: 'Notifications',
                  url: '/staff/notifications',
                  icon: Bell,
                  isActive: isLinkActive('/staff/notifications')
                }
              ]
            }
          ]
        : [])
    ]
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar {...props} className="top-16 h-[calc(100vh-4rem)]">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">
              {userProfile.isStaff ? 'Staff Portal' : 'Student Portal'}
            </h2>
          </SidebarHeader>
          <SidebarContent>
            {navigationData.navMain.map(group => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(item => (
                      <React.Fragment key={item.title}>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild isActive={item.isActive}>
                            <Link
                              href={item.url}
                              className="flex items-center gap-3"
                            >
                              <item.icon size={18} />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        {/* Render sub-items if they exist */}
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.subItems.map(subItem => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={subItem.isActive}
                                  size="sm"
                                >
                                  <Link
                                    href={subItem.url}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <subItem.icon size={16} />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="pt-16 flex-1">
          <main className="p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
