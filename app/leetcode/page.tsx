'use client';
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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { saveLeetcodeSession } from './action';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  leetcodeId: z.string().min(1, 'LeetCode ID is required'),
  leetcodeSession: z.string().min(1, 'LeetCode Session is required')
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      leetcodeId: '',
      leetcodeSession: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await saveLeetcodeSession(
        values.email,
        values.leetcodeId,
        values.leetcodeSession
      );
      toast.success('LeetCode session saved');
      form.reset();
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      {form.formState.isSubmitSuccessful ? (
        <div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">
            {' '}
            Your LeetCode session has been saved successfully.
          </span>
          <p className="mt-2">
            You will be redirected to the home page shortly.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto py-10"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@cool.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>email for LeetCode</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leetcodeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LeetCode ID</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    LeetCode ID from your account setting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leetcodeSession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LeetCode Session</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    LEETCODE_SESSION from cookie
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
