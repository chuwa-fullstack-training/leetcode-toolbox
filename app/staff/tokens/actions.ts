'use server';

import { tokenService } from '@/services/tokenService';
import { SignupToken } from '@/types/auth';
import { revalidatePath } from 'next/cache';

/**
 * Create a new signup token for a trainee
 * @param email Trainee's email address
 * @returns The created token or null if creation failed
 */
export async function createToken(email: string): Promise<SignupToken | null> {
  try {
    // Create a token that expires in 7 days
    const token = await tokenService.createSignupToken(email);
    
    // Revalidate the tokens page to reflect changes
    revalidatePath('/staff/tokens');
    
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    return null;
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