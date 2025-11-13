import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserX, UserCheck, Ban, ShieldAlert, Eye } from 'lucide-react';
import { useGetCustomersQuery, useBanCustomerMutation, useUnbanCustomerMutation, useSuspendCustomerMutation, useUnsuspendCustomerMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function CustomersManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'ban' | 'suspend' | null; customerId: number | null }>({
    open: false,
    type: null,
    customerId: null,
  });
  const [reason, setReason] = useState('');

  const queryParams: any = {
    page,
    per_page: 15,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  if (search) queryParams.search = search;
  if (statusFilter === 'banned') queryParams.is_banned = 'true';
  if (statusFilter === 'suspended') queryParams.is_suspended = 'true';

  const { data: customersData, isLoading, refetch } = useGetCustomersQuery(queryParams);
  const [banCustomer, { isLoading: isBanning }] = useBanCustomerMutation();
  const [unbanCustomer, { isLoading: isUnbanning }] = useUnbanCustomerMutation();
  const [suspendCustomer, { isLoading: isSuspending }] = useSuspendCustomerMutation();
  const [unsuspendCustomer, { isLoading: isUnsuspending }] = useUnsuspendCustomerMutation();

  const customers = customersData?.data || [];
  const pagination = customersData?.pagination || { current_page: 1, last_page: 1, total: 0 };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleActionDialog = (type: 'ban' | 'suspend', customerId: number) => {
    setActionDialog({ open: true, type, customerId });
    setReason('');
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null, customerId: null });
    setReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionDialog.customerId || !actionDialog.type) return;

    try {
      if (actionDialog.type === 'ban') {
        await banCustomer({ id: actionDialog.customerId, reason }).unwrap();
        toast({ title: 'Success', description: 'Customer banned successfully' });
      } else {
        await suspendCustomer({ id: actionDialog.customerId, reason }).unwrap();
        toast({ title: 'Success', description: 'Customer suspended successfully' });
      }
      closeActionDialog();
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  const handleUnban = async (customerId: number) => {
    try {
      await unbanCustomer(customerId).unwrap();
      toast({ title: 'Success', description: 'Customer unbanned successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to unban customer',
        variant: 'destructive',
      });
    }
  };

  const handleUnsuspend = async (customerId: number) => {
    try {
      await unsuspendCustomer(customerId).unwrap();
      toast({ title: 'Success', description: 'Customer unsuspended successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to unsuspend customer',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (customer: any) => {
    if (customer.is_banned) {
      return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Banned</Badge>;
    }
    if (customer.is_suspended) {
      return <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3 w-3" />Suspended</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor customer accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>View and manage all customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Joined</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="orders_count">Orders Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No customers found</div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-foreground">{customer.email}</div>
                            <div className="text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.orders_count || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/customers/${customer.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {customer.is_banned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnban(customer.id)}
                                disabled={isUnbanning}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleActionDialog('ban', customer.id)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                            {customer.is_suspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnsuspend(customer.id)}
                                disabled={isUnsuspending}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleActionDialog('suspend', customer.id)}
                                disabled={customer.is_banned}
                              >
                                <ShieldAlert className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.last_page > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                          className={page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'ban' ? 'Ban Customer' : 'Suspend Customer'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'ban'
                ? 'Banned customers cannot add items to cart or place orders. This action can be reversed.'
                : 'Suspended customers cannot add items to cart or place orders. This action can be reversed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${actionDialog.type === 'ban' ? 'banning' : 'suspending'} this customer...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">{reason.length}/1000 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'ban' ? 'destructive' : 'secondary'}
              onClick={handleConfirmAction}
              disabled={isBanning || isSuspending}
            >
              {actionDialog.type === 'ban' ? 'Ban Customer' : 'Suspend Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
