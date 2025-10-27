import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({
    signIn: { email: '', password: '' },
    signUp: { email: '', password: '' },
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordComplexity = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signInForm.email.trim();
    const validation = {
      email: '',
      password: '',
    };

    if (!trimmedEmail) {
      validation.email = 'Email is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      validation.email = 'Enter a valid email address.';
    }

    if (!signInForm.password) {
      validation.password = 'Password is required.';
    } else if (signInForm.password.length < 6) {
      validation.password = 'Password must be at least 6 characters.';
    }

    setErrors((prev) => ({ ...prev, signIn: validation }));

    if (validation.email || validation.password) {
      return;
    }

    setLoading(true);

    const { error } = await signIn(trimmedEmail, signInForm.password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully signed in!');
      setSignInForm({ email: trimmedEmail, password: '' });
      navigate('/');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signUpForm.email.trim();
    const validation = {
      email: '',
      password: '',
    };

    if (!trimmedEmail) {
      validation.email = 'Email is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      validation.email = 'Enter a valid email address.';
    }

    if (!signUpForm.password) {
      validation.password = 'Password is required.';
    } else if (!passwordComplexity.test(signUpForm.password)) {
      validation.password = 'Password must be at least 8 characters and include a number.';
    }

    setErrors((prev) => ({ ...prev, signUp: validation }));

    if (validation.email || validation.password) {
      return;
    }

    setLoading(true);

    const { error } = await signUp(trimmedEmail, signUpForm.password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to confirm your account!');
      setSignUpForm({ email: trimmedEmail, password: '' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Feelynx</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signInForm.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSignInForm((prev) => ({ ...prev, email: value }));
                      setErrors((prev) => ({
                        ...prev,
                        signIn: { ...prev.signIn, email: '' },
                      }));
                    }}
                    required
                  />
                  {errors.signIn.email && (
                    <p className="text-sm text-destructive">{errors.signIn.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signInForm.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSignInForm((prev) => ({ ...prev, password: value }));
                      setErrors((prev) => ({
                        ...prev,
                        signIn: { ...prev.signIn, password: '' },
                      }));
                    }}
                    required
                  />
                  {errors.signIn.password && (
                    <p className="text-sm text-destructive">{errors.signIn.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signUpForm.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSignUpForm((prev) => ({ ...prev, email: value }));
                      setErrors((prev) => ({
                        ...prev,
                        signUp: { ...prev.signUp, email: '' },
                      }));
                    }}
                    required
                  />
                  {errors.signUp.email && (
                    <p className="text-sm text-destructive">{errors.signUp.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signUpForm.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSignUpForm((prev) => ({ ...prev, password: value }));
                      setErrors((prev) => ({
                        ...prev,
                        signUp: { ...prev.signUp, password: '' },
                      }));
                    }}
                    required
                    minLength={8}
                  />
                  {errors.signUp.password && (
                    <p className="text-sm text-destructive">{errors.signUp.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
