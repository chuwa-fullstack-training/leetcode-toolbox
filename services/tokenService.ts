import { createClient } from '@/utils/supabase/server';
import { SignupToken } from '@/types/auth';

export const tokenService = {
  async verifyToken(token: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('signup_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .single();
    if (error || !data) {
      return false;
    }
    return true;
  },

  async getTokenData(token: string): Promise<SignupToken | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('signup_tokens')
      .select('*')
      .eq('token', token)
      .single();
    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      token: data.token,
      email: data.email,
      isUsed: data.is_used,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at)
    };
  },

  async markTokenAsUsed(token: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('signup_tokens')
      .update({ is_used: true })
      .eq('token', token);
    return !error;
  }

  //   async createSignupToken(email: string) {
  //     const supabase = await createClient();
  //     const { data, error } = await supabase
  //       .from('signup_tokens')
  //       .insert({
  //         email,
  //         expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
  //       })
  //       .select()
  //       .single();
  //   }
};
