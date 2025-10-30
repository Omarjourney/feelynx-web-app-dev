import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getUserMessage } from '@/lib/errors';
import { validators, validateObject, FieldErrors } from '@/lib/validation';
import FlowBreadcrumb from '@/components/FlowBreadcrumb';
import IvibesLogo from '@/components/brand/IvibesLogo';
import { BRAND } from '@/config';

type AuthTab = 'signin' | 'signup';

export default function Auth() {
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({
    signIn: { email: '', password: '' },
    signUp: { email: '', password: '' },
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const resetErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const validate = () => {
    const obj = { email, password };
    const rules = {
      email: validators.email,
      password: (v: string) => validators.password(v, { min: 6 }),
    } as const;
    const errs = validateObject(obj, rules as any) as FieldErrors<typeof obj>;
    // For sign-in, relax min length check: allow any non-empty
    if (activeTab === 'signin' && !errs.password && !password) {
      errs.password = 'Password is required.';
    }
    setFieldErrors(errs);
    return errs;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        const message = getUserMessage(error);
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success('Successfully signed in!');
      setSignInForm({ email: trimmedEmail, password: '' });
      navigate('/');
    } catch (error) {
      const message = getUserMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email.trim(), password);

      if (error) {
        const message = getUserMessage(error);
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success('Check your email to confirm your account!');
    } catch (error) {
      const message = getUserMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (mode: AuthTab) => (
    <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${mode}-email-error` : undefined}
          className={cn(fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
          required
        />
        {fieldErrors.email && (
          <p id={`${mode}-email-error`} className="text-sm text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? `${mode}-password-error` : undefined}
          className={cn(
            fieldErrors.password && 'border-destructive focus-visible:ring-destructive',
          )}
          required
          minLength={6}
        />
        {fieldErrors.password && (
          <p id={`${mode}-password-error`} className="text-sm text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>
      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? mode === 'signin'
            ? 'Signing in...'
            : 'Creating account...'
          : mode === 'signin'
            ? 'Sign In'
            : 'Sign Up'}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      {BRAND.v2Wordmark ? (
        <IvibesLogo size={220} glow tagline="Welcome back" />
      ) : (
        <span className="text-2xl font-semibold text-foreground">iVibes</span>
      )}
      <Card className="w-full max-w-md border border-border/60 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-4">
          <FlowBreadcrumb currentStep="login" />
          <CardTitle>Welcome to iVibes</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="signin"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as AuthTab);
              resetErrors();
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">{renderForm('signin')}</TabsContent>

            <TabsContent value="signup">{renderForm('signup')}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
