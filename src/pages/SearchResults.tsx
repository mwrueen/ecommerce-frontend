import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSearchQuery } from '@/hooks/useApi';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronLeft, ChevronRight, Package, FolderOpen } from 'lucide-react';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState(searchParams.get('query') || '');
  
  const query = searchParams.get('query') || '';
  const type = (searchParams.get('type') || 'all') as 'all' | 'products' | 'categories';
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '15');
  const sortBy = searchParams.get('sort_by') || 'relevance';
  const categoryId = searchParams.get('category_id');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const inStock = searchParams.get('in_stock');

  const { data, isLoading, isFetching } = useSearchQuery(
    {
      query,
      type,
      page,
      per_page: perPage,
      sort_by: sortBy as any,
      ...(categoryId && { category_id: parseInt(categoryId) }),
      ...(minPrice && { min_price: parseFloat(minPrice) }),
      ...(maxPrice && { max_price: parseFloat(maxPrice) }),
      ...(inStock && { in_stock: inStock === 'true' }),
    },
    { skip: !query }
  );

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('query', localQuery.trim());
      params.set('page', '1');
      setSearchParams(params);
    }
  };

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', newType);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort_by', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const products = data?.data?.products;
  const categories = data?.data?.categories;
  const meta = data?.data?.meta;

  return (
    <>
      <Helmet>
        <title>Search Results: {query}</title>
        <meta name="description" content={`Search results for "${query}"`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-10">
        <div className="container mx-auto px-4 space-y-10">
        {/* Search Bar */}
        <section className="rounded-3xl border border-slate-100 bg-white/95 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products, categories, or keywords..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-full px-6">Search</Button>
              {query && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Tabs value={type} onValueChange={handleTypeChange}>
                      <TabsList className="rounded-full bg-slate-100">
                        <TabsTrigger value="all" className="rounded-full px-4">All</TabsTrigger>
                        <TabsTrigger value="products" className="rounded-full px-4">Products</TabsTrigger>
                        <TabsTrigger value="categories" className="rounded-full px-4">Categories</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {type !== 'categories' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sort:</span>
                      <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[200px] rounded-full border-slate-200 bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price_asc">Price: Low to High</SelectItem>
                          <SelectItem value="price_desc">Price: High to Low</SelectItem>
                          <SelectItem value="created_at">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          </form>
        </section>

        {/* Results */}
        {!query ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Start Searching</h2>
            <p className="text-muted-foreground">Enter a search term to find products and categories</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            {meta && (
              <div className="mb-6 pb-4 border-b">
                <h1 className="text-2xl font-bold mb-2">
                  Search results for "{query}"
                </h1>
                <p className="text-muted-foreground">
                  Found {meta.total_results} results
                  {meta.products_count > 0 && ` (${meta.products_count} products`}
                  {meta.categories_count > 0 && `, ${meta.categories_count} categories)`}
                </p>
              </div>
            )}

            {/* No Results */}
            {meta?.total_results === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No results found</h2>
                <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            )}

            {/* Categories Results */}
            {categories && categories.data.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Categories ({categories.total})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.data.map((category: any) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.slug}`}
                      className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                    >
                      {category.image_url && (
                        <div className="mb-4 h-32 w-full overflow-hidden rounded-2xl bg-slate-100">
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-3 text-sm font-medium text-primary flex items-center gap-1">
                        View category <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {products && products.data.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Package className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Products ({products.total})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.data.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || isFetching}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {products.current_page} of {products.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!products.has_more_pages || isFetching}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
}
