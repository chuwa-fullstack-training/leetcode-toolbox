'use server';

import { tokenService } from '@/services/tokenService';
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