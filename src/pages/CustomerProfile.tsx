import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCustomerProfileQuery, useUpdateCustomerProfileMutation } from '@/store/api/customerAuthApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RootState } from '@/store';
import { Loader2 } from 'lucide-react';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetCustomerProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateCustomerProfileMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        address: profile.address || '',
      });
      if (profile.profile_picture_url) {
        setPreviewUrl(profile.profile_picture_url);
      }
    }
  }, [profileData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast.error('Name and address are required');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      formDataToSend.append('address', formData.address);
      
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const result = await updateProfile(formDataToSend).unwrap();
      
      dispatch(setCredentials({
        user: result.data,
        token: token!,
      }));
      
      toast.success(result.message);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update profile';
      const errors = error?.data?.errors;
      
      if (errors) {
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((msg: string) => toast.error(msg));
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const getInitials = () => {
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profileData?.data?.phone?.slice(-2) || '??';
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Error Loading Profile</CardTitle>
            <CardDescription>Failed to load your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Label htmlFor="profile-picture" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-input rounded-lg hover:border-primary transition-colors">
                    <span className="text-sm text-muted-foreground">
                      {profilePicture ? profilePicture.name : 'Upload Profile Picture'}
                    </span>
                  </div>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum size: 2MB. Formats: JPEG, PNG, JPG, GIF
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData?.data?.phone || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Phone number cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="123 Main Street, City, State 12345"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CustomerProfile;
