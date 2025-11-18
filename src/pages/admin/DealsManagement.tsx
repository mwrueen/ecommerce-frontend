import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllDealsQuery, useDeleteDealMutation, useToggleDealActiveMutation, useToggleDealFeaturedMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, Eye, Power, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function DealsManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useGetAllDealsQuery({
    search: search || undefined,
    type: type === 'all' ? undefined : type,
    is_active: isActive === 'all' ? undefined : isActive === 'true',
    per_page: 15,
    page,
  });

  const [deleteDeal] = useDeleteDealMutation();
  const [toggleActive] = useToggleDealActiveMutation();
  const [toggleFeatured] = useToggleDealFeaturedMutation();

  const deals = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDeal(deleteId).unwrap();
      toast.success('Deal deleted successfully');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete deal');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActive(id).unwrap();
      toast.success('Deal status updated');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update deal');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success('Featured status updated');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update deal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deals Management</h1>
          <p className="text-muted-foreground">Manage promotional deals and offers</p>
        </div>
        <Button onClick={() => navigate('/admin/deals/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="flash">Flash Sale</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  <SelectItem value="minimum_purchase">Minimum Purchase</SelectItem>
                </SelectContent>
              </Select>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
            <CardDescription>
              {pagination?.total || 0} total deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : deals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No deals found</TableCell>
                  </TableRow>
                ) : (
                  deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-sm text-muted-foreground">{deal.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deal.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.discount_type === 'percentage' 
                          ? `${deal.discount_value}%` 
                          : `$${deal.discount_value}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={deal.is_active ? 'default' : 'secondary'}>
                            {deal.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {deal.is_featured && (
                            <Badge variant="default">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={deal.is_valid ? 'default' : 'destructive'}>
                          {deal.is_valid ? 'Valid' : 'Expired'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.usage_count} / {deal.usage_limit || '∞'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/deals/${deal.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/deals/${deal.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(deal.id)}>
                              <Power className="h-4 w-4 mr-2" />
                              {deal.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(deal.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              {deal.is_featured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(deal.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Deal"
        description="Are you sure you want to delete this deal? This action cannot be undone."
      />
    </div>
  );
}
