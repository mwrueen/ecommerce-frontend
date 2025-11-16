import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetUsersQuery, 
  useBanUserMutation, 
  useUnbanUserMutation,
  useGetRolesQuery,
  useAssignRoleToUserMutation 
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Ban, CheckCircle, UserCog, Shield, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UsersManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const { toast } = useToast();
  
  const { data, isLoading } = useGetUsersQuery({ page, per_page: 10, search });
  const { data: rolesData } = useGetRolesQuery({});
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [assignRole, { isLoading: isAssigning }] = useAssignRoleToUserMutation();

  const handleBanToggle = async (id: number, status: string, name: string) => {
    try {
      if (status === 'banned') {
        await unbanUser(id).unwrap();
        toast({ title: `${name} has been unbanned` });
      } else {
        await banUser(id).unwrap();
        toast({ title: `${name} has been banned` });
      }
    } catch (error) {
      toast({ title: 'Action failed', variant: 'destructive' });
    }
  };

  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role_id?.toString() || '');
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      await assignRole({
        userId: selectedUser.id,
        roleId: parseInt(selectedRoleId),
      }).unwrap();
      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });
      setSelectedUser(null);
      setSelectedRoleId('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const roles = rolesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Users Management
          </h2>
          <p className="text-muted-foreground">Manage admin user accounts and roles</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">No users found</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role_id ? (
                      <Badge variant="secondary">
                        {roles.find((r: any) => r.id === user.role_id)?.name || 'Unknown Role'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Role</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <Badge variant="default">Active</Badge>
                    ) : user.status === 'banned' ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="secondary">{user.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRoleDialog(user)}
                        title="Assign Role"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBanToggle(user.id, user.status, user.name)}
                        disabled={user.role === 'admin'}
                        title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                      >
                        {user.status === 'banned' ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Ban className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.current_page - 1) * data.pagination.per_page + 1} to{' '}
            {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total)} of{' '}
            {data.pagination.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={data.pagination.current_page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={data.pagination.current_page === data.pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{role.name}</span>
                        {role.is_active && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedUser?.role_model && (
              <div className="text-sm text-muted-foreground">
                Current role: <strong>{selectedUser.role_model.name}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={isAssigning || !selectedRoleId}>
              {isAssigning ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
