import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  subject: string;
  signupLink: string;
  expirationDate: string;
  type: 'signup-invitation';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing email request...')
    
    // Get request body
    const requestBody = await req.json()
    console.log('Request body received:', { 
      to: requestBody.to, 
      subject: requestBody.subject, 
      type: requestBody.type,
      hasSignupLink: !!requestBody.signupLink,
      hasExpirationDate: !!requestBody.expirationDate
    })
    
    const { to, subject, signupLink, expirationDate, type }: EmailRequest = requestBody

    // Validate required fields
    if (!to || !subject || !signupLink || !expirationDate) {
      const missingFields = []
      if (!to) missingFields.push('to')
      if (!subject) missingFields.push('subject')
      if (!signupLink) missingFields.push('signupLink')
      if (!expirationDate) missingFields.push('expirationDate')
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    // Get Resend API key from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set')
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    console.log('Resend API key found:', resendApiKey ? 'Yes' : 'No')

    // Get sender email from environment variables or use default
    const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@example.com'
    console.log('Using sender email:', fromEmail)

    // Prepare email content based on type
    let htmlContent = ''
    let textContent = ''

    if (type === 'signup-invitation') {
      // HTML email content for signup invitation
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px; font-size: 24px;">Welcome to Our Platform!</h1>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You've been invited to join our training platform. To complete your account setup and start your journey, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Complete Account Setup
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">
              ${signupLink}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin-bottom: 5px;">
                <strong>Important:</strong> This invitation link will expire on ${expirationDate}.
              </p>
              <p style="color: #999; font-size: 14px;">
                If you have any questions or need help, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `

      // Plain text version for email clients that don't support HTML
      textContent = `
Welcome to Our Platform!

You've been invited to join our training platform. To complete your account setup and start your journey, please visit the following link:

${signupLink}

This invitation link will expire on ${expirationDate}.

If you have any questions or need help, please contact our support team.
      `
    }

    console.log('Sending email to Resend API...')
    console.log('Recipients:', [to])
    console.log('Subject:', subject)

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    console.log('Resend API response status:', emailResponse.status, emailResponse.statusText)

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error('Resend API error response:', errorData)
      throw new Error(`Resend API error (${emailResponse.status}): ${errorData.message || JSON.stringify(errorData)}`)
    }

    const emailData = await emailResponse.json()
    console.log('Resend API success response:', emailData)

    console.log(`Email sent successfully to ${to}, ID: ${emailData.id}`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${to}`,
        emailId: emailData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Detailed error in Edge Function:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: `${errorName}: ${errorMessage}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 