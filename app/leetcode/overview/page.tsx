'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

export default function LeetcodeOverview() {
  const [leetcodeSessions, setLeetcodeSessions] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    async function getLeetcodeSessions() {
      const { data } = await supabase
        .from('leetcode')
        .select('id, name, leetcode_id, sessionStr, created_at, updated_at');
      setLeetcodeSessions(data);
    }
    getLeetcodeSessions();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>LeetCode Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {leetcodeSessions?.length === 0 ? (
            <p>No LeetCode sessions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>LeetCode ID</TableHead>
                  <TableHead>Session String</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leetcodeSessions?.map((session: any) => (
                  <TableRow
                    key={session.id}
                    onClick={() => {
                      router.push(`/leetcode/analytics?id=${session.id}`);
                    }}
                  >
                    <TableCell>{session.name}</TableCell>
                    <TableCell>{session.leetcode_id}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {session.sessionStr}
                    </TableCell>
                    <TableCell>
                      {dayjs(session.updated_at).format('MM/DD/YYYY HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
