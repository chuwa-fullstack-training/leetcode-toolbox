# Notification System Documentation

This document provides comprehensive information about the notification system implementation, which allows staff to send notifications to various groups of users via email.

## Features

- **Group-based notifications**: Send notifications to specific user groups
  - All users
  - All staff members
  - All trainers
  - All trainees
  - Specific batch of trainees
  - Custom selection of users
- **Email delivery**: All notifications are sent via email to recipients
- **Notification history**: Staff can view a history of sent notifications
- **Batch filtering**: Trainees can be filtered by their assigned batch
- **Custom recipient selection**: Manually select specific recipients from a list

## Setup Instructions

### 1. Database Setup

The notification system requires changes to the database schema. Run the following SQL migrations:

1. Create the notifications table:
   ```bash
   psql -h [host] -d [database] -U [user] -f migrations/create_notifications_table.sql
   ```

2. Update the profile table (adds role and batch_id fields if missing):
   ```bash
   psql -h [host] -d [database] -U [user] -f migrations/update_profile_for_notifications.sql
   ```

Alternatively, you can run these migrations through the Supabase UI:
1. Go to the SQL Editor in your Supabase project
2. Copy the content of each migration file
3. Run the queries in the SQL Editor

### 2. Email Delivery Configuration

The notification service is designed to work with any email delivery service. Current options:

#### Option 1: Set up a Supabase Edge Function (Recommended)

1. Create a new Edge Function in your Supabase project:
   ```bash
   supabase functions new send-notification-email
   ```

2. Implement the function to send emails using a service like SendGrid, Mailgun, or AWS SES:
   ```typescript
   // Example implementation for SendGrid
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import * as sgMail from 'https://esm.sh/@sendgrid/mail'

   serve(async (req) => {
     const { recipients, subject, content } = await req.json()
     
     // Initialize SendGrid
     sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'))
     
     try {
       // Send emails
       const messages = recipients.map(recipient => ({
         to: recipient,
         from: 'notifications@example.com',
         subject,
         text: content,
         html: `<div>${content.replace(/\n/g, '<br>')}</div>`
       }))
       
       await sgMail.send(messages)
       
       return new Response(JSON.stringify({ success: true }), {
         headers: { 'Content-Type': 'application/json' }
       })
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' }
       })
     }
   })
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy send-notification-email
   ```

4. Update the `notificationService.ts` file's `sendEmails` method to use your edge function.

#### Option 2: Direct Email API Integration

You can also modify the `sendEmails` method in `services/notificationService.ts` to directly integrate with an email service:

```typescript
async sendEmails(recipients: string[], subject: string, content: string): Promise<void> {
  // Example using an email API client directly
  const apiKey = process.env.EMAIL_API_KEY;
  const response = await fetch('https://api.emailservice.com/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: 'notifications@example.com',
      to: recipients,
      subject,
      content
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send emails: ${errorData.message}`);
  }
}
```

### 3. Environment Variables

Ensure you have the necessary environment variables configured:

```
# .env.local
EMAIL_SERVICE_API_KEY=your_api_key
EMAIL_FROM_ADDRESS=notifications@example.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Guide

### Sending Notifications

1. Navigate to the Staff Portal
2. Click on "Notifications" in the sidebar
3. Fill in the notification form:
   - Enter a title
   - Enter the content
   - Select the recipient group type
   - If "Specific Batch" is chosen, select the batch
   - If "Custom Selection" is chosen, select the recipients
4. Click "Send Notification"

### View Notification History

The notification history is displayed on the right side of the notifications page, showing:
- Notification title
- Group type
- Sent date

## Data Structure

### Notifications Table

| Column         | Type      | Description                       |
|----------------|-----------|-----------------------------------|
| id             | UUID      | Primary key                       |
| title          | TEXT      | Notification title                |
| content        | TEXT      | Notification content              |
| created_at     | TIMESTAMP | Creation timestamp                |
| sent_by        | UUID      | ID of staff who sent notification |
| group_type     | TEXT      | Type of recipient group           |
| batch_id       | UUID      | Batch ID (if applicable)          |
| recipient_ids  | UUID[]    | Array of recipient IDs (if custom)|

### User Roles in Profile Table

| Role      | Description                                    |
|-----------|------------------------------------------------|
| STAFF     | Administrative staff who can send notifications|
| TRAINER   | Training instructors                           |
| TRAINEE   | Students assigned to training batches          |

## Security Considerations

- Row-level security policies ensure users can only see notifications intended for them
- Only STAFF users can send notifications
- All database operations are performed via server actions
- Email addresses are not exposed to client-side code

## Troubleshooting

### Common Issues

1. **Notifications not appearing in history**
   - Check that the notifications table was created correctly
   - Verify the staff user has permission to insert into the notifications table

2. **Emails not being sent**
   - Check the console logs for any errors in the email sending process
   - Verify your email service credentials are correct
   - Check that recipients have valid email addresses

3. **Can't select a batch**
   - Ensure the batch table has data
   - Verify batch_id references are set up correctly in the database

## Extensions and Customizations

### Adding In-App Notifications

To add in-app notifications alongside email notifications:

1. Create a user_notifications junction table to track read/unread status
2. Add a notifications bell icon in the app header
3. Create an API endpoint to fetch and mark notifications as read

### Scheduled Notifications

To add scheduled notifications:

1. Add a `scheduled_for` timestamp column to the notifications table
2. Create a cron job or background worker to process scheduled notifications
3. Update the UI to allow setting a future date/time for sending