import Link from 'next/link';

export function Sidebar() {
  return (
    <div className="w-64 h-full border-r bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Leetcode Tools</h2>
        <nav className="space-y-2">
          <Link
            href="/leetcode"
            className="block px-4 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Configuration
          </Link>
          {/* Add more navigation items here */}
        </nav>
      </div>
    </div>
  );
}
