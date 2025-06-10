# Email Signup Integration

This document describes the email signup functionality that automatically sends invitation emails when creating signup tokens using Supabase Edge Functions.

## Features

- **Automatic email sending**: When creating a new signup token, an invitation email can be automatically sent to the trainee
- **Manual email sending**: Staff can send invitation emails for existing tokens that haven't been used
- **Professional email templates**: Beautiful HTML email templates with clear call-to-action buttons
- **Email status tracking**: UI shows whether emails were sent successfully or failed
- **Fallback support**: If email sending fails, the token is still created and can be sent later
- **Edge Function powered**: Uses Supabase Edge Functions for serverless email processing

## Architecture

The email functionality uses a **Supabase Edge Function** approach:

1. **Frontend** calls server actions (Next.js API routes)
2. **Server actions** call the Supabase Edge Function `resend-email`
3. **Edge Function** handles email template generation and Resend API calls
4. **Response** flows back with success/error status

### Benefits of Edge Function Approach

- **Security**: Resend API key stays in the Edge Function environment
- **Scalability**: Serverless edge functions scale automatically
- **Separation of concerns**: Email logic is isolated from main application
- **Performance**: Edge functions run closer to users globally
- **Maintainability**: Email templates are centralized in one place

## Setup Instructions

### 1. Deploy the Edge Function

Create and deploy the `resend-email` Edge Function:

```bash
# Create the function directory
mkdir -p supabase/functions/resend-email

# Copy the function code to supabase/functions/resend-email/index.ts
# (code provided in the repository)

# Deploy the function
supabase functions deploy resend-email
```

### 2. Set Edge Function Environment Variables

Set the required environment variables for the Edge Function:

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Set sender email address
supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### 3. Application Environment Variables

Add these to your `.env.local` file:

```bash
# Site URL for generating signup links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# Alternative: VERCEL_URL (automatically set on Vercel)

# Supabase configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` are now set as Supabase secrets, not application environment variables.

### 4. Setting up Resend

1. Sign up for a [Resend](https://resend.com) account
2. Verify your domain or use their test domain for development
3. Generate an API key from your Resend dashboard
4. Set the API key as a Supabase secret (see step 2 above)

## How It Works

### Token Creation with Email

1. Staff fills out the token creation form (email, batch selection)
2. Staff can choose to send email immediately via checkbox (enabled by default)
3. System creates the signup token in the database
4. If email option is selected, system calls the `resend-email` Edge Function
5. Edge Function generates signup link, creates email template, and sends via Resend
6. UI shows success status for both token creation and email sending

### Manual Email Sending

1. For existing active tokens, staff can click the "Mail" button in the tokens table
2. System calls the `resend-email` Edge Function with token data
3. Edge Function generates the signup link and sends the invitation email
4. Only works for tokens that are active (not used or expired)

### Email Template

The invitation email includes:

- Welcome message and platform introduction
- Prominent "Complete Account Setup" button
- Plain text link as fallback
- Token expiration date and time
- Support contact information

## Edge Function Details

### Function Location

```
supabase/functions/resend-email/index.ts
```

### Request Format

```typescript
{
  to: string; // Recipient email
  subject: string; // Email subject
  signupLink: string; // Complete signup URL with token
  expirationDate: string; // Formatted expiration date
  type: 'signup-invitation'; // Email type
}
```

### Response Format

```typescript
// Success
{
  success: true,
  message: "Email sent successfully to user@example.com",
  emailId: "resend-email-id"
}

// Error
{
  success: false,
  error: "Error message"
}
```

## UI Changes

### Token Creation Form

- Added checkbox "Send invitation email immediately" (checked by default)
- Button text changes based on email option:
  - With email: "Create Token & Send Email"
  - Without email: "Create Token"
- Loading states show "Creating & Sending..." or "Creating..."

### New Token Display

- Shows email status icons (✓ Email Sent, ⚠ Email Failed)
- Displays error messages if email sending fails
- Provides "Send Email" button if email wasn't sent initially

### Tokens Table

- Added "Actions" column
- Copy link button for all tokens
- Send email button for active tokens only
- Loading spinners for email sending actions

## Error Handling

### Email Sending Failures

- Token creation continues even if email fails
- Error messages are displayed to staff
- Staff can retry sending emails later
- Detailed error logs in both application and Edge Function

### Common Issues

1. **Edge Function not deployed**: Deploy the `resend-email` function
2. **Missing secrets**: Set `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` as Supabase secrets
3. **Invalid RESEND_API_KEY**: Check API key is correct and active in Resend dashboard
4. **Email domain not verified**: Verify your domain in Resend dashboard
5. **Rate limits**: Resend has sending limits; check your plan
6. **Invalid email addresses**: System validates email format before sending

## Deployment Commands

```bash
# Deploy the edge function
supabase functions deploy resend-email

# Set environment variables for the edge function
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# List current secrets (to verify)
supabase secrets list

# View function logs
supabase functions logs resend-email
```

## Development Testing

For development, you can:

1. Use `supabase functions serve` to run Edge Functions locally
2. Use Resend's test domain (emails go to a test inbox)
3. Use your own verified domain
4. Check Resend dashboard for delivery logs
5. Monitor Edge Function logs with `supabase functions logs resend-email`

## Usage Examples

### Creating Token with Email (Default)

1. Enter trainee email
2. Select batch
3. Leave "Send invitation email immediately" checked
4. Click "Create Token & Send Email"
5. Email is sent via Edge Function automatically

### Creating Token without Email

1. Enter trainee email
2. Select batch
3. Uncheck "Send invitation email immediately"
4. Click "Create Token"
5. Send email later using table actions

### Sending Email for Existing Token

1. Find token in the tokens table
2. Click the mail icon in the Actions column
3. Email is sent via Edge Function immediately

## Benefits

- **Improved user experience**: Trainees receive immediate invitations
- **Reduced manual work**: No need to manually copy/paste links
- **Professional appearance**: Branded email templates
- **Reliable delivery**: Uses Resend's robust email infrastructure via Edge Functions
- **Better security**: API keys isolated in Edge Function environment
- **Scalability**: Serverless functions scale automatically
- **Global performance**: Edge Functions run closer to users worldwide
- **Audit trail**: Email success/failure status is visible in the UI
