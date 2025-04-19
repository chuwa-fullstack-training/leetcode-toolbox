'use client';

import Link from 'next/link';
import { Users, Layers, BarChartBig, UserCircle, Key } from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 h-screen border-r bg-sidebar text-sidebar-foreground fixed">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Staff Portal</h2>
          <nav className="space-y-2">
            <div className="mb-6">
              <Link
                href="/staff"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Users size={18} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="mb-6">
              <Link
                href="/staff/batch"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Layers size={18} />
                <span>Batch Management</span>
              </Link>
            </div>

            <div className="mb-6">
              <Link
                href="/staff/performance"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <BarChartBig size={18} />
                <span>Performance</span>
              </Link>
            </div>

            <div className="mb-6">
              <Link
                href="/staff/profile"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <UserCircle size={18} />
                <span>Profile</span>
              </Link>
            </div>

            <div className="mb-6">
              <Link
                href="/staff/tokens"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Key size={18} />
                <span>Tokens</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}