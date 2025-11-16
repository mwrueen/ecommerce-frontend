import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Power, PowerOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
} from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

export default function CouponsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useGetCouponsQuery({
    page,
    per_page: 10,
    search,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  });

  const [deleteCoupon] = useDeleteCouponMutation();
  const [toggleStatus] = useToggleCouponStatusMutation();

  const handleDelete = async () => {
    if (!selectedCouponId) return;

    try {
      await deleteCoupon(selectedCouponId).unwrap();
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete coupon',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCouponId(null);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id).unwrap();
      toast({
        title: 'Success',
        description: 'Coupon status updated successfully',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  };

  const coupons = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coupons Management</h1>
          <p className="text-muted-foreground">Manage discount coupons and promotions</p>
        </div>
        <Link to="/admin/coupons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No coupons found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon: any) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold">
                      {coupon.code}
                    </TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </TableCell>
                    <TableCell>
                      {coupon.usage_count || 0}
                      {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                    </TableCell>
                    <TableCell>
                      {coupon.valid_until
                        ? new Date(coupon.valid_until).toLocaleDateString()
                        : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/coupons/${coupon.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/coupons/${coupon.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(coupon.id)}
                        >
                          {coupon.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCouponId(coupon.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.last_page}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
