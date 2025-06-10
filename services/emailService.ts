import { createClient } from '@/utils/supabase/server';

/**
 * Email service for sending signup link emails using Supabase Edge Functions
 */
export const emailService = {
  /**
   * Send signup link email to a trainee using Supabase Edge Function
   * @param email Recipient email address
   * @param signupLink Complete signup URL with token
   * @param expiresAt Token expiration date
   * @returns Promise that resolves when email is sent
   */
  async sendSignupLinkEmail(
    email: string,
    signupLink: string,
    expiresAt: Date
  ): Promise<void> {
    // TEMPORARY: Skip email sending for debugging
    // Remove this block once Edge Function is working
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL_SENDING === 'true') {
      console.log('SKIPPING email sending - would have sent to:', email);
      console.log('Signup link:', signupLink);
      console.log('Expires at:', expiresAt);
      return Promise.resolve();
    }

    try {
      console.log('Sending signup link email to:', email);
      console.log('Signup link:', signupLink);

      // Get Supabase client
      const supabase = await createClient();

      // Format expiration date
      const expirationDate = expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Prepare email data for the edge function
      const emailData = {
        to: email,
        subject: 'Welcome! Complete Your Account Setup',
        signupLink: signupLink,
        expirationDate: expirationDate,
        type: 'signup-invitation'
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('resend-email', {
        body: emailData
      });

      if (error) {
        console.error(`Failed to send signup email to ${email}:`, error);
        throw new Error(`Failed to send signup email: ${error.message}`);
      }

      if (!data?.success) {
        console.error(`Email sending failed for ${email}:`, data?.error);
        throw new Error(`Failed to send signup email: ${data?.error || 'Unknown error'}`);
      }

      console.log(`Signup email sent to ${email}, Response:`, data);
    } catch (error) {
      console.error('Error sending signup link email:', error);
      throw error;
    }
  },
}; 