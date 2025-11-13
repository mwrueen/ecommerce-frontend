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
import { RootState } from '@/store';
import { Phone, ShieldCheck } from 'lucide-react';

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
      // Try login first
      let result;
      try {
        result = await loginCustomer({ phone, otp }).unwrap();
        toast.success('Welcome back!');
      } catch (loginError: any) {
        // If login fails, try registration
        if (loginError?.data?.message?.includes('not found') || loginError?.status === 404) {
          result = await registerCustomer({ phone, otp }).unwrap();
          toast.success('Account created successfully!');
        } else {
          throw loginError;
        }
      }
      
      dispatch(setCredentials({
        user: result.customer,
        token: result.token,
      }));
      
      navigate('/');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.data?.errors?.otp?.[0] || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your phone number to continue
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  className="text-base h-12"
                />
                <Button 
                  type="button" 
                  onClick={handleSendOtp} 
                  disabled={isSendingOtp || otpSent}
                  className="h-12 px-6"
                >
                  {isSendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                </Button>
              </div>
              {!otpSent && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  We'll send you a verification code
                </p>
              )}
            </div>
            
            {otpSent && (
              <div className="space-y-3 animate-in fade-in-50 duration-300">
                <Label htmlFor="otp" className="text-base">Enter Verification Code</Label>
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
                  Code expires in 10 minutes • Testing OTP: 654321
                </p>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base" 
                  disabled={isRegistering || isLoggingIn || otp.length !== 6}
                >
                  {isRegistering || isLoggingIn ? 'Verifying...' : 'Continue'}
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 border-t pt-6">
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CustomerAuth;
