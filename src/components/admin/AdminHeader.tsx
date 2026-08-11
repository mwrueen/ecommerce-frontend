import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Home, 
  Search, 
  Command as CommandIcon, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Warehouse, 
  ShoppingBag, 
  ShoppingCart, 
  Ticket, 
  Tag, 
  UserCog, 
  MessageSquare, 
  LifeBuoy, 
  Users, 
  Shield, 
  Settings, 
  User,
  X,
  Loader2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGetPublicSettingsQuery, useGetProductsQuery, useGetOrdersQuery, useGetCustomersQuery } from '@/hooks/useApi';
import { NotificationDropdown } from './NotificationDropdown';
import { SupportTicketDropdown } from './SupportTicketDropdown';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

const ADMIN_PAGES = [
  { name: 'Dashboard Overview', category: 'Overview', path: '/admin', icon: LayoutDashboard, keywords: 'home stats analytics' },
  { name: 'Products Management', category: 'Catalog', path: '/admin/products', icon: Package, keywords: 'items catalog create' },
  { name: 'Categories', category: 'Catalog', path: '/admin/categories', icon: FolderTree, keywords: 'groups classification' },
  { name: 'Inventory & Stock', category: 'Catalog', path: '/admin/inventory', icon: Warehouse, keywords: 'quantity warehouse alert' },
  { name: 'Purchase Orders', category: 'Catalog', path: '/admin/purchases', icon: ShoppingBag, keywords: 'supplier buy stock' },
  { name: 'Orders Management', category: 'Sales', path: '/admin/orders', icon: ShoppingCart, keywords: 'sales transactions invoice' },
  { name: 'Discount Coupons', category: 'Sales', path: '/admin/coupons', icon: Ticket, keywords: 'promotions vouchers discount' },
  { name: 'Deals & Campaigns', category: 'Sales', path: '/admin/deals', icon: Tag, keywords: 'flash sale discount' },
  { name: 'Customer Accounts', category: 'Customers', path: '/admin/customers', icon: UserCog, keywords: 'users clients shoppers' },
  { name: 'Contact Messages', category: 'Customers', path: '/admin/contacts', icon: MessageSquare, keywords: 'inquiries contact messages' },
  { name: 'Support Tickets', category: 'Customers', path: '/admin/support-tickets', icon: LifeBuoy, keywords: 'help desk tickets issues' },
  { name: 'Admin Users', category: 'Administration', path: '/admin/users', icon: Users, keywords: 'staff roles accounts' },
  { name: 'Roles & Permissions', category: 'Administration', path: '/admin/roles', icon: Shield, keywords: 'access control security' },
  { name: 'Site Settings', category: 'Administration', path: '/admin/settings', icon: Settings, keywords: 'configuration site logo' },
  { name: 'My Profile', category: 'Account', path: '/admin/profile', icon: User, keywords: 'account profile password' },
];

export const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: settings } = useGetPublicSettingsQuery({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch live search data
  const { data: productsData, isFetching: isProductsFetching } = useGetProductsQuery(
    { search: debouncedQuery, per_page: 4 },
    { skip: !debouncedQuery }
  );

  const { data: ordersData, isFetching: isOrdersFetching } = useGetOrdersQuery(
    { search: debouncedQuery, per_page: 4 },
    { skip: !debouncedQuery }
  );

  const { data: customersData, isFetching: isCustomersFetching } = useGetCustomersQuery(
    { search: debouncedQuery, per_page: 4 },
    { skip: !debouncedQuery }
  );

  const isSearching = isProductsFetching || isOrdersFetching || isCustomersFetching;

  // Extract result arrays
  const products = productsData?.data?.products || productsData?.data || [];
  const orders = ordersData?.data?.orders || ordersData?.data || [];
  const customers = customersData?.data?.customers || customersData?.data || [];

  // Filter admin pages
  const filteredPages = ADMIN_PAGES.filter(p => 
    !debouncedQuery || 
    p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    p.keywords.toLowerCase().includes(debouncedQuery.toLowerCase())
  ).slice(0, 5);

  const hasResults = products.length > 0 || orders.length > 0 || customers.length > 0 || filteredPages.length > 0;

  const getBreadcrumb = (pathname: string) => {
    if (pathname === '/admin') return { category: 'Overview', title: 'Dashboard' };
    if (pathname.startsWith('/admin/products')) return { category: 'Catalog', title: 'Products' };
    if (pathname.startsWith('/admin/categories')) return { category: 'Catalog', title: 'Categories' };
    if (pathname.startsWith('/admin/inventory')) return { category: 'Catalog', title: 'Inventory' };
    if (pathname.startsWith('/admin/purchases')) return { category: 'Catalog', title: 'Purchases' };
    if (pathname.startsWith('/admin/orders')) return { category: 'Sales', title: 'Orders' };
    if (pathname.startsWith('/admin/coupons')) return { category: 'Sales', title: 'Coupons' };
    if (pathname.startsWith('/admin/deals')) return { category: 'Sales', title: 'Deals' };
    if (pathname.startsWith('/admin/customers')) return { category: 'Customers', title: 'Customers' };
    if (pathname.startsWith('/admin/contacts')) return { category: 'Customers', title: 'Contacts' };
    if (pathname.startsWith('/admin/support-tickets')) return { category: 'Customers', title: 'Support Tickets' };
    if (pathname.startsWith('/admin/cancellation-requests')) return { category: 'Customers', title: 'Cancellations' };
    if (pathname.startsWith('/admin/users')) return { category: 'Administration', title: 'Users' };
    if (pathname.startsWith('/admin/roles')) return { category: 'Administration', title: 'Roles' };
    if (pathname.startsWith('/admin/settings')) return { category: 'Administration', title: 'Settings' };
    if (pathname.startsWith('/admin/profile')) return { category: 'Account', title: 'Profile' };
    return { category: 'Admin', title: 'Console' };
  };

  const currentRoute = getBreadcrumb(location.pathname);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <header className={cn(
      "h-16 border-b border-slate-800 bg-slate-900/95 text-slate-100",
      "flex items-center gap-4 px-5 sm:px-6",
      "sticky top-0 z-40 backdrop-blur-xl shadow-xl shrink-0"
    )}>
      <SidebarTrigger className="hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl h-9 w-9 shrink-0 transition-all duration-200" />

      <div className="h-5 w-px bg-slate-800 shrink-0" />

      {/* Route Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
        <span className="text-slate-400 font-medium hidden sm:inline">{currentRoute.category}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600 hidden sm:inline" />
        <span className="text-white font-bold bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
          {currentRoute.title}
        </span>
      </div>

      {/* Search Input Container with Floating Dropdown */}
      <div ref={containerRef} className="relative flex-1 max-w-md ml-auto">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-200 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-12 h-9 bg-slate-800/60 border border-slate-700/60 text-white placeholder:text-slate-400 focus:bg-slate-800 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs transition-all duration-200 shadow-xs"
          />
          
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDebouncedQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-md bg-slate-900 border border-slate-700 px-1.5 font-mono text-[10px] font-semibold text-slate-400 shadow-2xs">
              <CommandIcon className="h-2.5 w-2.5" />K
            </kbd>
          )}
        </div>

        {/* Live Search Dropdown Card */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-2.5 z-50 max-h-[480px] overflow-y-auto divide-y divide-slate-800 text-slate-100 animate-in fade-in-50 slide-in-from-top-2">
            {isSearching && (
              <div className="p-4 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Searching database...</span>
              </div>
            )}

            {/* Products Results */}
            {products.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-indigo-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Products ({products.length})
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleSelect(`/admin/products?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="text-indigo-400 hover:underline flex items-center gap-1 text-[10px] capitalize"
                  >
                    View All <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="space-y-1 mt-1">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(`/admin/products`)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                    >
                      {product.featured_image || product.image ? (
                        <img 
                          src={product.featured_image || product.image} 
                          alt={product.name} 
                          className="h-9 w-9 rounded-lg object-cover border border-slate-700 shrink-0" 
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-indigo-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-white truncate group-hover:text-indigo-300 transition-colors">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{formatPrice(product.price)}</span>
                          {product.sku && <span>• SKU: {product.sku}</span>}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] border-none shrink-0 font-medium px-2 py-0.5",
                          (product.stock_status === 'in_stock' || product.stock > 0)
                            ? "bg-emerald-500/15 text-emerald-400" 
                            : "bg-rose-500/15 text-rose-400"
                        )}
                      >
                        {(product.stock_status === 'in_stock' || product.stock > 0) ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Results */}
            {orders.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" /> Orders ({orders.length})
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleSelect(`/admin/orders?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[10px] capitalize"
                  >
                    View All <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="space-y-1 mt-1">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      onClick={() => handleSelect(`/admin/orders/${order.id}`)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                            Order {order.order_number || `#${order.id}`}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {order.customer?.name || order.billing_address?.full_name || 'Customer'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-xs text-slate-200">
                          {formatPrice(order.total_amount || order.grand_total || 0)}
                        </div>
                        <span className="text-[10px] font-semibold capitalize text-emerald-400">
                          {order.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers Results */}
            {customers.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCog className="h-3.5 w-3.5" /> Customers ({customers.length})
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleSelect(`/admin/customers?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="text-purple-400 hover:underline flex items-center gap-1 text-[10px] capitalize"
                  >
                    View All <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="space-y-1 mt-1">
                  {customers.map((customer: any) => (
                    <div
                      key={customer.id}
                      onClick={() => handleSelect(`/admin/customers?search=${encodeURIComponent(customer.name || customer.email)}`)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors truncate">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {customer.email} {customer.phone && `• ${customer.phone}`}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Pages & Features */}
            {filteredPages.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Pages & Navigation
                </div>
                <div className="space-y-1 mt-1">
                  {filteredPages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <div
                        key={page.path}
                        onClick={() => handleSelect(page.path)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                          <span className="font-medium text-xs text-slate-200 group-hover:text-white transition-colors">
                            {page.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/40">
                          {page.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results Fallback */}
            {!isSearching && !hasResults && (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <Search className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No results found for "{debouncedQuery}"</p>
                <p className="text-[11px] text-slate-500">Try searching for product names, order numbers, or customer emails.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationDropdown />
        <SupportTicketDropdown />

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        <Link to="/">
          <Button
            size="sm"
            className="rounded-xl gap-2 h-9 px-3.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all duration-300 border border-white/10"
          >
            <Home className="h-3.5 w-3.5 text-indigo-200" />
            <span className="hidden sm:inline">Store Front</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
