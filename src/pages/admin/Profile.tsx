import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useUpdateProfilePasswordMutation 
} from '@/hooks/useApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  X, 
  Edit2, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  address: string | null;
  role: string;
  status: string;
  role_id: number | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roleModel?: {
    id: number;
    name: string;
    slug: string;
  };
  role_model?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface FormErrors {
  [key: string]: string[];
}

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser, token } = useSelector((state: RootState) => state.auth);
  
  const { data: profileData, isLoading, error: profileError } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateProfilePasswordMutation();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data as ProfileData;
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profileData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      const result = await updateProfile(formData).unwrap();
      
      // Update auth state with new profile data
      if (result.data && token) {
        dispatch(setCredentials({
          user: result.data,
          token: token,
        }));
      }
      
      toast.success(result.message || 'Profile updated successfully');
      setIsEditingInfo(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update profile';
      const errors = error?.data?.errors;
      
      if (errors) {
        setFormErrors(errors);
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((msg: string) => toast.error(`${key}: ${msg}`));
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordErrors({
        password_confirmation: ['The password confirmation does not match.']
      });
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 8) {
      setPasswordErrors({
        password: ['The password must be at least 8 characters.']
      });
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      const result = await updatePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation
      }).unwrap();
      
      toast.success(result.message || 'Password updated successfully');
      setIsEditingPassword(false);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update password';
      const errors = error?.data?.errors;
      
      if (errors) {
        setPasswordErrors(errors);
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((msg: string) => toast.error(`${key}: ${msg}`));
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingInfo(false);
    setFormErrors({});
    if (profileData?.data) {
      const profile = profileData.data as ProfileData;
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setPasswordErrors({});
    setPasswordData({ current_password: '', password: '', password_confirmation: '' });
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profile = profileData?.data as ProfileData | undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {profileError ? 'Failed to load profile information' : 'Profile not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your profile information and account settings
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={profile.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription className="mt-2">{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant={profile.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {profile.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                    {profile.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                {(profile.roleModel || profile.role_model) && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned Role</span>
                      <Badge variant="secondary">
                        {(profile.roleModel || profile.role_model)?.name}
                      </Badge>
                    </div>
                  </>
                )}
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last Login</span>
                  </div>
                  <p className="text-sm font-medium pl-6">
                    {profile.last_login_at 
                      ? new Date(profile.last_login_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member Since</span>
                  </div>
                  <p className="text-sm font-medium pl-6">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update your personal information and contact details
                  </CardDescription>
                </div>
                {!isEditingInfo ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleUpdateInfo} 
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isEditingInfo ? (
                  <form onSubmit={handleUpdateInfo} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          maxLength={255}
                          className={formErrors.name ? 'border-destructive' : ''}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-destructive">{formErrors.name[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-sm text-destructive">{formErrors.email[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            maxLength={20}
                            className={`pl-10 ${formErrors.phone ? 'border-destructive' : ''}`}
                            placeholder="+1234567890"
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-sm text-destructive">{formErrors.phone[0]}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className={`pl-10 ${formErrors.address ? 'border-destructive' : ''}`}
                          placeholder="123 Main Street, City, State, Country"
                        />
                      </div>
                      {formErrors.address && (
                        <p className="text-sm text-destructive">{formErrors.address[0]}</p>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </div>
                        <p className="text-base font-medium">{profile.name}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>Email Address</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-medium">{profile.email}</p>
                          {profile.email_verified_at && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>Phone Number</span>
                        </div>
                        <p className="text-base font-medium">{profile.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>System Role</span>
                        </div>
                        <Badge variant="default">{profile.role}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Address</span>
                      </div>
                      <p className="text-base font-medium">{profile.address || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update your password to keep your account secure
                  </CardDescription>
                </div>
                {!isEditingPassword && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingPassword ? (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">
                        Current Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        required
                        className={passwordErrors.current_password ? 'border-destructive' : ''}
                      />
                      {passwordErrors.current_password && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.current_password[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                        required
                        minLength={8}
                        className={passwordErrors.password ? 'border-destructive' : ''}
                      />
                      {passwordErrors.password && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.password[0]}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">
                        Confirm New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={passwordData.password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                        required
                        minLength={8}
                        className={passwordErrors.password_confirmation ? 'border-destructive' : ''}
                      />
                      {passwordErrors.password_confirmation && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.password_confirmation[0]}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={handleCancelPassword}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isUpdatingPassword}
                        className="flex-1"
                      >
                        {isUpdatingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Keep your account secure by using a strong, unique password. 
                      Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
