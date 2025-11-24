import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, Search, Menu, LogOut, Package, FolderOpen, Loader2 } from 'lucide-react';
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
import { useGetPublicSettingsQuery, useLazySearchQuery } from '@/hooks/useApi';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutMutation] = useLogoutMutation();
  const [logoutCustomerMutation] = useLogoutCustomerMutation();
  const [triggerSearch, { data: searchResults, isFetching }] = useLazySearchQuery();
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const { items } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const settings = settingsData?.data;
  const primaryColor = settings?.primary_color || '#4f46e5';
  const secondaryColor = settings?.secondary_color || '#0ea5e9';
  const accentGradient = `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})`;
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      // Use appropriate logout endpoint based on user role
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
      }, 300);

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
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const products = searchResults?.data?.products?.data || [];
  const categories = searchResults?.data?.categories?.data || [];
  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-1 w-full" style={{ background: accentGradient }} />
      <div className="w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 text-slate-900">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            {settings?.header_logo ? (
              <img src={settings.header_logo} alt={settings.title} className="h-8 w-auto" />
            ) : (

            <span className="text-xl font-bold">{settings?.title || 'eCommerce'}</span>
              
            )}
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-medium shadow-inner">
            <Link to="/products" className="px-4 py-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              Products
            </Link>
            <Link to="/categories" className="px-4 py-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              Categories
            </Link>
            <Link to="/deals" className="px-4 py-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              Deals
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-6" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            
            {/* Search Dropdown */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-500/10">
                {isFetching ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-500">Searching...</span>
                  </div>
                ) : hasResults ? (
                  <div className="py-2">
                    {/* Products */}
                    {products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b">
                          <Package className="h-3 w-3" />
                          PRODUCTS
                        </div>
                        {products.map((product: any) => (
                          <button
                            key={product.id}
                            onClick={() => handleResultClick(`/products/${product.slug}`)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                          >
                            {product.media?.[0]?.full_url ? (
                              <img
                                src={product.media[0].full_url}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500">
                                {settings?.currency_symbol || '$'}{product.price}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                      <div className={products.length > 0 ? 'border-t' : ''}>
                        <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-500 border-b">
                          <FolderOpen className="h-3 w-3" />
                          CATEGORIES
                        </div>
                        {categories.map((category: any) => (
                          <button
                            key={category.id}
                            onClick={() => handleResultClick(`/products?category=${category.slug}`)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                              <FolderOpen className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-slate-900">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View All Results */}
                    <button
                      onClick={() => handleResultClick(`/search?query=${encodeURIComponent(searchQuery)}`)}
                      className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-slate-50 transition-colors border-t"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500">No results found</p>
                    <p className="text-xs text-slate-400 mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative text-slate-700 hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">
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
                  className="h-10 gap-3 rounded-full px-2 pr-3 text-slate-700 hover:bg-slate-100"
                >
                  <Avatar className="h-9 w-9">
                    {user?.profile_picture_url || user?.profile_picture ? (
                      <AvatarImage
                        src={user.profile_picture_url || user.profile_picture || ''}
                        alt={user?.name || 'User avatar'}
                      />
                    ) : (
                      <AvatarFallback className="bg-slate-100 text-slate-500">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.name || 'Account'}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {user?.role || ''}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user?.role === 'customer' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/customer/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/support-tickets">Support Tickets</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {(user?.role === 'admin' || user?.role === 'user') && (
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/customer/login">
              <Button
                size="sm"
                className="rounded-full px-5 font-semibold text-white shadow-lg shadow-primary/30"
                style={{ background: accentGradient }}
              >
                Sign In
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/products" className="text-lg font-medium">Products</Link>
                <Link to="/categories" className="text-lg font-medium">Categories</Link>
                <Link to="/deals" className="text-lg font-medium">Deals</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      </div>
    </header>
  );
};

export default Header;
