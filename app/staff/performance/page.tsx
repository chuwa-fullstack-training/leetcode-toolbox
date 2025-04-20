'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState
} from '@tanstack/react-table';
import { PerformanceEditForm } from './components/performance-edit-form';
import { Pencil } from 'lucide-react';

// Type definitions for performance data
type Assignment = {
  check1: number; // Percentage (0-100)
  check2: number; // Percentage (0-100)
  check3: number; // Percentage (0-100)
};

type Quiz = {
  [weekNumber: string]: number; // Score for each week
};

type Leetcode = {
  [weekNumber: string]: number; // Number of completed questions (out of 20)
};

type Performance = {
  assignments: Assignment;
  quizzes: Quiz;
  leetcode: Leetcode;
};

type Trainee = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  batchId?: string;
  performance?: Performance;
  // Computed properties for the table
  fullName?: string;
  assignmentAvg?: number;
  quizAvg?: number;
  leetcodeAvg?: number;
  overallScore?: number;
};

type BatchType = 'js-fullstack' | 'java-backend' | 'ai-ml';

type Batch = {
  id: string;
  name: string;
  type: BatchType;
  trainer: string;
  startDate: string;
};

export default function PerformancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [nameFilter, setNameFilter] = useState<string>('');

  // Calculate trainee average performance
  function calculateTraineePerformance(trainee: Trainee): number {
    if (!trainee.performance) return 0;

    const assignments = trainee.performance.assignments || {
      check1: 0,
      check2: 0,
      check3: 0
    };
    const avgAssignment =
      (assignments.check1 + assignments.check2 + assignments.check3) / 3;

    const quizzes = trainee.performance.quizzes || {};
    const quizScores = Object.values(quizzes) as number[];
    const avgQuiz = quizScores.length
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
      : 0;

    const leetcode = trainee.performance.leetcode || {};
    const leetcodeCompletions = Object.values(leetcode) as number[];
    const avgLeetcode = leetcodeCompletions.length
      ? (leetcodeCompletions.reduce((sum, count) => sum + count, 0) /
          leetcodeCompletions.length) *
        5 // Scale to 100
      : 0;

    // Weighted average: 40% assignments, 30% quizzes, 30% leetcode
    return avgAssignment * 0.4 + avgQuiz * 0.3 + avgLeetcode * 0.3;
  }

  // Fetch batches and trainees
  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // Fetch batches
      const { data: batchData, error: batchError } = await supabase
        .from('batch')
        .select('*');

      if (batchError) {
        console.error('Error fetching batches:', batchError);
      } else {
        setBatches(batchData || []);
        // Set the first batch as selected by default if available
        if (batchData && batchData.length > 0) {
          setSelectedBatchId(batchData[0].id);
        }
      }

      // Fetch trainees with their profile and performance data
      const { data: traineeData, error: traineeError } = await supabase
        .from('profile')
        .select(
          'id, email, firstname, lastname, batchId:batch_id, performance'
        );

      if (traineeError) {
        console.error('Error fetching trainees:', traineeError);
      } else {
        // Process trainee data to add computed properties
        const processedTrainees = (traineeData || []).map(trainee => {
          // Calculate performance metrics
          const assignments = trainee.performance?.assignments || {
            check1: 0,
            check2: 0,
            check3: 0
          };
          const avgAssignment =
            (assignments.check1 + assignments.check2 + assignments.check3) / 3;

          const quizzes = trainee.performance?.quizzes || {};
          const quizScores = Object.values(quizzes) as number[];
          const avgQuiz = quizScores.length
            ? quizScores.reduce((sum, score) => sum + score, 0) /
              quizScores.length
            : 0;

          const leetcode = trainee.performance?.leetcode || {};
          const leetcodeCompletions = Object.values(leetcode) as number[];
          const avgLeetcode = leetcodeCompletions.length
            ? leetcodeCompletions.reduce((sum, count) => sum + count, 0) /
              leetcodeCompletions.length
            : 0;

          const overallScore = calculateTraineePerformance(trainee);

          return {
            ...trainee,
            fullName: `${trainee.firstname} ${trainee.lastname}`,
            assignmentAvg: avgAssignment,
            quizAvg: avgQuiz,
            leetcodeAvg: avgLeetcode,
            overallScore
          };
        });

        setTrainees(processedTrainees);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Filter trainees when batch selection changes
  useEffect(() => {
    if (selectedBatchId) {
      setFilteredTrainees(
        trainees.filter(trainee => trainee.batchId === selectedBatchId)
      );
    } else {
      setFilteredTrainees(trainees);
    }
  }, [selectedBatchId, trainees]);

  const handleEditPerformance = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setOpen(true);
  };

  const handleSavePerformance = async (
    traineeId: string,
    performance: Performance
  ) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profile')
        .update({ performance })
        .eq('id', traineeId);

      if (error) {
        console.error('Error updating performance:', error);
        return;
      }

      // Update local state by re-fetching all data
      const { data } = await supabase
        .from('profile')
        .select(
          'id, email, firstname, lastname, batchId:batch_id, performance'
        );

      if (data) {
        // Process trainee data as before
        const processedTrainees = data.map(trainee => {
          const overallScore = calculateTraineePerformance(trainee);
          return {
            ...trainee,
            fullName: `${trainee.firstname} ${trainee.lastname}`,
            overallScore
          };
        });

        setTrainees(processedTrainees);
      }

      setOpen(false);
    } catch (error) {
      console.error('Failed to update performance', error);
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Trainee>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => <div>{row.original.fullName}</div>,
        filterFn: 'includesString',
        enableSorting: true
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <div>{row.original.email}</div>,
        enableSorting: true
      },
      {
        accessorKey: 'assignmentAvg',
        header: 'Assignment Completion',
        cell: ({ row }) => <div>{row.original.assignmentAvg?.toFixed(1)}%</div>,
        enableSorting: true
      },
      {
        accessorKey: 'quizAvg',
        header: 'Quiz Average',
        cell: ({ row }) => <div>{row.original.quizAvg?.toFixed(1)}</div>,
        enableSorting: true
      },
      {
        accessorKey: 'leetcodeAvg',
        header: 'Leetcode Weekly Avg',
        cell: ({ row }) => <div>{row.original.leetcodeAvg?.toFixed(1)}/20</div>,
        enableSorting: true
      },
      {
        accessorKey: 'overallScore',
        header: 'Overall Score',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.overallScore! > 75
                ? 'default'
                : row.original.overallScore! > 50
                  ? 'secondary'
                  : 'outline'
            }
          >
            {row.original.overallScore?.toFixed(1)}%
          </Badge>
        ),
        enableSorting: true,
        filterFn: (row, id, value) => {
          const score = row.original.overallScore || 0;
          const [min, max] = value;
          return score >= min && score <= max;
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="outline"
            onClick={() => handleEditPerformance(row.original)}
          >
            <Pencil />
          </Button>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredTrainees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters
  });

  // Debounce effect for name filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      table.getColumn('fullName')?.setFilterValue(nameFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nameFilter, table]);

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Trainee Performance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Track trainee performance across assignments, quizzes, and leetcode
            challenges.
          </p>

          {/* Batch selection dropdown */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Select Batch
            </label>
            <Select
              value={selectedBatchId}
              onValueChange={setSelectedBatchId}
              disabled={loading}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(batch => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtering controls */}
          <div className="flex items-center py-4 gap-4">
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={event => setNameFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">
                  Loading performance data...
                </p>
              </div>
            </div>
          ) : filteredTrainees.length === 0 ? (
            <p>No trainees found for the selected batch.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed performance view for selected trainee */}
      {selectedTrainee && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Performance Details: {selectedTrainee.firstname}{' '}
            {selectedTrainee.lastname}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Three assignment checkpoints during training.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check 1</TableHead>
                      <TableHead>Check 2</TableHead>
                      <TableHead>Check 3</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {selectedTrainee.performance?.assignments?.check1 || 0}%
                      </TableCell>
                      <TableCell>
                        {selectedTrainee.performance?.assignments?.check2 || 0}%
                      </TableCell>
                      <TableCell>
                        {selectedTrainee.performance?.assignments?.check3 || 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Weekly quiz scores during training.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTrainee.performance?.quizzes &&
                    Object.keys(selectedTrainee.performance.quizzes).length >
                      0 ? (
                      Object.entries(selectedTrainee.performance.quizzes)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([week, score]) => (
                          <TableRow key={week}>
                            <TableCell>Week {week}</TableCell>
                            <TableCell>{score}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>
                          No quiz data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leetcode Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Weekly leetcode completion (out of 20 questions).
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTrainee.performance?.leetcode &&
                    Object.keys(selectedTrainee.performance.leetcode).length >
                      0 ? (
                      Object.entries(selectedTrainee.performance.leetcode)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([week, count]) => (
                          <TableRow key={week}>
                            <TableCell>Week {week}</TableCell>
                            <TableCell>{count}/20</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>
                          No leetcode data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Performance Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Performance for {selectedTrainee?.firstname}{' '}
              {selectedTrainee?.lastname}
            </DialogTitle>
          </DialogHeader>
          {selectedTrainee && (
            <PerformanceEditForm
              trainee={selectedTrainee}
              onSave={handleSavePerformance}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
