import { useState, useEffect } from 'react';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Filter, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Products = () => {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Slider state (0-10000 range)
  const MAX_PRICE = 10000;
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  
  // Sync slider with inputs
  useEffect(() => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : MAX_PRICE;
    setPriceRange([min, max]);
  }, [minPrice, maxPrice]);
  
  const { data, isLoading } = useGetProductsQuery({ 
    page, 
    per_page: 12,
    ...(categoryId && { category_id: categoryId }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    sort_by: sortBy,
    sort_order: sortOrder
  });
  
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({
    active: 'true',
    sort_by: 'name',
    sort_order: 'asc'
  });

  const handleCategoryClick = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleSliderChange = (values: number[]) => {
    setPriceRange(values);
    setMinPrice(values[0] > 0 ? values[0].toString() : '');
    setMaxPrice(values[1] < MAX_PRICE ? values[1].toString() : '');
    setPage(1);
  };

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
    setPage(1);
  };

  const handleClearPrice = () => {
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([0, MAX_PRICE]);
    setPage(1);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of quality products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h2 className="font-semibold">Filters</h2>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={categoryId === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleCategoryClick(null)}
                    >
                      All Categories
                      {categoryId === null && data?.meta && (
                        <Badge variant="secondary" className="ml-auto">
                          {data.meta.total}
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
                          className="w-full justify-start"
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
                  <div className="space-y-4">
                    {/* Price Display */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${priceRange[0].toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">
                        ${priceRange[1] >= MAX_PRICE ? '∞' : priceRange[1].toFixed(0)}
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
                        className="w-full"
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
                    className="w-full p-2 rounded-md border bg-background text-sm"
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
              <div className="mb-4 flex flex-wrap gap-2">
                {categoryId && (
                  <Badge variant="secondary" className="gap-2">
                    {categoriesData?.data?.find((c: any) => c.id === categoryId)?.name}
                    <button onClick={() => handleCategoryClick(null)} className="ml-1">×</button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="gap-2">
                    Price: ${minPrice || '0'} - ${maxPrice || '∞'}
                    <button onClick={handleClearPrice} className="ml-1">×</button>
                  </Badge>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.data?.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {data?.meta && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {data.meta.current_page} of {data.meta.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page === data.meta.last_page}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
