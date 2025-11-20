import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useRegisterCustomerMutation, 
  useLoginCustomerMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} from '@/store/api/customerAuthApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RootState } from '@/store';
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

const DEMO_CUSTOMER_EMAIL = 'jane@example.com';
const DEMO_CUSTOMER_PASSWORD = 'password';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [registerCustomer, { isLoading: isRegistering }] = useRegisterCustomerMutation();
  const [loginCustomer, { isLoading: isLoggingIn }] = useLoginCustomerMutation();
  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (view === 'login' && email === '' && password === '') {
      setEmail(DEMO_CUSTOMER_EMAIL);
      setPassword(DEMO_CUSTOMER_PASSWORD);
    } else if (view !== 'login' && email === DEMO_CUSTOMER_EMAIL && password === DEMO_CUSTOMER_PASSWORD) {
      setEmail('');
      setPassword('');
    }
  }, [view, email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const result = await loginCustomer({ email, password }).unwrap();
      dispatch(setCredentials({
        user: result.customer,
        token: result.token,
      }));
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.errors?.email?.[0] || 'Login failed';
      toast.error(errorMessage);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !passwordConfirmation) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const result = await registerCustomer({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone: phone || undefined,
        address: address || undefined,
      }).unwrap();
      
      dispatch(setCredentials({
        user: result.customer,
        token: result.token,
      }));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 
        Object.values(error?.data?.errors || {}).flat().join(', ') || 
        'Registration failed';
      toast.error(errorMessage);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const result = await forgotPassword({ email: resetEmail }).unwrap();
      toast.success(result.message || 'Password reset OTP sent to your email');
      setEmail(resetEmail);
      setView('reset-password');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 
        error?.data?.errors?.email?.[0] || 
        'Failed to send password reset OTP';
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    if (!password || !passwordConfirmation) {
      toast.error('Please enter new password and confirmation');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();
      
      toast.success('Password reset successful. You can now login with your new password.');
      setView('login');
      setPassword('');
      setPasswordConfirmation('');
      setOtp('');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 
        error?.data?.errors?.otp?.[0] || 
        error?.data?.errors?.password?.[0] || 
        'Password reset failed';
      toast.error(errorMessage);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      <Button 
        type="button"
        variant="link"
        className="px-0 text-sm"
        onClick={() => {
          setResetEmail(email);
          setView('forgot-password');
        }}
      >
        Forgot password?
      </Button>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Full Name *</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="John Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-phone">Phone (Optional)</Label>
        <Input
          id="register-phone"
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-address">Address (Optional)</Label>
        <Input
          id="register-address"
          type="text"
          placeholder="123 Main St, City, Country"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type="password"
            placeholder="At least 8 characters"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-12"
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password-confirmation">Confirm Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password-confirmation"
            type="password"
            placeholder="Confirm your password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="pl-10 h-12"
            minLength={8}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
        disabled={isRegistering}
      >
        {isRegistering ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="john@example.com"
            required
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          We'll send you a password reset OTP
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
        disabled={isSendingOtp}
      >
        {isSendingOtp ? 'Sending...' : 'Send Reset OTP'}
      </Button>

      <Button 
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setView('login')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </Button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          disabled
          className="h-12 bg-muted"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="reset-otp">Enter Verification Code</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Code expires in 10 minutes
        </p>
        <p className="text-xs text-center text-primary font-medium bg-primary/10 py-2 px-3 rounded-md">
          💡 Hint: For testing, use OTP: <strong>123456</strong>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password">New Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-password"
            type="password"
            placeholder="At least 8 characters"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-12"
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password-confirmation">Confirm New Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-password-confirmation"
            type="password"
            placeholder="Confirm your new password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="pl-10 h-12"
            minLength={8}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
        disabled={isResetting || otp.length !== 6}
      >
        {isResetting ? 'Resetting...' : 'Reset Password'}
      </Button>

      <Button 
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setView('forgot-password');
          setOtp('');
          setPassword('');
          setPasswordConfirmation('');
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
    </form>
  );

  const getViewTitle = () => {
    switch (view) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'Enter OTP';
      default:
        return 'Welcome';
    }
  };

  const getViewDescription = () => {
    switch (view) {
      case 'login':
        return 'Login to your account to continue';
      case 'register':
        return 'Create a new account to get started';
      case 'forgot-password':
        return 'Enter your email to receive a password reset OTP';
      case 'reset-password':
        return 'Enter the OTP sent to your email and set a new password';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">{getViewTitle()}</CardTitle>
            <CardDescription className="text-base mt-2">
              {getViewDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {view === 'login' || view === 'register' ? (
            <Tabs 
              value={view} 
              onValueChange={(value) => {
                setView(value as AuthView);
                setPassword('');
                setPasswordConfirmation('');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                {renderLoginForm()}
              </TabsContent>
              <TabsContent value="register" className="mt-6">
                {renderRegisterForm()}
              </TabsContent>
            </Tabs>
          ) : view === 'forgot-password' ? (
            renderForgotPasswordForm()
          ) : (
            renderResetPasswordForm()
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2 border-t pt-6">
          {view === 'login' || view === 'register' ? (
            <>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service
              </p>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-sm w-full"
              >
                Admin/Staff Login →
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerAuth;
