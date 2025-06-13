'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LeetCodeSession {
  id: string;
  name: string;
  leetcode_id: string;
  sessionStr: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profile?: {
    batch_id: string;
    batch?: {
      id: string;
      name: string;
      type: string;
    } | null;
  } | null;
}

interface Batch {
  id: string;
  name: string;
  type: string;
}

export default function LeetcodeOverview() {
  const [leetcodeSessions, setLeetcodeSessions] = useState<LeetCodeSession[]>(
    []
  );
  const [filteredSessions, setFilteredSessions] = useState<LeetCodeSession[]>(
    []
  );
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        // Fetch LeetCode sessions with batch information
        const { data: sessionsData } = await supabase.from('leetcode').select(`
            id, 
            name, 
            leetcode_id, 
            sessionStr, 
            created_at, 
            updated_at,
            user_id
          `);

        // Fetch profiles with batch information
        const { data: profilesData } = await supabase.from('profile').select(`
            user_id,
            batch_id,
            batch:batch_id (
              id,
              name,
              type
            )
          `);

        // Fetch all batches for the dropdown
        const { data: batchesData } = await supabase
          .from('batch')
          .select('id, name, type')
          .order('name');

        // Combine sessions with profile data
        const combinedData: LeetCodeSession[] = (sessionsData || []).map(
          (session: any) => {
            const profile = profilesData?.find(
              (p: any) => p.user_id === session.user_id
            );
            return {
              ...session,
              profile: profile
                ? {
                    batch_id: profile.batch_id,
                    batch: Array.isArray(profile.batch)
                      ? profile.batch[0]
                      : profile.batch
                  }
                : null
            };
          }
        );

        setLeetcodeSessions(combinedData);
        setBatches(batchesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter sessions based on selected batch
  useEffect(() => {
    if (selectedBatch === 'all') {
      setFilteredSessions(leetcodeSessions);
    } else {
      setFilteredSessions(
        leetcodeSessions.filter(
          session => session.profile?.batch?.id === selectedBatch
        )
      );
    }
  }, [leetcodeSessions, selectedBatch]);

  const handleBatchChange = (value: string) => {
    setSelectedBatch(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>LeetCode Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>LeetCode Sessions</CardTitle>
            <div className="w-64">
              <Select value={selectedBatch} onValueChange={handleBatchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions?.length === 0 ? (
            <p>
              No LeetCode sessions found
              {selectedBatch !== 'all' ? ' for selected batch' : ''}.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>LeetCode ID</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Session String</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions?.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>{session.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/leetcode/analytics?id=${session.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {session.leetcode_id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {session.profile?.batch ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {session.profile.batch.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No batch
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono">
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
