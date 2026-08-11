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

import { DatePicker, DateRangePicker } from '@/components/ui/date-picker';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 font-semibold',
  processing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/50 font-semibold',
  shipped: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-700/50 font-semibold',
  delivered: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50 font-semibold',
  cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/50 font-semibold',
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: settings } = useGetPublicSettingsQuery({});
  
  // Date range state
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activePreset, setActivePreset] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  // Dashboard data
  const { data: statsData, isLoading: statsLoading, isFetching: statsFetching } = useGetDashboardStatsQuery({ 
    date_from: dateFrom, 
    date_to: dateTo 
  });
  const { data: trendsData, isFetching: trendsFetching } = useGetSalesTrendsQuery({ period: 'daily', days: 30, date_from: dateFrom, date_to: dateTo });
  const { data: topProductsData } = useGetTopProductsQuery({ limit: 10, date_from: dateFrom, date_to: dateTo });
  const { data: topCustomersData } = useGetTopCustomersQuery({ limit: 10, sort_by: 'revenue', date_from: dateFrom, date_to: dateTo });
  const { data: recentOrdersData } = useGetRecentOrdersQuery({ limit: 10 });
  const { data: lowStockData } = useGetLowStockAlertsQuery({ threshold: 10, limit: 20 });
  const { data: categorySalesData } = useGetCategorySalesQuery({ date_from: dateFrom, date_to: dateTo });

  // Export mutations
  const [exportSalesReport, { isLoading: exportingSales }] = useExportSalesReportMutation();
  const [exportProductSalesReport, { isLoading: exportingProducts }] = useExportProductSalesReportMutation();

  const stats = statsData?.data;
  const rawTrends = trendsData?.data?.trends || trendsData?.data || [];
  const trends = rawTrends.map((t: any) => ({
    ...t,
    formattedDate: t.date ? (() => {
      try {
        const d = new Date(t.date);
        return isNaN(d.getTime()) ? t.date : format(d, 'MMM dd');
      } catch {
        return t.date;
      }
    })() : (t.day || '')
  }));

  const topProducts = topProductsData?.data?.products || [];
  const topCustomers = topCustomersData?.data?.customers || [];
  const recentOrders = recentOrdersData?.data?.orders || [];
  const lowStockProducts = lowStockData?.data?.products || [];
  const categorySales = categorySalesData?.data?.categories || [];

  const setPresetRange = (preset: '7d' | '30d' | '90d' | 'ytd') => {
    setActivePreset(preset);
    const today = new Date();
    let fromDate = subDays(today, 30);

    if (preset === '7d') {
      fromDate = subDays(today, 7);
    } else if (preset === '30d') {
      fromDate = subDays(today, 30);
    } else if (preset === '90d') {
      fromDate = subDays(today, 90);
    } else if (preset === 'ytd') {
      fromDate = new Date(today.getFullYear(), 0, 1);
    }

    setDateFrom(format(fromDate, 'yyyy-MM-dd'));
    setDateTo(format(today, 'yyyy-MM-dd'));
  };

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

  if (statsLoading && !statsData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <Activity className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Loading Analytics</h3>
            <p className="text-muted-foreground text-sm">Gathering latest store insights...</p>
          </div>
        </div>
      </div>
    );
  }

  const orderStatusData = stats?.orders?.status_breakdown ?
    Object.entries(stats.orders.status_breakdown).map(([name, value]) => ({ name, value })) : [];

  const maxProductQty = topProducts.length > 0 ? Math.max(...topProducts.map((p: any) => p.total_quantity_sold || 0), 1) : 1;
  const maxCustomerRev = topCustomers.length > 0 ? Math.max(...topCustomers.map((c: any) => c.total_revenue || 0), 1) : 1;
  const totalOrdersCount = stats?.overview?.total_orders || 1;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Store Analytics Overview</span>
              {(statsFetching || trendsFetching) && (
                <span className="flex items-center gap-1.5 text-indigo-200 text-xs pl-2 border-l border-white/20">
                  <Activity className="h-3 w-3 animate-spin text-amber-300" /> Updating...
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
            <p className="text-indigo-200/90 text-sm max-w-xl">
              Track real-time performance, revenue trends, customer activity, and inventory health.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportSalesReport}
              disabled={exportingSales}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl shadow-sm backdrop-blur-md transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2 text-indigo-300" />
              Export Sales
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportProductSalesReport}
              disabled={exportingProducts}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl shadow-sm backdrop-blur-md transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2 text-purple-300" />
              Export Products
            </Button>
          </div>
        </div>

        {/* Date Filter Strip inside Banner */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
            {(['7d', '30d', '90d', 'ytd'] as const).map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setPresetRange(preset)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 capitalize cursor-pointer",
                  activePreset === preset
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-indigo-200 hover:text-white hover:bg-white/5"
                )}
              >
                {preset === '7d' ? '7 Days' : preset === '30d' ? '30 Days' : preset === '90d' ? '90 Days' : 'YTD'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <span className="font-medium text-indigo-200">From</span>
              <DatePicker
                value={dateFrom}
                onChange={(val) => setDateFrom(val)}
                className="h-8 text-xs border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white w-[140px]"
                clearable={false}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-indigo-200">To</span>
              <DatePicker
                value={dateTo}
                onChange={(val) => setDateTo(val)}
                className="h-8 text-xs border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white w-[140px]"
                clearable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue */}
        <Card className="relative overflow-hidden border border-indigo-500/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {formatPrice(
                  stats?.overview?.total_revenue || 0,
                  settings?.data?.currency_symbol,
                  settings?.data?.currency_position,
                  settings?.data?.formatted_currency
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="h-3 w-3" /> Revenue
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Avg: {formatPrice(stats?.overview?.average_order_value || 0, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Orders */}
        <Card className="relative overflow-hidden border border-emerald-500/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</span>
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {stats?.overview?.total_orders || 0}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {stats?.orders?.pending_cancellations > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="h-3 w-3" /> {stats.orders.pending_cancellations} pending cancel
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <TrendingUp className="h-3 w-3" /> Active Processing
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Customers */}
        <Card className="relative overflow-hidden border border-amber-500/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Customers</span>
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {stats?.overview?.total_customers || 0}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Active Shoppers
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Products */}
        <Card className="relative overflow-hidden border border-rose-500/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Products</span>
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {stats?.overview?.total_products || 0}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {stats?.overview?.active_products || 0} In Stock
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <TabsTrigger value="trends" className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Sales Trends
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm">
              <BarChart3 className="h-4 w-4" />
              Order Status
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg text-xs font-bold gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white shadow-sm">
              <PieChart className="h-4 w-4" />
              Category Sales
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="trends" className="mt-0">
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
            <CardHeader className="py-5 px-6 flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <CardTitle className="text-base font-bold">Revenue & Order Velocity</CardTitle>
                <CardDescription className="text-xs">Daily performance breakdown over the selected timeframe</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="formattedDate" className="text-xs font-medium" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis className="text-xs font-medium" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
            <CardHeader className="py-5 px-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold">Order Distribution by Status</CardTitle>
              <CardDescription className="text-xs">Live fulfillment pipeline status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={105}
                      innerRadius={60}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        color: '#f8fafc',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {Object.entries(stats?.orders?.status_breakdown || {}).map(([status, count], idx) => {
                    const countNum = count as number;
                    const pct = ((countNum / totalOrdersCount) * 100).toFixed(1);
                    return (
                      <div key={status} className="p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            <Badge variant="outline" className={cn("capitalize text-xs px-2 py-0.5", statusColors[status])}>
                              {status}
                            </Badge>
                          </div>
                          <span className="font-bold text-sm">{countNum} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
            <CardHeader className="py-5 px-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold">Category Revenue & Sales Volume</CardTitle>
              <CardDescription className="text-xs">Comparison across product categories</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categorySales} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="category_name" className="text-xs font-medium" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis className="text-xs font-medium" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Bar dataKey="total_revenue" fill="#6366f1" name="Revenue" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="total_quantity_sold" fill="#10b981" name="Quantity Sold" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performers Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
          <CardHeader className="py-4 px-6 flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Package className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Top Products</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-600 rounded-lg">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {topProducts.slice(0, 5).map((product: any, index: number) => {
              const qtyPct = Math.round(((product.total_quantity_sold || 0) / maxProductQty) * 100);
              return (
                <div key={product.product_id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-sm",
                      index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-500/20" :
                      index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{product.product_name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{product.product_sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-foreground">{product.total_quantity_sold} sold</p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {formatPrice(product.total_revenue, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                      </p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${qtyPct}%` }} />
                  </div>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No product data available</div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
          <CardHeader className="py-4 px-6 flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Top Customers</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/customers')} className="text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 rounded-lg">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {topCustomers.slice(0, 5).map((customer: any, index: number) => {
              const revPct = Math.round(((customer.total_revenue || 0) / maxCustomerRev) * 100);
              return (
                <div key={customer.customer_id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-emerald-500/30">
                      <AvatarFallback className={cn(
                        "text-xs font-bold text-white",
                        index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500" :
                        index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                        index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700" :
                        "bg-gradient-to-br from-emerald-500 to-teal-600"
                      )}>
                        {customer.customer_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{customer.customer_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{customer.customer_email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-foreground">{customer.total_orders} orders</p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {formatPrice(customer.total_revenue, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                      </p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: `${revPct}%` }} />
                  </div>
                </div>
              );
            })}
            {topCustomers.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No customer data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-800">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')} className="text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 rounded-lg">
            View All Orders
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-xs font-bold uppercase tracking-wider pl-6">Order #</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Items</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <TableCell className="py-3.5 pl-6 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {order.order_number}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          {order.customer_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-foreground">{order.customer_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge variant="outline" className={cn("capitalize text-xs px-2.5 py-0.5 rounded-md", statusColors[order.status])}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-center text-sm font-semibold">{order.items_count}</TableCell>
                  <TableCell className="py-3.5 text-right pr-6 text-sm font-bold">
                    {formatPrice(order.total_amount, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No recent orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-2 border-rose-300 dark:border-rose-900/60 shadow-lg bg-rose-50/20 dark:bg-rose-950/10">
          <CardHeader className="py-4 px-6 flex flex-row items-center justify-between border-b border-rose-200 dark:border-rose-900/40 bg-rose-100/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-rose-700 dark:text-rose-400">Low Stock Warnings</CardTitle>
                <CardDescription className="text-xs text-rose-600/80 dark:text-rose-400/80">Products requiring restock attention</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')} className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg">
              Manage Inventory
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-rose-200 dark:border-rose-900/40">
                  <TableHead className="text-xs font-bold uppercase tracking-wider pl-6">Product</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">SKU</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Stock Quantity</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-right pr-6">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-rose-100/30 dark:hover:bg-rose-950/30 transition-colors">
                    <TableCell className="py-3 pl-6 text-sm font-bold">{product.name}</TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="secondary" className="text-xs font-medium">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant={product.is_out_of_stock ? 'destructive' : 'outline'}
                        className={cn("text-xs font-bold px-2.5 py-0.5", !product.is_out_of_stock && "border-amber-500 text-amber-700 bg-amber-500/10")}
                      >
                        {product.is_out_of_stock ? 'Out of Stock (0)' : `${product.stock_quantity} left`}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6 text-sm font-bold">
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

