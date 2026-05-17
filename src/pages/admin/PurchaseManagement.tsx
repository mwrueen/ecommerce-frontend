import { useState } from 'react';
import { useGetProductsQuery } from '@/hooks/useApi';
import {
  useRecordPurchaseMutation,
  useRecordBulkPurchasesMutation,
  useGetPurchaseHistoryQuery,
  useGetPurchaseStatsQuery,
} from '@/store/api/adminPurchasesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package, TrendingUp, FileText, Plus, Loader2, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchaseManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('record');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for single purchase
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    purchase_price: '',
    supplier_name: '',
    purchase_order_number: '',
    reason: '',
  });

  // Bulk purchase state
  const [bulkPurchases, setBulkPurchases] = useState<Array<{
    product_id: string;
    quantity: string;
    purchase_price: string;
    supplier_name: string;
    purchase_order_number: string;
    reason: string;
  }>>([{
    product_id: '',
    quantity: '',
    purchase_price: '',
    supplier_name: '',
    purchase_order_number: '',
    reason: '',
  }]);

  // API hooks
  const { data: productsData } = useGetProductsQuery({ page: 1, per_page: 500 });
  const [recordPurchase, { isLoading: isRecording }] = useRecordPurchaseMutation();
  const [recordBulkPurchases, { isLoading: isBulkRecording }] = useRecordBulkPurchasesMutation();
  const { data: historyData, refetch: refetchHistory } = useGetPurchaseHistoryQuery({ per_page: 20 });
  const { data: statsData, refetch: refetchStats } = useGetPurchaseStatsQuery({});

  const products = productsData?.data || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBulkInputChange = (index: number, field: string, value: string) => {
    const updated = [...bulkPurchases];
    updated[index] = { ...updated[index], [field]: value };
    setBulkPurchases(updated);
  };

  const addBulkPurchaseRow = () => {
    setBulkPurchases(prev => [...prev, {
      product_id: '',
      quantity: '',
      purchase_price: '',
      supplier_name: '',
      purchase_order_number: '',
      reason: '',
    }]);
  };

  const removeBulkPurchaseRow = (index: number) => {
    setBulkPurchases(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Product and quantity are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        ...(formData.purchase_price && { purchase_price: parseFloat(formData.purchase_price) }),
        ...(formData.supplier_name && { supplier_name: formData.supplier_name }),
        ...(formData.purchase_order_number && { purchase_order_number: formData.purchase_order_number }),
        ...(formData.reason && { reason: formData.reason }),
      };

      const result = await recordPurchase(payload).unwrap();

      toast({
        title: 'Success',
        description: `Purchase recorded: ${result.purchase.purchase_quantity} units of ${result.purchase.product_name}`,
      });

      // Reset form
      setFormData({
        product_id: '',
        quantity: '',
        purchase_price: '',
        supplier_name: '',
        purchase_order_number: '',
        reason: '',
      });

      // Refetch data
      refetchHistory();
      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.error || 'Failed to record purchase',
        variant: 'destructive',
      });
    }
  };

  const handleBulkSubmit = async () => {
    const validPurchases = bulkPurchases.filter(p => p.product_id && p.quantity);

    if (validPurchases.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one valid purchase is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        purchases: validPurchases.map(p => ({
          product_id: parseInt(p.product_id),
          quantity: parseInt(p.quantity),
          ...(p.purchase_price && { purchase_price: parseFloat(p.purchase_price) }),
          ...(p.supplier_name && { supplier_name: p.supplier_name }),
          ...(p.purchase_order_number && { purchase_order_number: p.purchase_order_number }),
          ...(p.reason && { reason: p.reason }),
        })),
      };

      const result = await recordBulkPurchases(payload).unwrap();

      toast({
        title: 'Success',
        description: `${result.total_purchases} purchases recorded successfully`,
      });

      // Reset form
      setBulkPurchases([{
        product_id: '',
        quantity: '',
        purchase_price: '',
        supplier_name: '',
        purchase_order_number: '',
        reason: '',
      }]);
      setIsDialogOpen(false);

      // Refetch data
      refetchHistory();
      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to record bulk purchases',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Purchase Management</h2>
          <p className="text-muted-foreground">Record supplier purchases and manage inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Bulk Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Bulk Purchases</DialogTitle>
              <DialogDescription>
                Record multiple product purchases from the same or different suppliers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {bulkPurchases.map((purchase, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Product *</Label>
                      <Select
                        value={purchase.product_id}
                        onValueChange={(value) => handleBulkInputChange(index, 'product_id', value)}
                      >
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-[100]">
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={purchase.quantity}
                        onChange={(e) => handleBulkInputChange(index, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={purchase.purchase_price}
                        onChange={(e) => handleBulkInputChange(index, 'purchase_price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Supplier Name</Label>
                      <Input
                        value={purchase.supplier_name}
                        onChange={(e) => handleBulkInputChange(index, 'supplier_name', e.target.value)}
                        placeholder="Supplier name"
                      />
                    </div>
                    <div>
                      <Label>PO Number</Label>
                      <Input
                        value={purchase.purchase_order_number}
                        onChange={(e) => handleBulkInputChange(index, 'purchase_order_number', e.target.value)}
                        placeholder="PO-2025-001"
                      />
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <Input
                        value={purchase.reason}
                        onChange={(e) => handleBulkInputChange(index, 'reason', e.target.value)}
                        placeholder="Monthly restock"
                      />
                    </div>
                  </div>
                  {bulkPurchases.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3"
                      onClick={() => removeBulkPurchaseRow(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Card>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={addBulkPurchaseRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Purchase
                </Button>
                <Button onClick={handleBulkSubmit} disabled={isBulkRecording} className="ml-auto">
                  {isBulkRecording ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record All Purchases'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {statsData?.success && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.stats.total_purchases}</div>
              <p className="text-xs text-muted-foreground">Purchase transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData.stats.total_quantity_purchased.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Units purchased</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Product</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData.stats.top_purchased_products[0]?.product?.name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsData.stats.top_purchased_products[0]?.total_purchased || 0} units
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record Purchase</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Single Purchase</CardTitle>
              <CardDescription>
                Record a product purchase from a supplier to automatically update inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="product_id">
                      Product <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.product_id} onValueChange={(value) => handleInputChange('product_id', value)}>
                      <SelectTrigger id="product_id" className="bg-background border-input">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-[100]">
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku}) - Stock: {product.stock_quantity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>

                  {/* Purchase Price */}
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price (per unit)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Supplier Name */}
                  <div className="space-y-2">
                    <Label htmlFor="supplier_name">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Supplier Name
                    </Label>
                    <Input
                      id="supplier_name"
                      value={formData.supplier_name}
                      onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                      placeholder="ABC Suppliers Inc."
                    />
                  </div>

                  {/* PO Number */}
                  <div className="space-y-2">
                    <Label htmlFor="purchase_order_number">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Purchase Order Number
                    </Label>
                    <Input
                      id="purchase_order_number"
                      value={formData.purchase_order_number}
                      onChange={(e) => handleInputChange('purchase_order_number', e.target.value)}
                      placeholder="PO-2025-001"
                    />
                  </div>

                  {/* Reason */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="reason">Reason / Notes</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="Monthly restock order, new product launch, etc."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isRecording}>
                    {isRecording ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recording Purchase...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Record Purchase
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>View all recorded product purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {historyData?.data && historyData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Old Stock</TableHead>
                        <TableHead className="text-right">New Stock</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Recorded By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.data.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{record.product?.name}</TableCell>
                          <TableCell className="text-muted-foreground">{record.product?.sku}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-600">+{record.adjustment}</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {record.old_quantity}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {record.new_quantity}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {record.reason}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.creator?.name || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No purchase history found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start recording purchases to see them here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
