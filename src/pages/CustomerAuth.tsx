import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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



const CustomerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [registerCustomer, { isLoading: isRegistering }] = useRegisterCustomerMutation();
  const [loginCustomer, { isLoading: isLoggingIn }] = useLoginCustomerMutation();
  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  
  const [view, setView] = useState<AuthView>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'register' ? 'register' : 'login';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const redirectPath = (location.state as { from?: string } | null)?.from || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectPath]);



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
      navigate(redirectPath, { replace: true });
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
      navigate(redirectPath, { replace: true });
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
        className="w-full h-12 bg-primary text-white hover:bg-primary/90"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Don't have an account?{' '}
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={() => setView('register')}
        >
          Register
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
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
        <div className="space-y-2 md:col-span-2">
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
        <div className="space-y-2 md:col-span-2">
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
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-primary text-white hover:bg-primary/90"
        disabled={isRegistering}
      >
        {isRegistering ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={() => setView('login')}
        >
          Sign In
        </button>
      </p>
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

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
      >
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(139,92,246,0.18)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', top: '42%', left: '60%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(167,139,250,0.10)' }} />

        {/* Top logo */}
        <div className="px-14 pt-12">
          <div className="flex items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>M</span>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '20px', letterSpacing: '0.5px' }}>My Ecommerce Store</span>
          </div>
        </div>

        {/* Center content */}
        <div className="px-14 py-8" style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
            Shop Smarter,<br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Better</span>
          </h2>
          <p style={{ color: '#c4b5fd', fontSize: '1rem', marginBottom: '36px', lineHeight: 1.7 }}>
            Join thousands of customers enjoying exclusive deals, fast shipping, and world-class support.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '🛒', title: 'Fast & Secure Checkout', desc: 'Encrypted payments, multiple methods' },
              { icon: '🎁', title: 'Exclusive Member Discounts', desc: 'Up to 40% off for members' },
              { icon: '📦', title: 'Real-Time Order Tracking', desc: 'Know where your order is, always' },
              { icon: '💬', title: '24/7 Customer Support', desc: 'We\'re here whenever you need us' },
            ].map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '22px' }}>{f.icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{f.title}</div>
                  <div style={{ color: '#a5b4fc', fontSize: '0.75rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="px-14 pb-10" style={{ zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px', borderLeft: '3px solid #7c3aed' }}>
            <p style={{ color: '#e0e7ff', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '8px' }}>
              "Best shopping experience I've had. Fast delivery and amazing deals every week!"
            </p>
            <span style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600 }}>— Sarah K., Verified Customer</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {view === 'login' && 'Sign In'}
              {view === 'register' && 'Create Account'}
              {view === 'forgot-password' && 'Forgot Password'}
              {view === 'reset-password' && 'Reset Password'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {view === 'login' && 'Enter your credentials to access your account'}
              {view === 'register' && 'Fill in your details to get started'}
              {view === 'forgot-password' && 'Enter your email to receive a reset code'}
              {view === 'reset-password' && 'Enter the OTP sent to your email'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-8">
            {view === 'login' && renderLoginForm()}
            {view === 'register' && renderRegisterForm()}
            {view === 'forgot-password' && renderForgotPasswordForm()}
            {view === 'reset-password' && renderResetPasswordForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
