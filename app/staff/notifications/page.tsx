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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  sendNotification,
  getNotifications,
  getBatches,
  getUsersByRole
} from './actions';
import { Notification, NotificationGroup } from '@/lib/types';

// Form schema for notification
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  groupType: z.string(),
  batchId: z.string().optional(),
  recipientIds: z.array(z.string()).optional()
});

// Type for batches
type Batch = {
  id: string;
  name: string;
};

// Type for users
type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [trainerUsers, setTrainerUsers] = useState<User[]>([]);
  const [traineeUsers, setTraineeUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      groupType: NotificationGroup.ALL,
      batchId: '',
      recipientIds: []
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch notifications
      const notificationData = await getNotifications();
      setNotifications(notificationData);

      // Fetch batches
      const batchData = await getBatches();
      setBatches(batchData);

      // Fetch users by role
      const staffData = await getUsersByRole('STAFF');
      setStaffUsers(staffData);

      const trainerData = await getUsersByRole('TRAINER');
      setTrainerUsers(trainerData);

      const traineeData = await getUsersByRole('TRAINEE');
      setTraineeUsers(traineeData);

      setLoading(false);
    }

    fetchData();
  }, []);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('groupType', values.groupType);

      if (values.groupType === NotificationGroup.BATCH && values.batchId) {
        formData.append('batchId', values.batchId);
      }

      if (
        values.groupType === NotificationGroup.CUSTOM &&
        values.recipientIds
      ) {
        formData.append('recipientIds', values.recipientIds.join(','));
      }

      // Send notification
      const result = await sendNotification(formData);

      if (result.success) {
        toast.success(result.message);

        // Reset form
        form.reset({
          title: '',
          content: '',
          groupType: NotificationGroup.ALL,
          batchId: '',
          recipientIds: []
        });

        // Refresh notifications
        const updatedNotifications = await getNotifications();
        setNotifications(updatedNotifications);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  }

  // Get available users based on selected recipient type
  const getAvailableUsers = () => {
    const groupType = form.watch('groupType');

    switch (groupType) {
      case NotificationGroup.ALL_STAFF:
        return staffUsers;
      case NotificationGroup.ALL_TRAINERS:
        return trainerUsers;
      case NotificationGroup.ALL_TRAINEES:
        return traineeUsers;
      case NotificationGroup.CUSTOM:
        return [...staffUsers, ...trainerUsers, ...traineeUsers];
      default:
        return [];
    }
  };

  // Get badge color based on notification group
  const getGroupBadgeColor = (
    group: NotificationGroup
  ): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (group) {
      case NotificationGroup.ALL:
        return 'default';
      case NotificationGroup.ALL_STAFF:
        return 'secondary';
      case NotificationGroup.ALL_TRAINERS:
        return 'outline';
      case NotificationGroup.ALL_TRAINEES:
        return 'destructive';
      case NotificationGroup.BATCH:
        return 'secondary';
      case NotificationGroup.CUSTOM:
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Staff Notifications</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Notification title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notification content"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NotificationGroup.ALL}>
                            All Users
                          </SelectItem>
                          <SelectItem value={NotificationGroup.ALL_STAFF}>
                            All Staff
                          </SelectItem>
                          <SelectItem value={NotificationGroup.ALL_TRAINERS}>
                            All Trainers
                          </SelectItem>
                          <SelectItem value={NotificationGroup.ALL_TRAINEES}>
                            All Trainees
                          </SelectItem>
                          <SelectItem value={NotificationGroup.BATCH}>
                            Specific Batch
                          </SelectItem>
                          <SelectItem value={NotificationGroup.CUSTOM}>
                            Custom Selection
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Batch selection */}
                {form.watch('groupType') === NotificationGroup.BATCH && (
                  <FormField
                    control={form.control}
                    name="batchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Batch</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {batches.map(batch => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Custom recipient selection */}
                {form.watch('groupType') === NotificationGroup.CUSTOM && (
                  <FormField
                    control={form.control}
                    name="recipientIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Select Recipients
                          </FormLabel>
                          <FormDescription>
                            Select the users who should receive this
                            notification
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                          {getAvailableUsers().map(user => (
                            <FormField
                              key={user.id}
                              control={form.control}
                              name="recipientIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={user.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(user.id)}
                                        onCheckedChange={checked => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                user.id
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  value => value !== user.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {user.firstname} {user.lastname} (
                                      {user.email})
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Notification'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground">
                    Loading notifications...
                  </p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications sent yet
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map(notification => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">
                          {notification.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getGroupBadgeColor(notification.groupType)}
                          >
                            {notification.groupType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(notification.createdAt, 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
