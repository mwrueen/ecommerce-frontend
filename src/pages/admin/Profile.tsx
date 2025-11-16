import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useUpdateProfilePasswordMutation 
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Edit2, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { toast } = useToast();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  
  const { data: profileData, isLoading } = useGetProfileQuery(undefined);
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

  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name || '',
        email: profileData.data.email || '',
        phone: profileData.data.phone || '',
        address: profileData.data.address || ''
      });
    }
  }, [profileData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      toast({ title: 'Success', description: 'Profile updated successfully' });
      setIsEditingInfo(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to update profile',
        variant: 'destructive' 
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    try {
      await updatePassword(passwordData).unwrap();
      toast({ title: 'Success', description: 'Password updated successfully' });
      setIsEditingPassword(false);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to update password',
        variant: 'destructive' 
      });
    }
  };

  const profile = profileData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          My Profile
        </h2>
        <p className="text-muted-foreground">Manage your profile information and settings</p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          {!isEditingInfo ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateInfo} disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditingInfo ? (
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-base font-medium">{profile.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-base font-medium">{profile.phone || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">System Role</p>
                <Badge variant="default">{profile.role}</Badge>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-base font-medium">{profile.address || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned Role</p>
                {profile.role_model ? (
                  <Badge variant="secondary">{profile.role_model.name}</Badge>
                ) : (
                  <Badge variant="outline">No Role Assigned</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                {profile.status === 'active' ? (
                  <Badge variant="default">Active</Badge>
                ) : profile.status === 'banned' ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="secondary">{profile.status}</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="text-base font-medium">
                  {profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-base font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
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
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => {
                  setIsEditingPassword(false);
                  setPasswordData({ current_password: '', password: '', password_confirmation: '' });
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingPassword}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Keep your account secure by using a strong password.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
