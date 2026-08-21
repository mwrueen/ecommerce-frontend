import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  LogOut, 
  Package, 
  FolderOpen, 
  Loader2, 
  Sparkles, 
  X, 
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { useLogoutCustomerMutation } from '@/store/api/customerAuthApi';
import { useGetPublicSettingsQuery, useLazySearchQuery, useGetCategoriesQuery } from '@/hooks/useApi';
import { getStorageUrl, cn } from '@/lib/utils';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [logoutMutation] = useLogoutMutation();
  const [logoutCustomerMutation] = useLogoutCustomerMutation();
  const [triggerSearch, { data: searchResults, isFetching }] = useLazySearchQuery();
  const { data: allCategoriesData } = useGetCategoriesQuery({ active: 'true' });
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const { items } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const settings = settingsData?.data;
  const primaryColor = settings?.primary_color || '#4f46e5';
  const secondaryColor = settings?.secondary_color || '#0ea5e9';
  const accentGradient = `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})`;
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const rawCategories = allCategoriesData?.data || [];
  const parentCategories = rawCategories.filter((cat: any) => !cat.parent_id);
  const categoriesTree = parentCategories.map((parent: any) => {
    const children = parent.children?.length > 0 
      ? parent.children 
      : rawCategories.filter((cat: any) => cat.parent_id === parent.id);
    return {
      ...parent,
      children,
    };
  });

  const handleMouseEnterCategory = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveCategory = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const handleLogout = async () => {
    try {
      if (user?.role === 'customer') {
        await logoutCustomerMutation({}).unwrap();
      } else {
        await logoutMutation({}).unwrap();
      }
      dispatch(logout());
      toast.success('Logged out successfully');
    } catch (error) {
      dispatch(logout());
    }
  };

  // Debounced search on input change
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        triggerSearch({
          query: searchQuery.trim(),
          type: 'all',
          per_page: 5,
        });
        setShowDropdown(true);
      }, 250);

      return () => clearTimeout(timeoutId);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery, triggerSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const queryTerm = searchQuery.trim();
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(queryTerm)}`);
    }
  };

  const handleResultClick = (url: string) => {
    setShowDropdown(false);
    navigate(url);
  };

  const handleClearInput = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  const products = searchResults?.data?.products?.data || [];
  const categories = searchResults?.data?.categories?.data || [];
  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Accent Gradient Bar */}
      <div className="h-1 w-full" style={{ background: accentGradient }} />

      {/* Main Glassmorphic Navbar */}
      <div className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs dark:bg-slate-950/90 dark:border-slate-800/80">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 gap-4 text-slate-900 dark:text-white">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              {settings?.header_logo ? (
                <img 
                  src={getStorageUrl(settings.header_logo)} 
                  alt={settings.title || 'Store Logo'} 
                  className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                    {(settings?.title || 'eC')[0]}
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {settings?.title || 'eCommerce'}
                  </span>
                </div>
              )}
            </Link>

            {/* Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1 text-xs font-semibold shadow-inner dark:bg-slate-900/60 dark:border-slate-800">
              <Link
                to="/products"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 shadow-xs hover:shadow-sm"
              >
                <Package className="h-3.5 w-3.5 text-indigo-500" />
                Products
              </Link>
              {/* Mega Menu Category Dropdown Trigger */}
              <div 
                className="relative"
                onMouseEnter={handleMouseEnterCategory}
                onMouseLeave={handleMouseLeaveCategory}
              >
                <Link
                  to="/categories"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer",
                    isMegaMenuOpen && "bg-white text-indigo-600 dark:bg-slate-800 dark:text-white shadow-sm"
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5 text-purple-500" />
                  Categories
                  <ChevronDown className="h-3 w-3 text-slate-400 transition-transform duration-200" style={{ transform: isMegaMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </Link>

                {/* Floating Glassmorphic Mega Menu */}
                {isMegaMenuOpen && (
                  <div 
                    className="absolute top-full left-0 mt-3 w-[720px] max-w-[90vw] rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-2xl p-6 z-50 text-slate-900 dark:bg-slate-900/95 dark:border-slate-800 dark:text-white animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleMouseEnterCategory}
                    onMouseLeave={handleMouseLeaveCategory}
                  >
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-extrabold text-base tracking-tight">Product Categories & Subcategories</h3>
                      </div>
                      <Link 
                        to="/categories" 
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        View All Categories <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-6 max-h-[420px] overflow-y-auto pr-1">
                      {categoriesTree.length > 0 ? (
                        categoriesTree.map((parent: any) => (
                          <div key={parent.id} className="space-y-2.5">
                            {/* Parent Category Header */}
                            <Link
                              to={`/products?category=${parent.slug}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                            >
                              {parent.image_url ? (
                                <img
                                  src={getStorageUrl(parent.image_url)}
                                  alt={parent.name}
                                  className="h-7 w-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                  {parent.name.charAt(0)}
                                </div>
                              )}
                              <div className="truncate">
                                <h4 className="font-extrabold text-xs text-foreground group-hover:text-indigo-600 transition-colors truncate">
                                  {parent.name}
                                </h4>
                                {parent.active_products_count !== undefined && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {parent.active_products_count} Products
                                  </span>
                                )}
                              </div>
                            </Link>

                            {/* Subcategories List */}
                            {parent.children && parent.children.length > 0 ? (
                              <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                                {parent.children.map((sub: any) => (
                                  <Link
                                    key={sub.id}
                                    to={`/products?category=${sub.slug}`}
                                    onClick={() => setIsMegaMenuOpen(false)}
                                    className="block text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors truncate"
                                  >
                                    • {sub.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="pl-4 text-[11px] text-muted-foreground italic">
                                No subcategories
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 text-center py-6 text-xs text-muted-foreground">
                          Loading categories...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/deals"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 shadow-xs hover:shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Deals
              </Link>
            </nav>
          </div>

          {/* Modern Central Search Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search products, categories, or keywords..."
                  className="w-full rounded-full border border-slate-200/90 bg-slate-50/70 pl-10 pr-20 h-11 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all duration-200 shadow-inner dark:bg-slate-900/80 dark:border-slate-800 dark:text-white dark:focus-visible:bg-slate-950"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowDropdown(true);
                  }}
                  autoComplete="off"
                />

                {/* Right controls: Clear button & Enter indicator */}
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 rounded-md border border-slate-300/60 dark:bg-slate-800 dark:border-slate-700">
                      ↵
                    </kbd>
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown Card */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-[420px] overflow-y-auto rounded-3xl border border-slate-100 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/15 z-50 dark:bg-slate-900/95 dark:border-slate-800">
                  {isFetching ? (
                    <div className="p-6 text-center text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">Searching matches...</span>
                    </div>
                  ) : hasResults ? (
                    <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {/* Products Suggestions */}
                      {products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                            <span className="flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5 text-indigo-500" />
                              Products
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">{products.length} found</span>
                          </div>
                          {products.map((product: any) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleResultClick(`/products/${product.slug || product.id}`)}
                              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group"
                            >
                              {product.media?.[0]?.full_url || product.image_url ? (
                                <img
                                  src={getStorageUrl(product.media?.[0]?.url || product.image_url)}
                                  alt={product.name}
                                  className="w-9 h-9 object-cover rounded-xl border border-slate-200/80 group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs truncate text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                  {settings?.currency_symbol || '$'}{product.price}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Categories Suggestions */}
                      {categories.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                            <span className="flex items-center gap-1.5">
                              <FolderOpen className="h-3.5 w-3.5 text-purple-500" />
                              Categories
                            </span>
                          </div>
                          {categories.map((category: any) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleResultClick(`/products?category=${category.slug}`)}
                              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50/60 dark:hover:bg-slate-800/60 transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-purple-500">
                                <FolderOpen className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs truncate text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                  {category.name}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View All Suggested Items On Search Page */}
                      <button
                        type="button"
                        onClick={() => handleResultClick(`/products?search=${encodeURIComponent(searchQuery.trim())}`)}
                        className="w-full px-4 py-3 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50/40 hover:bg-indigo-50 transition-colors text-center flex items-center justify-center gap-1.5 dark:bg-indigo-950/40 dark:text-indigo-300"
                      >
                        <span>View all matching results for "{searchQuery}"</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No instant suggestions</p>
                      <p className="text-[11px] text-slate-400 mt-1">Press <span className="font-bold text-slate-600">Enter</span> to view full search catalog</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Action Buttons: Cart & User Account */}
          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-slate-700 hover:bg-slate-100 rounded-full h-10 w-10 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold shadow-md shadow-indigo-600/30 animate-pulse">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 gap-2.5 rounded-full px-2 pr-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Avatar className="h-8 w-8 border border-slate-200 shadow-xs">
                      {user?.profile_picture_url || user?.profile_picture ? (
                        <AvatarImage
                          src={user.profile_picture_url || user.profile_picture || ''}
                          alt={user?.name || 'User avatar'}
                        />
                      ) : (
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {user?.name || 'Account'}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {user?.role || 'Customer'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.phone}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'customer' && (
                    <>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/customer/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link to="/support-tickets">Support Tickets</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {(user?.role === 'admin' || user?.role === 'user') && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600 rounded-xl cursor-pointer font-bold focus:bg-rose-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/customer/login">
                <Button
                  size="sm"
                  className="rounded-full px-5 font-bold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: accentGradient }}
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Sheet Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-2xl bg-slate-100 border-slate-200 text-sm"
                    />
                  </form>

                  <nav className="flex flex-col gap-2 font-bold text-sm">
                    <Link to="/products" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors">
                      <Package className="h-4 w-4 text-indigo-600" />
                      All Products
                    </Link>
                    <Link to="/categories" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors">
                      <FolderOpen className="h-4 w-4 text-purple-600" />
                      Categories
                    </Link>
                    <Link to="/deals" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      Special Deals
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
