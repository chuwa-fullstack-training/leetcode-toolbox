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
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { PerformanceEditForm } from './components/performance-edit-form';

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
  performance?: Performance;
};

export default function PerformancePage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function getTrainees() {
      const { data, error } = await supabase
        .from('profile')
        .select('id, email, firstname, lastname, performance');

      if (error) {
        console.error('Error fetching trainees:', error);
        return;
      }

      setTrainees(data || []);
    }

    getTrainees();
  }, []);

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

      // Update local state
      setTrainees(
        trainees.map(t => (t.id === traineeId ? { ...t, performance } : t))
      );

      setOpen(false);
    } catch (error) {
      console.error('Failed to update performance', error);
    }
  };

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

          {trainees.length === 0 ? (
            <p>No trainees found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assignment Completion</TableHead>
                  <TableHead>Quiz Average</TableHead>
                  <TableHead>Leetcode Weekly Avg</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map(trainee => {
                  // Calculate performance metrics
                  const assignments = trainee.performance?.assignments || {
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
                    ? quizScores.reduce((sum, score) => sum + score, 0) /
                      quizScores.length
                    : 0;

                  const leetcode = trainee.performance?.leetcode || {};
                  const leetcodeCompletions = Object.values(leetcode);
                  const avgLeetcode = leetcodeCompletions.length
                    ? leetcodeCompletions.reduce(
                        (sum, count) => sum + count,
                        0
                      ) / leetcodeCompletions.length
                    : 0;

                  return (
                    <TableRow key={trainee.id}>
                      <TableCell>
                        {trainee.firstname} {trainee.lastname}
                      </TableCell>
                      <TableCell>{trainee.email}</TableCell>
                      <TableCell>{avgAssignment.toFixed(1)}%</TableCell>
                      <TableCell>{avgQuiz.toFixed(1)}</TableCell>
                      <TableCell>{avgLeetcode.toFixed(1)}/20</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleEditPerformance(trainee)}
                        >
                          Edit Performance
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
