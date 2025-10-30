import { useCallback } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useZodForm } from './UseZodForm';

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type SignInValues = z.infer<typeof signInSchema>;

const signUpSchema = signInSchema;
type SignUpValues = z.infer<typeof signUpSchema>;

interface AuthFormBaseProps {
  onSuccess?: () => void;
}

export const SignInForm = ({ onSuccess }: AuthFormBaseProps) => {
  const { signIn } = useAuth();
  const form = useZodForm(signInSchema, {
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = useCallback(
    async (values: SignInValues) => {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast.error(error.message ?? 'Unable to sign in');
        return;
      }
      toast.success('Successfully signed in!');
      onSuccess?.();
      form.reset({ email: values.email, password: '' });
    },
    [form, onSuccess, signIn],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={320}
                  placeholder="you@example.com"
                />
              </FormControl>
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
                <Input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="********"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
};

export const SignUpForm = ({ onSuccess }: AuthFormBaseProps) => {
  const { signUp } = useAuth();
  const form = useZodForm(signUpSchema, {
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = useCallback(
    async (values: SignUpValues) => {
      const { error } = await signUp(values.email, values.password);
      if (error) {
        toast.error(error.message ?? 'Unable to sign up');
        return;
      }
      toast.success('Check your email to confirm your account!');
      onSuccess?.();
      form.reset({ email: '', password: '' });
    },
    [form, onSuccess, signUp],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={320}
                  placeholder="you@example.com"
                />
              </FormControl>
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
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="At least 8 characters"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
};
