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

    // Get token data to ensure email matches
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

    // Create user profile in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          onboarding_completed: false
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
      createdAt: new Date(userData.created_at),
      onboardingCompleted: userData.onboarding_completed
    };
  }
};
