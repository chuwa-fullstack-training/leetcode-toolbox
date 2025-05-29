'use server';

import { notificationService } from '@/services/notificationService';
import { Notification, NotificationGroup } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Send a notification to a group of users
 * @param formData Form data containing notification details
 * @returns The created notification or null if creation failed
 */
export async function sendNotification(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user (sender)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'You must be logged in to send notifications' };
    }
    
    // Extract form data
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const groupType = formData.get('groupType') as NotificationGroup;
    const batchId = formData.get('batchId') as string | undefined;
    const recipientIds = formData.get('recipientIds') as string | undefined;
    
    // Validate required fields
    if (!title || !content || !groupType) {
      return { success: false, message: 'Title, content, and group type are required' };
    }
    
    // Process recipient IDs if provided
    let recipientIdArray: string[] | undefined;
    if (recipientIds) {
      recipientIdArray = recipientIds.split(',').map(id => id.trim());
    }
    
    // Send notification
    const notification = await notificationService.sendNotification(
      title,
      content,
      groupType,
      user.id,
      batchId,
      recipientIdArray
    );
    
    if (!notification) {
      return { success: false, message: 'Failed to send notification' };
    }
    
    // Revalidate the notifications page to reflect changes
    revalidatePath('/staff/notifications');
    
    return { 
      success: true, 
      message: 'Notification sent successfully' 
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send notification' 
    };
  }
}

/**
 * Get notifications sent by the current user
 * @returns List of notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }
    
    // Get notifications
    const notifications = await notificationService.getNotificationsBySender(user.id);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get all batches for selection
 */
export async function getBatches() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('batch')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
}

/**
 * Get users by role
 * @param role User role
 * @returns List of users
 */
export async function getUsersByRole(role: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profile')
      .select('id, firstname, lastname, email')
      .eq('role', role)
      .order('firstname');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}