'use client';
import { signUpAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  fullname: z.string().regex(/^[a-zA-Z]+\s[a-zA-Z]+$/, 'Invalid name'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Invalid password')
});

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);

  // Validate token on page load
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenError(
          'No invitation token provided. Sign-up is by invitation only.'
        );
        setIsValidating(false);
        return;
      }

      try {
        // Call a verification endpoint to check token and get email
        const res = await fetch(`/api/verify-token?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setTokenError(data.error || 'Invalid or expired invitation token.');
          setIsValidating(false);
          return;
        }

        // Token is valid, pre-fill email
        setTokenEmail(data.email);
        setIsValidating(false);
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenError(
          'Could not verify invitation token. Please try again later.'
        );
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      email: tokenEmail || '',
      password: ''
    }
  });

  // Update email field when tokenEmail changes
  useEffect(() => {
    if (tokenEmail) {
      form.setValue('email', tokenEmail);
    }
  }, [tokenEmail, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!token) {
        setTokenError(
          'No invitation token provided. Sign-up is by invitation only.'
        );
        return;
      }

      const formData = new FormData();
      formData.append('fullname', values.fullname);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('token', token);

      // Call the server action
      const result = await signUpAction(formData);

      // Check if the action was successful
      if (result?.success) {
        // Manually redirect to sign-in with success message
        router.push(
          '/sign-in?success=' +
            encodeURIComponent(
              'Thanks for signing up! Please check your email for a verification link.'
            )
        );
      }
    } catch (error: any) {
      // Don't log redirect errors as they are expected behavior
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        // If it's a redirect error, it means the server action tried to redirect
        // Extract the redirect URL from the digest and navigate manually
        const digestParts = error.digest.split(';');
        if (digestParts.length > 2) {
          const redirectUrl = digestParts[2];
          router.push(redirectUrl);
          return;
        }
      }
      console.error('Form submission error', error);
    }
  }

  // If validating or no token, show appropriate message
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Verifying invitation...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
        <div className="flex flex-col items-center p-6 border border-red-200 rounded-lg bg-red-50 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p className="text-sm text-gray-700 mb-4">{tokenError}</p>
          <p className="text-sm text-gray-600">
            Please contact your HR department to receive a valid invitation
            link.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push('/sign-in')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col min-w-64 max-w-64 mx-auto"
      >
        <h1 className="text-2xl font-medium">Sign Up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{' '}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" type="text" {...field} />
                </FormControl>
                <FormDescription>This is your full name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                    readOnly={!!tokenEmail}
                    className={tokenEmail ? 'bg-muted cursor-not-allowed' : ''}
                  />
                </FormControl>
                {tokenEmail && (
                  <FormDescription>
                    Email is pre-filled from your invitation and cannot be
                    changed.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Your password" {...field} />
                </FormControl>
                <FormDescription
                  className={cn(
                    form.formState.errors.password && 'text-destructive'
                  )}
                >
                  Password must contain at least 8 characters, one uppercase
                  letter, one lowercase letter, and one number.
                </FormDescription>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-4"
          >
            {form.formState.isSubmitting ? (
              <>
                <span className="mr-2">Signing up...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
