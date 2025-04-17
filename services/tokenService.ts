import { createClient } from "@/utils/supabase/server";
import { SignupToken } from "@/types/auth";
import { v4 as uuidv4 } from "uuid";

export const tokenService = {
  async verifyToken(token: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("signup_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .gte("expires_at", new Date().toISOString())
      .single();
    if (error || !data) {
      return false;
    }
    return true;
  },

  async getTokenData(token: string): Promise<SignupToken | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("signup_tokens")
      .select("*")
      .eq("token", token)
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
      createdAt: new Date(data.created_at),
    };
  },

  async markTokenAsUsed(token: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("signup_tokens")
      .update({ is_used: true })
      .eq("token", token);
    return !error;
  },

  async createSignupToken(
    email: string,
    expiresInDays = 7
  ): Promise<SignupToken | null> {
    const supabase = await createClient();
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from("signup_tokens")
      .insert({
        token,
        email,
        is_used: false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating signup token:", error);
      return null;
    }

    return {
      id: data.id,
      token: data.token,
      email: data.email,
      isUsed: data.is_used,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
    };
  },

  async listSignupTokens(): Promise<SignupToken[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("signup_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error listing signup tokens:", error);
      return [];
    }

    return data.map((token) => ({
      id: token.id,
      token: token.token,
      email: token.email,
      isUsed: token.is_used,
      expiresAt: new Date(token.expires_at),
      createdAt: new Date(token.created_at),
    }));
  },
};
