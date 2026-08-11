import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Filter, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const { data: settings } = useGetPublicSettingsQuery({});

  // Slider state (0-10000 range)
  const MAX_PRICE = 10000;
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync slider with inputs
  useEffect(() => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : MAX_PRICE;
    setPriceRange([min, max]);
  }, [minPrice, maxPrice]);

  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    per_page: 12,
    ...(categoryId && { category_id: categoryId }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    sort_by: sortBy,
    sort_order: sortOrder
  });

  // Reset accumulated products when filters change
  useEffect(() => {
    setAccumulatedProducts([]);
    setPage(1);
  }, [categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  // Accumulate products when new data arrives
  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      if (page === 1) {
        // First page - replace all products
        setAccumulatedProducts(data.data);
      } else {
        // Subsequent pages - append new products
        setAccumulatedProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = data.data.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [data, page]);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({
    active: 'true',
    sort_by: 'name',
    sort_order: 'asc'
  });

  // Read parameters from URL and sync state
  useEffect(() => {
    if (!categoriesData?.data) return;

    const categorySlug = searchParams.get('category');
    const minParam = searchParams.get('min_price') || '';
    const maxParam = searchParams.get('max_price') || '';

    // Sync category
    if (categorySlug) {
      const category = categoriesData.data.find((c: any) => c.slug === categorySlug);
      if (category && categoryId !== category.id) {
        setCategoryId(category.id);
        setPage(1);
      }
    } else if (categoryId !== null) {
      setCategoryId(null);
      setPage(1);
    }

    // Sync prices
    if (minParam !== minPrice) setMinPrice(minParam);
    if (maxParam !== maxPrice) setMaxPrice(maxParam);

    if (minParam || maxParam) {
      const min = minParam ? parseFloat(minParam) : 0;
      const max = maxParam ? parseFloat(maxParam) : MAX_PRICE;
      setPriceRange([min, max]);
    }
  }, [searchParams, categoriesData]);

  const updateUrlParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryClick = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
    setAccumulatedProducts([]);

    let slug = '';
    if (id && categoriesData?.data) {
      const category = categoriesData.data.find((c: any) => c.id === id);
      slug = category?.slug || '';
    }
    updateUrlParams({ category: slug || null });
  };

  const handleLoadMore = () => {
    const lastPage = data?.last_page ?? data?.meta?.last_page ?? 1;
    if (page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setPriceRange(values);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const min = values[0] > 0 ? values[0].toString() : '';
      const max = values[1] < MAX_PRICE ? values[1].toString() : '';

      updateUrlParams({
        min_price: min || null,
        max_price: max || null
      });
      setPage(1);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    const numValue = value ? parseFloat(value) : 0;
    if (!isNaN(numValue)) {
      setPriceRange([numValue, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    const numValue = value ? parseFloat(value) : MAX_PRICE;
    if (!isNaN(numValue)) {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  const handlePriceFilter = () => {
    updateUrlParams({
      min_price: minPrice || null,
      max_price: maxPrice || null
    });
    setPage(1);
  };

  const handleClearPrice = () => {
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([0, MAX_PRICE]);
    updateUrlParams({
      min_price: null,
      max_price: null
    });
    setPage(1);
  };

  const totalProducts = (() => {
    // Check for total at root level (API response structure)
    if (data?.total !== undefined) return data.total;
    if (data?.meta?.total !== undefined) return data.meta.total;
    if (data?.meta?.total_items !== undefined) return data.meta.total_items;
    if (accumulatedProducts.length > 0) return accumulatedProducts.length;
    if (Array.isArray(data?.data)) return data.data.length;
    return 0;
  })();

  // Check for last_page at root level or in meta
  const lastPage = data?.last_page ?? data?.meta?.last_page ?? 1;
  const currentPage = data?.current_page ?? page;
  const hasMorePages = data && lastPage > 1 && currentPage < lastPage;
  const isLoadingMore = isFetching && page > 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 h-80 w-80 bg-gradient-to-bl from-indigo-500/15 via-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-2xl text-left">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 font-extrabold px-3 py-1 text-xs shadow-md">
                EXPLORE PRODUCT CATALOG
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Discover Our Complete Collection
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Filter by category, price, and instant sorting to surface hand-picked items for your lifestyle.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-300 pt-1">
                <div className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                  📦 <span className="text-amber-400 font-extrabold ml-1">{totalProducts}</span> Items Available
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                  🏷️ <span className="text-indigo-400 font-extrabold ml-1">{(categoriesData?.data?.length || 0)}</span> Categories
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md text-emerald-400">
                  ⚡ Real-Time Stock Updates
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-indigo-500/30 bg-white/5 backdrop-blur-md p-6 text-slate-200 max-w-xs text-left">
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-400 mb-1.5">Pro Shopping Tip</p>
              <p className="text-xs leading-relaxed text-slate-300">
                Combine Category & Price Range filters to instantly narrow down products matching your exact budget.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 rounded-3xl border border-slate-100 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h2 className="font-semibold">Filters</h2>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Categories</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                    <Button
                      variant={categoryId === null ? "default" : "ghost"}
                      className="w-full justify-start rounded-2xl"
                      size="sm"
                      onClick={() => handleCategoryClick(null)}
                    >
                      All Categories
                      {categoryId === null && (data?.total !== undefined || data?.meta || data?.data) && (
                        <Badge variant="secondary" className="ml-auto">
                          {totalProducts}
                        </Badge>
                      )}
                    </Button>
                    {categoriesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      categoriesData?.data?.map((category: any) => (
                        <Button
                          key={category.id}
                          variant={categoryId === category.id ? "default" : "ghost"}
                          className="w-full justify-start rounded-2xl"
                          size="sm"
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          {category.name}
                          <Badge variant="secondary" className="ml-auto">
                            {category.active_products_count || 0}
                          </Badge>
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price Range
                  </h3>
                  <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    {/* Price Display */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(
                          priceRange[0],
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {priceRange[1] >= MAX_PRICE ? '∞' : formatPrice(
                          priceRange[1],
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={MAX_PRICE}
                        step={50}
                        className="w-full"
                      />
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => handleMinPriceChange(e.target.value)}
                          onBlur={handlePriceFilter}
                          min="0"
                          max={MAX_PRICE}
                          step="1"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                        <Input
                          type="number"
                          placeholder={MAX_PRICE.toString()}
                          value={maxPrice}
                          onChange={(e) => handleMaxPriceChange(e.target.value)}
                          onBlur={handlePriceFilter}
                          min="0"
                          max={MAX_PRICE}
                          step="1"
                          className="h-9"
                        />
                      </div>
                    </div>

                    {(minPrice || maxPrice) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearPrice}
                        className="w-full rounded-2xl"
                      >
                        Clear Price Filter
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Sort By</h3>
                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('_');
                      setSortBy(sort);
                      setSortOrder(order);
                      setPage(1);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                  >
                    <option value="created_at_desc">Newest First</option>
                    <option value="created_at_asc">Oldest First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {(categoryId || minPrice || maxPrice) && (
              <div className="mb-4 flex flex-wrap gap-3">
                {categoryId && (
                  <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2 text-sm">
                    {categoriesData?.data?.find((c: any) => c.id === categoryId)?.name}
                    <button onClick={() => handleCategoryClick(null)} className="ml-1">×</button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2 text-sm">
                    Price: {formatPrice(
                      minPrice || '0',
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )} - {maxPrice ? formatPrice(
                      maxPrice,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    ) : '∞'}
                    <button onClick={handleClearPrice} className="ml-1">×</button>
                  </Badge>
                )}
              </div>
            )}

            <Card className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              {isLoading && page === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl border">
                      <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {accumulatedProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {accumulatedProducts.map((product: any) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Loading indicator for additional pages */}
                      {isLoadingMore && (
                        <div className="mt-6 flex justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}

                      {/* Load More Button */}
                      {accumulatedProducts.length > 0 && hasMorePages && !isLoadingMore && (
                        <div className="mt-10 flex flex-col items-center gap-3">
                          <Button
                            onClick={handleLoadMore}
                            size="lg"
                            className="rounded-full px-8 py-6 text-base font-semibold"
                          >
                            Load More Products
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Showing {accumulatedProducts.length} of {data?.total || data?.meta?.total || 0} products
                          </p>
                        </div>
                      )}

                      {/* End of results message */}
                      {!hasMorePages && accumulatedProducts.length > 0 && (
                        <div className="mt-8 text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            Showing all {accumulatedProducts.length} products
                          </p>
                        </div>
                      )}

                      {/* No products message */}
                      {accumulatedProducts.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No products found matching your filters.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No products available.</p>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Products;
