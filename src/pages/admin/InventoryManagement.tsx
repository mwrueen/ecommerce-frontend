import { useState } from 'react';
import { useGetProductsQuery } from '@/hooks/useApi';
import {
  useGetLowStockProductsQuery,
  useGetOutOfStockProductsQuery,
  useAdjustStockMutation,
  useSetStockMutation,
  useGetInventoryHistoryQuery,
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, TrendingDown, TrendingUp, History, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InventoryManagement() {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [setStockDialog, setSetStockDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState('');
  const [newStock, setNewStock] = useState('');
  const [reason, setReason] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  
  const { toast } = useToast();
  const { data: productsData, isLoading } = useGetProductsQuery({ page, per_page: 10 });
  const { data: lowStockData } = useGetLowStockProductsQuery(lowStockThreshold);
  const { data: outOfStockData } = useGetOutOfStockProductsQuery(undefined);
  const { data: historyData } = useGetInventoryHistoryQuery(
    { productId: selectedProduct?.id, limit: 50 },
    { skip: !selectedProduct || !historyDialog }
  );
  
  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation();
  const [setStock, { isLoading: isSetting }] = useSetStockMutation();

  const handleAdjustStock = async () => {
    if (!selectedProduct || !quantity) return;

    const adjustmentValue = adjustmentType === 'increase' 
      ? parseInt(quantity) 
      : -parseInt(quantity);

    try {
      await adjustStock({
        productId: selectedProduct.id,
        quantity: adjustmentValue,
        reason,
        reference_type: referenceType || undefined,
        reference_id: referenceId || undefined,
      }).unwrap();
      
      toast({ title: 'Stock adjusted successfully' });
      setAdjustDialog(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to adjust stock',
        variant: 'destructive',
      });
    }
  };

  const handleSetStock = async () => {
    if (!selectedProduct || !newStock) return;

    try {
      await setStock({
        productId: selectedProduct.id,
        quantity: parseInt(newStock),
        reason,
      }).unwrap();
      
      toast({ title: 'Stock set successfully' });
      setSetStockDialog(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to set stock',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setQuantity('');
    setNewStock('');
    setReason('');
    setReferenceType('');
    setReferenceId('');
    setSelectedProduct(null);
  };

  const openAdjustDialog = (product: any) => {
    setSelectedProduct(product);
    setAdjustDialog(true);
  };

  const openSetStockDialog = (product: any) => {
    setSelectedProduct(product);
    setNewStock(product.stock_quantity.toString());
    setSetStockDialog(true);
  };

  const openHistoryDialog = (product: any) => {
    setSelectedProduct(product);
    setHistoryDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
        <p className="text-muted-foreground">Monitor and manage product stock levels</p>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockData?.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockData?.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Below {lowStockThreshold} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsData?.total ?? productsData?.meta?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="out">Out of Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  productsData?.data?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{product.stock_quantity}</span>
                      </TableCell>
                      <TableCell>
                        {product.stock_quantity === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : product.stock_quantity < lowStockThreshold ? (
                          <Badge variant="secondary" className="bg-warning/10 text-warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAdjustDialog(product)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Adjust
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSetStockDialog(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Set
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryDialog(product)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {productsData?.from ?? productsData?.meta?.from ?? 0} to {productsData?.to ?? productsData?.meta?.to ?? 0} of {productsData?.total ?? productsData?.meta?.total ?? 0}
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
                disabled={page >= (productsData?.last_page ?? productsData?.meta?.last_page ?? 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="low">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockData?.data?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-warning">{product.stock_quantity}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustDialog(product)}
                      >
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="out">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStockData?.data?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-destructive">{product.stock_quantity}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustDialog(product)}
                      >
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialog} onOpenChange={setAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Current stock: {selectedProduct?.stock_quantity}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Stock</SelectItem>
                  <SelectItem value="decrease">Decrease Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for adjustment"
              />
            </div>
            <div>
              <Label htmlFor="refType">Reference Type (Optional)</Label>
              <Input
                id="refType"
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                placeholder="e.g., order, return, adjustment"
              />
            </div>
            <div>
              <Label htmlFor="refId">Reference ID (Optional)</Label>
              <Input
                id="refId"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g., order ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} disabled={isAdjusting || !quantity}>
              {isAdjusting ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Stock Dialog */}
      <Dialog open={setStockDialog} onOpenChange={setSetStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Current stock: {selectedProduct?.stock_quantity}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStock">New Stock Level</Label>
              <Input
                id="newStock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock level"
              />
            </div>
            <div>
              <Label htmlFor="setReason">Reason</Label>
              <Textarea
                id="setReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for setting stock"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetStockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetStock} disabled={isSetting || !newStock}>
              {isSetting ? 'Setting...' : 'Set Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Inventory History - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Recent stock changes and adjustments
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Old Qty</TableHead>
                  <TableHead>New Qty</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData?.data?.map((history: any) => (
                  <TableRow key={history.id}>
                    <TableCell>
                      {new Date(history.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{history.old_quantity}</TableCell>
                    <TableCell>{history.new_quantity}</TableCell>
                    <TableCell>
                      <span className={history.adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                        {history.adjustment > 0 ? '+' : ''}{history.adjustment}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {history.reason || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
