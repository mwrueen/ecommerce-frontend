import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSendOtpMutation, useRegisterCustomerMutation, useLoginCustomerMutation } from '@/store/api/customerAuthApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/store';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [registerCustomer, { isLoading: isRegistering }] = useRegisterCustomerMutation();
  const [loginCustomer, { isLoading: isLoggingIn }] = useLoginCustomerMutation();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('login');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error('Please enter phone number');
      return;
    }

    try {
      const result = await sendOtp({ phone }).unwrap();
      toast.success(result.message);
      toast.info(`OTP for testing: ${result.otp}`);
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    try {
      const mutation = mode === 'register' ? registerCustomer : loginCustomer;
      const result = await mutation({ phone, otp }).unwrap();
      
      dispatch(setCredentials({
        user: result.customer,
        token: result.token,
      }));
      
      toast.success(result.message);
      
      // If registering, go to profile completion, otherwise go home
      if (mode === 'register') {
        navigate('/customer/profile');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.data?.errors?.otp?.[0] || 'Authentication failed');
    }
  };

  const handleTabChange = (value: string) => {
    setMode(value as 'register' | 'login');
    setOtpSent(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Customer Authentication</CardTitle>
          <CardDescription>Login or register using your phone number</CardDescription>
        </CardHeader>
        <Tabs value={mode} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-4 mx-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="login">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-login">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone-login"
                      type="tel"
                      placeholder="+1234567890"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpSent}
                    />
                    <Button 
                      type="button" 
                      onClick={handleSendOtp} 
                      disabled={isSendingOtp || otpSent}
                    >
                      {otpSent ? 'Sent' : 'Send OTP'}
                    </Button>
                  </div>
                </div>
                
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp-login">Enter OTP</Label>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-muted-foreground">
                      OTP expires in 10 minutes. Testing OTP: 654321
                    </p>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-register">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone-register"
                      type="tel"
                      placeholder="+1234567890"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpSent}
                    />
                    <Button 
                      type="button" 
                      onClick={handleSendOtp} 
                      disabled={isSendingOtp || otpSent}
                    >
                      {otpSent ? 'Sent' : 'Send OTP'}
                    </Button>
                  </div>
                </div>
                
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp-register">Enter OTP</Label>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-muted-foreground">
                      OTP expires in 10 minutes. Testing OTP: 654321
                    </p>
                  </div>
                )}
              </CardContent>
            </TabsContent>
            
            <CardFooter className="flex flex-col gap-4">
              {otpSent && (
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isRegistering || isLoggingIn}
                >
                  {mode === 'register' 
                    ? (isRegistering ? 'Registering...' : 'Register') 
                    : (isLoggingIn ? 'Logging in...' : 'Login')
                  }
                </Button>
              )}
              <Button 
                type="button" 
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Admin/Staff Login
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerAuth;
