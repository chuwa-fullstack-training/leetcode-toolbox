import { User } from '@/types/auth';
import { createClient } from '@/utils/supabase/server';
import { tokenService } from './tokenService';

export const authService = {
  async signUp(
    email: string,
    password: string,
    name: string,
    token: string
  ): Promise<User | null> {
    const supabase = await createClient();
    // First verify the token is valid
    const isValid = await tokenService.verifyToken(token);
    if (!isValid) {
      throw new Error('Invalid or expired token');
    }

    // Get token data to ensure email matches and get batch_id
    const tokenData = await tokenService.getTokenData(token);
    if (!tokenData || tokenData.email !== email) {
      throw new Error('Email does not match invitation');
    }

    // Register user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user');
    }

    // split name into first and last name
    // if name is only one word, set first and last name to the same value
    let firstName = '';
    let lastName = '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else {
      firstName = name;
      lastName = name;
    }

    // Create user profile in our users table with batch_id
    const { data: userData, error: userError } = await supabase
      .from('profile')
      .insert([
        {
          user_id: authData.user.id,
          email,
          firstname: firstName,
          lastname: lastName,
          batch_id: tokenData.batchId,
          onboarding_completed: false,
          type: 'trainee'
        }
      ])
      .select()
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    // Mark the token as used
    await tokenService.markTokenAsUsed(token);

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      batchId: userData.batch_id,
      createdAt: new Date(userData.created_at),
      onboardingCompleted: userData.onboarding_completed
    };
  }
};
