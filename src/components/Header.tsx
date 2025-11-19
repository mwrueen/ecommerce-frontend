import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, Search, Menu, LogOut, Package, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            {settings?.header_logo ? (
              <img src={settings.header_logo} alt={settings.title} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark" />
            )}
            <span className="text-xl font-bold text-foreground">{settings?.title || 'ShopHub'}</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/deals" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Deals
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-6" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10 bg-secondary/50 border-0 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            
            {/* Search Dropdown */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isFetching ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
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
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                          >
                            {product.media?.[0]?.full_url ? (
                              <img
                                src={product.media[0].full_url}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
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
                        <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b">
                          <FolderOpen className="h-3 w-3" />
                          CATEGORIES
                        </div>
                        {categories.map((category: any) => (
                          <button
                            key={category.id}
                            onClick={() => handleResultClick(`/categories/${category.slug}`)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                          >
                            <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                              <FolderOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-muted-foreground truncate">
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
                      className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-accent transition-colors border-t"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-[10px]">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
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
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
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
    </header>
  );
};

export default Header;
