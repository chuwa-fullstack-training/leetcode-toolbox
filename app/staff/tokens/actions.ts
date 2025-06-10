'use server';

import { tokenService } from '@/services/tokenService';
import { emailService } from '@/services/emailService';
import { SignupToken } from '@/types/auth';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

/**
 * Create a new signup token for a trainee
 * @param email Trainee's email address
 * @param batchId Batch ID to assign the user to
 * @returns The created token or null if creation failed
 */
export async function createToken(email: string, batchId: string): Promise<SignupToken | null> {
  try {
    console.log('Creating token for email:', email, 'and batchId:', batchId);
    // Create a token that expires in 7 days
    const token = await tokenService.createSignupToken(email, batchId);
    
    // Revalidate the tokens page to reflect changes
    revalidatePath('/staff/tokens');
    
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    return null;
  }
}

/**
 * Create a token and send signup email
 * @param email Trainee's email address
 * @param batchId Batch ID to assign the user to
 * @returns Object with token creation and email sending status
 */
export async function createTokenAndSendEmail(
  email: string, 
  batchId: string
): Promise<{ token: SignupToken | null; emailSent: boolean; error?: string }> {
  try {
    console.log('Creating token and sending email for:', email, 'and batchId:', batchId);
    
    // Create a token that expires in 7 days
    const token = await tokenService.createSignupToken(email, batchId);
    
    if (!token) {
      return { 
        token: null, 
        emailSent: false, 
        error: 'Failed to create signup token' 
      };
    }

    // Generate the signup link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const signupLink = `${baseUrl}/sign-up?token=${token.token}`;

    // Send signup email
    try {
      await emailService.sendSignupLinkEmail(email, signupLink, token.expiresAt);
      
      // Revalidate the tokens page to reflect changes
      revalidatePath('/staff/tokens');
      
      return { 
        token, 
        emailSent: true 
      };
    } catch (emailError) {
      console.error('Error sending signup email:', emailError);
      console.error('Full error details:', emailError);
      
      // Token was created successfully, but email failed
      // Revalidate the tokens page to reflect changes
      revalidatePath('/staff/tokens');
      
      return { 
        token, 
        emailSent: false, 
        error: `Token created but email failed to send: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error('Error creating token and sending email:', error);
    return { 
      token: null, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Send signup email for an existing token
 * @param tokenId Token ID to send email for
 * @returns Success status and message
 */
export async function sendSignupEmail(tokenId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get token data
    const tokens = await tokenService.listSignupTokens();
    const token = tokens.find(t => t.id === tokenId);
    
    if (!token) {
      return { success: false, message: 'Token not found' };
    }
    
    if (token.isUsed) {
      return { success: false, message: 'Token has already been used' };
    }
    
    if (token.expiresAt < new Date()) {
      return { success: false, message: 'Token has expired' };
    }

    // Generate the signup link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const signupLink = `${baseUrl}/sign-up?token=${token.token}`;

    // Send signup email
    await emailService.sendSignupLinkEmail(token.email, signupLink, token.expiresAt);
    
    return { 
      success: true, 
      message: `Signup email sent successfully to ${token.email}` 
    };
  } catch (error) {
    console.error('Error sending signup email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Get all signup tokens
 * @returns List of all tokens
 */
export async function getTokens(): Promise<SignupToken[]> {
  try {
    const tokens = await tokenService.listSignupTokens();
    return tokens;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

/**
 * Get all batches for selection
 * @returns Array of batches
 */
export async function getBatches() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('batch')
      .select('id, name, type')
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