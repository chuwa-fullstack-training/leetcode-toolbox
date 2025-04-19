'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';
import { Calendar, Users, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

// Type definitions
type BatchType = 'js-fullstack' | 'java-backend' | 'ai-ml';

type Batch = {
  id: string;
  name: string;
  type: BatchType;
  trainer: string;
  startDate: string;
};

type Trainee = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  batchId: string;
  performance?: {
    assignments?: {
      check1: number;
      check2: number;
      check3: number;
    };
    quizzes?: Record<string, number>;
    leetcode?: Record<string, number>;
  };
};

// Get readable batch type display
function getBatchTypeDisplay(type: BatchType): string {
  switch (type) {
    case 'js-fullstack':
      return 'JavaScript Fullstack';
    case 'java-backend':
      return 'Java Backend';
    case 'ai-ml':
      return 'AI/ML';
    default:
      return type;
  }
}

// Get batch badge variant based on type
function getBatchBadgeVariant(
  type: BatchType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'js-fullstack':
      return 'default';
    case 'java-backend':
      return 'secondary';
    case 'ai-ml':
      return 'outline';
    default:
      return 'default';
  }
}

// Get trainer name by ID
function getTrainerName(trainerId: string): string {
  const trainers: Record<string, string> = {
    '1': 'Aaron',
    '2': 'Ben',
    '3': 'Johnny'
  };

  return trainers[trainerId] || 'Unknown';
}

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
  const quizScores = Object.values(quizzes);
  const avgQuiz = quizScores.length
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
    : 0;

  const leetcode = trainee.performance.leetcode || {};
  const leetcodeCompletions = Object.values(leetcode);
  const avgLeetcode = leetcodeCompletions.length
    ? (leetcodeCompletions.reduce((sum, count) => sum + count, 0) /
        leetcodeCompletions.length) *
      5 // Scale to 100
    : 0;

  // Weighted average: 40% assignments, 30% quizzes, 30% leetcode
  return avgAssignment * 0.4 + avgQuiz * 0.3 + avgLeetcode * 0.3;
}

export default function StaffDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        setTrainees(traineeData || []);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Group trainees by batch
  const traineesByBatch: Record<string, Trainee[]> = {};
  trainees.forEach(trainee => {
    if (trainee.batchId) {
      if (!traineesByBatch[trainee.batchId]) {
        traineesByBatch[trainee.batchId] = [];
      }
      traineesByBatch[trainee.batchId].push(trainee);
    }
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of all training batches and trainees
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading batch data...</p>
          </div>
        </div>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Batches Found</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no training batches in the system.
              </p>
              <Link
                href="/staff/batch"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create First Batch
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {batches.map(batch => {
            const batchTrainees = traineesByBatch[batch.id] || [];
            const avgPerformance = batchTrainees.length
              ? batchTrainees.reduce(
                  (sum, trainee) => sum + calculateTraineePerformance(trainee),
                  0
                ) / batchTrainees.length
              : 0;

            return (
              <Card key={batch.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{batch.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={getBatchBadgeVariant(
                            batch.type as BatchType
                          )}
                        >
                          {getBatchTypeDisplay(batch.type as BatchType)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {batch.startDate
                            ? format(new Date(batch.startDate), 'MMM d, yyyy')
                            : 'No date'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Trainer: {getTrainerName(batch.trainer)}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {batchTrainees.length} trainees
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {batchTrainees.length > 0 ? (
                    <>
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Trainee Summary</h3>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              Avg. Performance: {avgPerformance.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Leetcode</TableHead>
                            <TableHead className="text-right">
                              Overall
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchTrainees.map(trainee => {
                            // Calculate metrics
                            const assignments = trainee.performance
                              ?.assignments || {
                              check1: 0,
                              check2: 0,
                              check3: 0
                            };
                            const avgAssignment =
                              (assignments.check1 +
                                assignments.check2 +
                                assignments.check3) /
                              3;

                            const quizzes = trainee.performance?.quizzes || {};
                            const quizScores = Object.values(quizzes);
                            const avgQuiz = quizScores.length
                              ? quizScores.reduce(
                                  (sum, score) => sum + score,
                                  0
                                ) / quizScores.length
                              : 0;

                            const leetcode =
                              trainee.performance?.leetcode || {};
                            const leetcodeCompletions = Object.values(leetcode);
                            const avgLeetcode = leetcodeCompletions.length
                              ? leetcodeCompletions.reduce(
                                  (sum, count) => sum + count,
                                  0
                                ) / leetcodeCompletions.length
                              : 0;

                            const overall =
                              calculateTraineePerformance(trainee);

                            return (
                              <TableRow key={trainee.id}>
                                <TableCell className="font-medium">
                                  {trainee.firstname} {trainee.lastname}
                                </TableCell>
                                <TableCell>{trainee.email}</TableCell>
                                <TableCell>
                                  {avgAssignment.toFixed(1)}%
                                </TableCell>
                                <TableCell>{avgQuiz.toFixed(1)}</TableCell>
                                <TableCell>
                                  {avgLeetcode.toFixed(1)}/20
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={
                                      overall > 75
                                        ? 'default'
                                        : overall > 50
                                          ? 'secondary'
                                          : 'outline'
                                    }
                                  >
                                    {overall.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        No trainees assigned to this batch yet.
                      </p>
                      <Link
                        href="/staff/tokens"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Generate invitation tokens
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
