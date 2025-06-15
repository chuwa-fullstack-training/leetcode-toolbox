'use server';

import { createClient } from '@/utils/supabase/server';
import { BatchInfo } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Get batch information for a specific batch
 * @param batchId Batch ID
 * @returns Batch information or null if not found
 */
export async function getBatchInfo(batchId: string): Promise<BatchInfo | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('batch_info')
      .select('*')
      .eq('batch_id', batchId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      batchId: data.batch_id,
      title: data.title,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error fetching batch info:', error);
    return null;
  }
}

/**
 * Get all batch information (for admin users)
 * @returns Array of batch information
 */
export async function getAllBatchInfo(): Promise<BatchInfo[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('batch_info')
      .select(`
        *,
        batch:batch_id (
          name
        )
      `)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all batch info:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      batchId: item.batch_id,
      title: item.title,
      content: item.content,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      createdBy: item.created_by,
      batchName: item.batch?.name
    }));
  } catch (error) {
    console.error('Error fetching all batch info:', error);
    return [];
  }
}

/**
 * Create or update batch information
 * @param formData Form data containing batch info details
 * @returns Success status and message
 */
export async function upsertBatchInfo(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }
    
    // Check if user has staff role
    const userRoles = user.user_metadata?.roles || [];
    if (!userRoles.includes('staff')) {
      return { success: false, message: 'You do not have permission to manage batch information' };
    }
    
    // Extract form data
    const batchId = formData.get('batchId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    
    // Validate required fields
    if (!batchId || !title || !content) {
      return { success: false, message: 'Batch, title, and content are required' };
    }
    
    // Check if batch info already exists
    const { data: existingInfo } = await supabase
      .from('batch_info')
      .select('id')
      .eq('batch_id', batchId)
      .single();
    
    if (existingInfo) {
      // Update existing batch info
      const { error } = await supabase
        .from('batch_info')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('batch_id', batchId);
      
      if (error) {
        console.error('Error updating batch info:', error);
        return { success: false, message: 'Failed to update batch information' };
      }
    } else {
      // Create new batch info
      const { error } = await supabase
        .from('batch_info')
        .insert([{
          batch_id: batchId,
          title,
          content,
          created_by: user.id
        }]);
      
      if (error) {
        console.error('Error creating batch info:', error);
        return { success: false, message: 'Failed to create batch information' };
      }
    }
    
    // Revalidate the protected page
    revalidatePath('/protected');
    
    return { 
      success: true, 
      message: existingInfo ? 'Batch information updated successfully' : 'Batch information created successfully'
    };
  } catch (error) {
    console.error('Error upserting batch info:', error);
    return { 
      success: false, 
      message: 'Failed to save batch information' 
    };
  }
}

/**
 * Delete batch information
 * @param batchId Batch ID
 * @returns Success status and message
 */
export async function deleteBatchInfo(batchId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user and check permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }
    
    // Check if user has staff role
    const userRoles = user.user_metadata?.roles || [];
    if (!userRoles.includes('staff')) {
      return { success: false, message: 'You do not have permission to delete batch information' };
    }
    
    const { error } = await supabase
      .from('batch_info')
      .delete()
      .eq('batch_id', batchId);
    
    if (error) {
      console.error('Error deleting batch info:', error);
      return { success: false, message: 'Failed to delete batch information' };
    }
    
    // Revalidate the protected page
    revalidatePath('/protected');
    
    return { success: true, message: 'Batch information deleted successfully' };
  } catch (error) {
    console.error('Error deleting batch info:', error);
    return { success: false, message: 'Failed to delete batch information' };
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

/**
 * Get user profile with role and batch information
 * @returns User profile with roles from metadata or null
 */
export async function getUserProfile() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    console.log('User metadata:', user.user_metadata);
    console.log('User app metadata:', user.app_metadata);
    
    // Get user profile from profile table
    const { data: profile, error } = await supabase
      .from('profile')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    console.log('Profile from database:', profile);
    
    // Get batch info only if user has a batch_id (trainees have batch_id, trainers don't)
    let batchInfo = null;
    if (profile?.batch_id) {
      const { data: batch, error: batchError } = await supabase
        .from('batch')
        .select('id, name, type')
        .eq('id', profile.batch_id)
        .single();
      
      if (!batchError && batch) {
        batchInfo = batch;
      }
    }
    
    // Extract roles from user metadata (check both lowercase and uppercase)
    const userRoles = user.user_metadata?.roles || [];
    console.log('User roles from metadata:', userRoles);
    
    // Check role from profile table (uppercase) and user metadata (could be lowercase or uppercase)
    const isStaff = 
      profile?.role === 'STAFF' || 
      userRoles.includes('staff') || 
      userRoles.includes('STAFF') ||
      user.app_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'admin' ||
      user.app_metadata?.is_admin === true ||
      user.user_metadata?.is_admin === true;
      
    const isTrainee = 
      profile?.role === 'TRAINEE' || 
      userRoles.includes('trainee') || 
      userRoles.includes('TRAINEE');
      
    const isTrainer = 
      profile?.role === 'TRAINER' || 
      userRoles.includes('trainer') || 
      userRoles.includes('TRAINER');

    console.log('Role flags - isStaff:', isStaff, 'isTrainee:', isTrainee, 'isTrainer:', isTrainer);
    
    // Return profile with roles from metadata and batch info (if available)
    return {
      ...profile,
      batch: batchInfo, // This will be null for trainers, which is expected
      roles: userRoles,
      // For backward compatibility, set individual role flags
      isStaff,
      isTrainee,
      isTrainer
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
} 