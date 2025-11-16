import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetUserQuery, 
  useUpdateUserMutation,
  useUpdateUserPasswordMutation,
  useGetRolesQuery,
  useAssignRoleToUserMutation,
  useBanUserMutation,
  useUnbanUserMutation 
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X, Edit2, Ban, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: userData, isLoading } = useGetUserQuery(id || '');
  const { data: rolesData } = useGetRolesQuery({});
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateUserPasswordMutation();
  const [assignRole, { isLoading: isAssigningRole }] = useAssignRoleToUserMutation();
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || '',
        email: userData.data.email || '',
        phone: userData.data.phone || '',
        address: userData.data.address || '',
        status: userData.data.status || 'active'
      });
      setSelectedRoleId(userData.data.role_id?.toString() || '');
    }
  }, [userData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ id, ...formData }).unwrap();
      toast({ title: 'Success', description: 'User information updated successfully' });
      setIsEditingInfo(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to update user',
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) return;
    try {
      await assignRole({ userId: parseInt(id || '0'), roleId: parseInt(selectedRoleId) }).unwrap();
      toast({ title: 'Success', description: 'Role assigned successfully' });
      setIsEditingRole(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to assign role',
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
      await updatePassword({ 
        userId: parseInt(id || '0'), 
        ...passwordData 
      }).unwrap();
      toast({ title: 'Success', description: 'Password updated successfully' });
      setIsEditingPassword(false);
      setPasswordData({ password: '', password_confirmation: '' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to update password',
        variant: 'destructive' 
      });
    }
  };

  const handleBanToggle = async () => {
    try {
      if (userData?.data?.status === 'banned') {
        await unbanUser(parseInt(id || '0')).unwrap();
        toast({ title: 'Success', description: 'User unbanned successfully' });
      } else {
        await banUser(parseInt(id || '0')).unwrap();
        toast({ title: 'Success', description: 'User banned successfully' });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.data?.message || 'Failed to update user status',
        variant: 'destructive' 
      });
    }
  };

  const roles = rolesData?.data || [];
  const user = userData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">User Details</h2>
          <p className="text-muted-foreground">View and manage user information</p>
        </div>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Information</CardTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
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
                <p className="text-base font-medium">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-base font-medium">{user.phone || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                {user.status === 'active' ? (
                  <Badge variant="default">Active</Badge>
                ) : user.status === 'banned' ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="secondary">{user.status}</Badge>
                )}
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-base font-medium">{user.address || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">System Role</p>
                <Badge variant="default">{user.role}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="text-base font-medium">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Assignment
          </CardTitle>
          {!isEditingRole ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingRole(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Change Role
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingRole(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateRole} disabled={isAssigningRole}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditingRole ? (
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Role</p>
              {user.role_id ? (
                <Badge variant="secondary" className="text-base">
                  {roles.find((r: any) => r.id === user.role_id)?.name || 'Unknown Role'}
                </Badge>
              ) : (
                <Badge variant="outline">No Role Assigned</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Reset Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Password Reset</CardTitle>
          {!isEditingPassword && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingPassword ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                <Label htmlFor="password_confirmation">Confirm Password</Label>
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
                  setPasswordData({ password: '', password_confirmation: '' });
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
              Click "Reset Password" to set a new password for this user.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant={user.status === 'banned' ? 'default' : 'destructive'}
              onClick={handleBanToggle}
            >
              {user.status === 'banned' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Unban User
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
