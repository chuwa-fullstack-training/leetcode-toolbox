"use server";

import { encodedRedirect } from "@/utils/utils";
import { createAdminClient, createClient } from "@/utils/supabase/server";
import { authService } from "@/services/authService";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("fullname")?.toString();
  const token = formData.get("token")?.toString();

  if (!email || !password || !name) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Name, email and password are required"
    );
  }

  if (!token) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Registration token is required. Sign-up is by invitation only."
    );
  }

  try {
    // Use authService which includes token validation
    const user = await authService.signUp(email, password, name, token);

    if (!user) {
      return encodedRedirect(
        "error",
        "/sign-up",
        "Failed to create user account. Please try again."
      );
    }

    return encodedRedirect(
      "success",
      "/sign-in",
      "Thanks for signing up! Please check your email for a verification link."
    );
  } catch (error: any) {
    console.error("Sign up error:", error);
    return encodedRedirect(
      "error",
      "/sign-up",
      error.message || "Failed to create user account"
    );
  }
};

export const signUpAdminAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const adminSupabase = await createAdminClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: "admin",
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! You are now an admin user."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo")?.toString();
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const redirectUrl = redirectTo
      ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/sign-in";
    return encodedRedirect("error", redirectUrl, error.message);
  }

  // Redirect to the original page if provided, otherwise to /protected
  return redirect(redirectTo || "/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
