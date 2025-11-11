import { useState } from 'react';
import { useGetUsersQuery, useBanUserMutation, useUnbanUserMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Ban, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UsersManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  
  const { data, isLoading } = useGetUsersQuery({ page, per_page: 10, search });
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">Manage user accounts</p>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'active' 
                        ? 'bg-primary/10 text-primary' 
                        : user.status === 'banned'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.orders_count || 0}</TableCell>
                  <TableCell>${user.total_spent || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBanToggle(user.id, user.status, user.name)}
                      disabled={user.role === 'admin'}
                    >
                      {user.status === 'banned' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {data?.meta?.from || 0} to {data?.meta?.to || 0} of {data?.meta?.total || 0} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= (data?.meta?.last_page || 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
