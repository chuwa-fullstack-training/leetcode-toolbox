import { createClient } from '@/utils/supabase/server';
import { Notification, NotificationGroup } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

/**
 * Service for managing and sending notifications
 */
export const notificationService = {
  /**
   * Send a notification to a group of users
   * @param title Notification title
   * @param content Notification content
   * @param groupType Type of notification group
   * @param batchId Batch ID (required if groupType is BATCH)
   * @param recipientIds List of user IDs (required if groupType is CUSTOM)
   * @param sentById ID of the user sending the notification
   * @returns The created notification or null if creation failed
   */
  async sendNotification(
    title: string,
    content: string,
    groupType: NotificationGroup,
    sentById: string,
    batchId?: string,
    recipientIds?: string[]
  ): Promise<Notification | null> {
    try {
      const supabase = await createClient();

      // Validate parameters based on group type
      if (groupType === NotificationGroup.BATCH && !batchId) {
        throw new Error('Batch ID is required for batch notifications');
      }

      if (
        groupType === NotificationGroup.CUSTOM &&
        (!recipientIds || recipientIds.length === 0)
      ) {
        throw new Error('Recipient IDs are required for custom notifications');
      }

      // Create notification record
      const notification: Notification = {
        id: uuidv4(),
        title,
        content,
        createdAt: new Date(),
        sentBy: sentById,
        groupType,
        batchId,
        recipientIds
      };

      // Insert notification into database
      const { data: notificationData, error: notificationError } =
        await supabase
          .from('notifications')
          .insert([
            {
              id: notification.id,
              title: notification.title,
              content: notification.content,
              created_at: notification.createdAt.toISOString(),
              sent_by: notification.sentBy,
              group_type: notification.groupType,
              batch_id: notification.batchId,
              recipient_ids: notification.recipientIds
            }
          ])
          .select()
          .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw new Error('Failed to create notification');
      }

      // Get recipients based on group type
      const recipients = await this.getRecipientsByGroup(
        groupType,
        batchId,
        recipientIds
      );

      // Send emails to recipients
      await this.sendEmails(recipients, title, content);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  },

  /**
   * Get all recipients based on group type
   * @param groupType Type of notification group
   * @param batchId Batch ID (required if groupType is BATCH)
   * @param recipientIds List of user IDs (required if groupType is CUSTOM)
   * @returns List of recipient email addresses
   */
  async getRecipientsByGroup(
    groupType: NotificationGroup,
    batchId?: string,
    recipientIds?: string[]
  ): Promise<string[]> {
    const supabase = await createClient();
    let query = supabase.from('profile').select('email');

    switch (groupType) {
      case NotificationGroup.ALL:
        // No filtering, get all users
        break;
      case NotificationGroup.ALL_STAFF:
        query = query.eq('role', 'STAFF');
        break;
      case NotificationGroup.ALL_TRAINERS:
        query = query.eq('role', 'TRAINER');
        break;
      case NotificationGroup.ALL_TRAINEES:
        query = query.eq('role', 'TRAINEE');
        break;
      case NotificationGroup.BATCH:
        if (!batchId)
          throw new Error('Batch ID is required for batch notifications');
        query = query.eq('batch_id', batchId);
        break;
      case NotificationGroup.CUSTOM:
        if (!recipientIds || recipientIds.length === 0) {
          throw new Error(
            'Recipient IDs are required for custom notifications'
          );
        }
        query = query.in('id', recipientIds);
        break;
      default:
        throw new Error('Invalid notification group type');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipients:', error);
      throw new Error('Failed to fetch recipients');
    }

    return data.map(profile => profile.email);
  },

  /**
   * Send emails to recipients using Resend and Bun
   * @param recipients List of recipient email addresses
   * @param subject Email subject
   * @param content Email content
   */
  async sendEmails(
    recipients: string[],
    subject: string,
    content: string
  ): Promise<void> {
    try {
      // Log email details for debugging
      console.log('Sending notification emails:');
      console.log('- Subject:', subject);
      console.log('- Content:', content);
      console.log('- Recipients:', recipients.join(', '));

      // Get Resend API key from environment variables
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }

      // Create Resend client
      const resend = new Resend(resendApiKey);

      // Get sender email from environment variables or use default
      const fromEmail =
        process.env.EMAIL_FROM_ADDRESS || 'notifications@example.com';

      // Send emails to all recipients using Bun for better performance
      await Promise.all(
        recipients.map(async recipient => {
          try {
            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: recipient,
              subject: subject,
              html: `<div>${content.replace(/\n/g, '<br>')}</div>`
            });

            if (error) {
              console.error(`Failed to send email to ${recipient}:`, error);
            } else {
              console.log(`Email sent to ${recipient}, ID: ${data?.id}`);
            }
          } catch (err) {
            console.error(`Error sending email to ${recipient}:`, err);
          }
        })
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error in sendEmails:', error);
      throw error;
    }
  },

  /**
   * Get notifications by sent by a specific user
   * @param userId User ID
   * @returns List of notifications
   */
  async getNotificationsBySender(userId: string): Promise<Notification[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('sent_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data.map(notification => ({
        id: notification.id,
        title: notification.title,
        content: notification.content,
        createdAt: new Date(notification.created_at),
        sentBy: notification.sent_by,
        groupType: notification.group_type,
        batchId: notification.batch_id,
        recipientIds: notification.recipient_ids
      }));
    } catch (error) {
      console.error('Error in getNotificationsBySender:', error);
      return [];
    }
  }
};
