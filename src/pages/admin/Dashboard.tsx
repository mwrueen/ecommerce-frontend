import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  useGetDashboardStatsQuery,
  useGetSalesTrendsQuery,
  useGetTopProductsQuery,
  useGetTopCustomersQuery,
  useGetRecentOrdersQuery,
  useGetLowStockAlertsQuery,
  useGetCategorySalesQuery,
  useGetPublicSettingsQuery,
  useExportSalesReportMutation,
  useExportProductSalesReportMutation
} from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
  shipped: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800',
};

const CHART_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: settings } = useGetPublicSettingsQuery({});
  
  // Date range state
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Dashboard data
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery({ 
    date_from: dateFrom, 
    date_to: dateTo 
  });
  const { data: trendsData } = useGetSalesTrendsQuery({ period: 'daily', days: 30 });
  const { data: topProductsData } = useGetTopProductsQuery({ limit: 10, date_from: dateFrom, date_to: dateTo });
  const { data: topCustomersData } = useGetTopCustomersQuery({ limit: 10, sort_by: 'revenue', date_from: dateFrom, date_to: dateTo });
  const { data: recentOrdersData } = useGetRecentOrdersQuery({ limit: 10 });
  const { data: lowStockData } = useGetLowStockAlertsQuery({ threshold: 10, limit: 20 });
  const { data: categorySalesData } = useGetCategorySalesQuery({ date_from: dateFrom, date_to: dateTo });

  // Export mutations
  const [exportSalesReport, { isLoading: exportingSales }] = useExportSalesReportMutation();
  const [exportProductSalesReport, { isLoading: exportingProducts }] = useExportProductSalesReportMutation();

  const stats = statsData?.data;
  const trends = trendsData?.data?.trends || [];
  const topProducts = topProductsData?.data?.products || [];
  const topCustomers = topCustomersData?.data?.customers || [];
  const recentOrders = recentOrdersData?.data?.orders || [];
  const lowStockProducts = lowStockData?.data?.products || [];
  const categorySales = categorySalesData?.data?.categories || [];

  const handleExportSalesReport = async () => {
    try {
      await exportSalesReport({ date_from: dateFrom, date_to: dateTo, group_by: 'day' }).unwrap();
      toast.success('Sales report exported successfully');
    } catch (error) {
      toast.error('Failed to export sales report');
    }
  };

  const handleExportProductSalesReport = async () => {
    try {
      await exportProductSalesReport({ date_from: dateFrom, date_to: dateTo }).unwrap();
      toast.success('Product sales report exported successfully');
    } catch (error) {
      toast.error('Failed to export product sales report');
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
              <Activity className="h-8 w-8 text-primary-foreground animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Loading Dashboard</h3>
            <p className="text-muted-foreground text-sm">Fetching your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const orderStatusData = stats?.orders?.status_breakdown ?
    Object.entries(stats.orders.status_breakdown).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSalesReport}
            disabled={exportingSales}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProductSalesReport}
            disabled={exportingProducts}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Products
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50 border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Date Range:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo}
              className="h-8 w-auto text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="h-8 w-auto text-sm"
            />
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                stats?.overview?.total_revenue || 0,
                settings?.data?.currency_symbol,
                settings?.data?.currency_position,
                settings?.data?.formatted_currency
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatPrice(stats?.overview?.average_order_value || 0, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.orders?.pending_cancellations || 0} pending cancellations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.overview?.active_products || 0} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="trends" className="text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Sales Trends
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Order Status
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-sm">
            <PieChart className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Sales Trends</CardTitle>
              <CardDescription className="text-xs">Revenue and orders over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Order Status Breakdown</CardTitle>
              <CardDescription className="text-xs">Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex flex-col justify-center">
                  {Object.entries(stats?.orders?.status_breakdown || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                      <Badge variant="outline" className={cn("capitalize text-xs", statusColors[status])}>{status}</Badge>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Sales by Category</CardTitle>
              <CardDescription className="text-xs">Revenue and quantity sold per category</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySales} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="category_name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="total_revenue" fill="#0ea5e9" name="Revenue" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="total_quantity_sold" fill="#22c55e" name="Quantity Sold" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tables Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Products</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="text-xs h-8">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={product.product_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold",
                    index === 0 ? "bg-amber-500 text-white" :
                    index === 1 ? "bg-slate-400 text-white" :
                    index === 2 ? "bg-amber-700 text-white" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.product_name}</p>
                    <p className="text-xs text-muted-foreground">{product.product_sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{product.total_quantity_sold} sold</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.total_revenue, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">No products data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Customers</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/customers')} className="text-xs h-8">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {topCustomers.slice(0, 5).map((customer: any, index: number) => (
                <div key={customer.customer_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn(
                      "text-xs font-semibold",
                      index === 0 ? "bg-amber-500 text-white" :
                      index === 1 ? "bg-slate-400 text-white" :
                      index === 2 ? "bg-amber-700 text-white" :
                      "bg-primary/10 text-primary"
                    )}>
                      {customer.customer_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{customer.customer_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.customer_email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{customer.total_orders} orders</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(customer.total_revenue, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </p>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">No customer data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')} className="text-xs h-8">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Order</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-center">Items</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <TableCell className="py-2">
                    <span className="font-mono text-xs font-medium">{order.order_number}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {order.customer_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{order.customer_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className={cn("capitalize text-xs", statusColors[order.status])}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-center text-sm">{order.items_count}</TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">
                    {formatPrice(order.total_amount, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                    No recent orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-900/50">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-base">Low Stock Alerts</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')} className="text-xs h-8">
                Manage Inventory
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-center">Stock</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="py-2 text-sm font-medium">{product.name}</TableCell>
                    <TableCell className="py-2 font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-xs font-normal">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge
                        variant={product.is_out_of_stock ? 'destructive' : 'outline'}
                        className={cn("text-xs", !product.is_out_of_stock && "border-amber-500 text-amber-600")}
                      >
                        {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium">
                      {formatPrice(product.price, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
