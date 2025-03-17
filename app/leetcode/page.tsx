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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  checkExisting,
  saveLeetcodeSession,
  updateLeetcodeSession
} from './action';

const formSchema = z.object({
  leetcodeId: z.string().min(1, 'LeetCode ID is required'),
  name: z.string().min(1, 'Name is required'),
  leetcodeSession: z.string().min(1, 'LeetCode Session is required')
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leetcodeId: '',
      name: '',
      leetcodeSession: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const existing = await checkExisting(values.leetcodeId, values.name);
      if (existing.length) {
        await updateLeetcodeSession(existing[0].id, values.leetcodeSession);
        toast.success('LeetCode session updated');
        form.reset();
        return;
      }
      await saveLeetcodeSession(
        values.leetcodeId,
        values.name,
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
              name="leetcodeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LeetCode ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Leetcode ID" type="text" {...field} />
                  </FormControl>
                  <FormDescription>Leetcode ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" type="text" {...field} />
                  </FormControl>
                  <FormDescription>First and last name</FormDescription>
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
