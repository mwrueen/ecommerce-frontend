import { useState } from 'react';
import { useGetProductsQuery, useDeleteProductMutation, useGetPublicSettingsQuery, useExportProductsMutation } from '@/hooks/useApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Eye, Download, Filter, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { formatPrice } from '@/lib/currency';
import { toast as sonnerToast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, getStorageUrl } from '@/lib/utils';

export default function ProductsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings } = useGetPublicSettingsQuery({});

  // Fetch categories for filter
  const { data: categoriesData } = useGetCategoriesQuery({
    sort_by: 'name',
    sort_order: 'asc',
  });

  const categories = categoriesData?.data || [];

  const { data, isLoading } = useGetProductsQuery({
    page,
    per_page: 10,
    search: search || undefined,
    ...(categoryId !== 'all' && { category_id: parseInt(categoryId) })
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [exportProducts, { isLoading: isExporting }] = useExportProductsMutation();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteProduct(deleteId).unwrap();
      toast({ title: 'Product deleted successfully' });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportProducts({}).unwrap();
      sonnerToast.success('Products exported successfully');
    } catch (error) {
      sonnerToast.error('Failed to export products');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Export
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/products/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-lg bg-muted/50 border border-dashed">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryId !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryId('all');
                setPage(1);
              }}
              className="h-8 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs w-[60px]">Image</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">SKU</TableHead>
              <TableHead className="text-xs">Price</TableHead>
              <TableHead className="text-xs text-center">Stock</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((product: any) => {
                const productImage = product.media?.find((m: any) => m.is_thumbnail)?.url ||
                  product.media?.[0]?.url ||
                  product.image_url ||
                  '/placeholder.svg';
                return (
                  <TableRow key={product.id}>
                    <TableCell className="py-2">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        <img
                          src={getStorageUrl(productImage)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm font-medium">{product.name}</div>
                      {product.category?.name && (
                        <div className="text-xs text-muted-foreground">{product.category.name}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{product.sku}</code>
                    </TableCell>
                    <TableCell className="py-2 text-sm font-medium">
                      {formatPrice(product.price, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge
                        variant={product.stock_quantity <= 0 ? 'destructive' : product.stock_quantity <= 10 ? 'outline' : 'secondary'}
                        className={cn("text-xs", product.stock_quantity > 0 && product.stock_quantity <= 10 && "border-amber-500 text-amber-600")}
                      >
                        {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={cn("text-xs", product.is_active && 'bg-emerald-500/10 text-emerald-600 border-emerald-200')}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/products/${product.id}`)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {data?.from ?? data?.meta?.from ?? 0} to {data?.to ?? data?.meta?.to ?? 0} of {data?.total ?? data?.meta?.total ?? 0}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-8"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {data?.last_page ?? data?.meta?.last_page ?? 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= (data?.last_page ?? data?.meta?.last_page ?? 1) || isLoading}
            className="h-8"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone. Products with existing orders cannot be deleted."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
