'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Performance categories
type PerformanceCategory = 'assignments' | 'quizzes' | 'leetcode';

// Schema for the performance data
const performanceSchema = z.object({
  assignments: z.object({
    check1: z.coerce.number().min(0).max(100),
    check2: z.coerce.number().min(0).max(100),
    check3: z.coerce.number().min(0).max(100)
  }),
  quizzes: z.record(z.string(), z.coerce.number().min(0).max(100)),
  leetcode: z.record(z.string(), z.coerce.number().min(0).max(20))
});

type PerformanceFormValues = z.infer<typeof performanceSchema>;

export interface Trainee {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  performance?: {
    assignments?: {
      check1: number;
      check2: number;
      check3: number;
    };
    quizzes?: Record<string, number>;
    leetcode?: Record<string, number>;
  };
}

interface PerformanceEditFormProps {
  trainee: Trainee;
  onSave: (traineeId: string, performance: PerformanceFormValues) => void;
}

export function PerformanceEditForm({ trainee, onSave }: PerformanceEditFormProps) {
  const [activeCategory, setActiveCategory] = useState<PerformanceCategory>('assignments');
  
  const [quizWeeks, setQuizWeeks] = useState<string[]>(
    trainee.performance?.quizzes ? Object.keys(trainee.performance.quizzes).sort() : ['1']
  );
  
  const [leetcodeWeeks, setLeetcodeWeeks] = useState<string[]>(
    trainee.performance?.leetcode ? Object.keys(trainee.performance.leetcode).sort() : ['1']
  );

  // Initialize form with existing data or default values
  const form = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      assignments: {
        check1: trainee.performance?.assignments?.check1 || 0,
        check2: trainee.performance?.assignments?.check2 || 0,
        check3: trainee.performance?.assignments?.check3 || 0
      },
      quizzes: trainee.performance?.quizzes || { '1': 0 },
      leetcode: trainee.performance?.leetcode || { '1': 0 }
    }
  });

  const addQuizWeek = () => {
    const currentWeeks = quizWeeks.map(w => parseInt(w));
    const nextWeek = Math.max(...currentWeeks, 0) + 1;
    setQuizWeeks([...quizWeeks, nextWeek.toString()]);
    
    // Update form values with the new week
    const updatedQuizzes = { 
      ...form.getValues().quizzes, 
      [nextWeek.toString()]: 0 
    };
    form.setValue('quizzes', updatedQuizzes);
  };

  const addLeetcodeWeek = () => {
    const currentWeeks = leetcodeWeeks.map(w => parseInt(w));
    const nextWeek = Math.max(...currentWeeks, 0) + 1;
    setLeetcodeWeeks([...leetcodeWeeks, nextWeek.toString()]);
    
    // Update form values with the new week
    const updatedLeetcode = { 
      ...form.getValues().leetcode, 
      [nextWeek.toString()]: 0 
    };
    form.setValue('leetcode', updatedLeetcode);
  };

  function onSubmit(data: PerformanceFormValues) {
    onSave(trainee.id, data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="mb-6">
          <FormLabel>Select Performance Category</FormLabel>
          <Select
            onValueChange={(value) => setActiveCategory(value as PerformanceCategory)}
            defaultValue="assignments"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assignments">Assignments</SelectItem>
              <SelectItem value="quizzes">Quizzes</SelectItem>
              <SelectItem value="leetcode">Leetcode</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {activeCategory === 'assignments' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="assignments.check1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check 1 Completion (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the percentage of completion (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignments.check2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check 2 Completion (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the percentage of completion (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignments.check3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check 3 Completion (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the percentage of completion (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeCategory === 'quizzes' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Quiz Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {quizWeeks.map((week) => (
                  <FormField
                    key={`quiz-week-${week}`}
                    control={form.control}
                    name={`quizzes.${week}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week {week} Quiz Score</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the quiz score (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuizWeek}
                  className="mt-2"
                >
                  Add Week
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeCategory === 'leetcode' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leetcode Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {leetcodeWeeks.map((week) => (
                  <FormField
                    key={`leetcode-week-${week}`}
                    control={form.control}
                    name={`leetcode.${week}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week {week} Leetcode Completion</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="20" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the number of completed questions (0-20)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLeetcodeWeek}
                  className="mt-2"
                >
                  Add Week
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Button type="submit" className="w-full">Save Performance Data</Button>
      </form>
    </Form>
  );
}