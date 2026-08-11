import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSearchQuery } from '@/hooks/useApi';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronLeft, ChevronRight, Package, FolderOpen, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';

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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6">
        <div className="container mx-auto px-4 space-y-5">

          {/* ── Compact Search Bar ── */}
          <section className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 px-5 py-5 shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-40 bg-gradient-to-b from-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0 text-center sm:text-left">
                <h1 className="text-lg font-bold text-white leading-tight">
                  {query ? (
                    <>Results for "<span className="text-indigo-300">{query}</span>"</>
                  ) : (
                    'Search Store'
                  )}
                </h1>
                {meta && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {meta.total_results} result{meta.total_results !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:max-w-lg sm:ml-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search products…"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="h-10 rounded-xl border-slate-700 bg-slate-900/80 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20"
                >
                  Search
                </Button>
              </form>
            </div>
          </section>

          {/* ── Filter toolbar ── */}
          {query && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card px-4 py-2.5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <Tabs value={type} onValueChange={handleTypeChange}>
                  <TabsList className="rounded-lg bg-slate-100 dark:bg-slate-800 h-8">
                    <TabsTrigger value="all" className="rounded-md px-3 text-xs font-semibold h-6">All</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-md px-3 text-xs font-semibold h-6">Products</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-md px-3 text-xs font-semibold h-6">Categories</TabsTrigger>
                  </TabsList>
                </Tabs>

                {type !== 'categories' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[160px] rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-8 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price_asc">Price: Low → High</SelectItem>
                        <SelectItem value="price_desc">Price: High → Low</SelectItem>
                        <SelectItem value="created_at">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Content ── */}
          {!query ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card py-20 text-center shadow-sm">
              <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <h2 className="text-lg font-bold mb-1 text-foreground">Start Searching</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Enter a keyword above to discover products and categories.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* No Results */}
              {meta?.total_results === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card py-16 text-center shadow-sm">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <h2 className="text-lg font-bold mb-1 text-foreground">No results found</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    We couldn't find anything matching "<strong>{query}</strong>". Try different keywords.
                  </p>
                </div>
              )}

              {/* ── Two-column layout: Products (main) + Categories (sidebar) ── */}
              {meta && meta.total_results > 0 && (
                <div className="flex gap-6 items-start">

                  {/* Main — Products */}
                  <div className="flex-1 min-w-0">
                    {products && products.data.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <h2 className="text-base font-extrabold text-foreground tracking-tight">
                            Products
                          </h2>
                          <span className="text-xs text-muted-foreground">({products.total})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {products.data.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                          <div className="flex justify-center items-center gap-1.5 pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(page - 1)}
                              disabled={page === 1 || isFetching}
                              className="rounded-lg border-slate-200 dark:border-slate-700 h-9 px-3 gap-1 font-semibold text-xs"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              Prev
                            </Button>

                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(products.last_page, 5) }, (_, i) => {
                                let pageNum: number;
                                if (products.last_page <= 5) {
                                  pageNum = i + 1;
                                } else if (page <= 3) {
                                  pageNum = i + 1;
                                } else if (page >= products.last_page - 2) {
                                  pageNum = products.last_page - 4 + i;
                                } else {
                                  pageNum = page - 2 + i;
                                }
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={pageNum === page ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={isFetching}
                                    className={`h-9 w-9 rounded-lg text-xs font-bold ${
                                      pageNum === page
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(page + 1)}
                              disabled={!products.has_more_pages || isFetching}
                              className="rounded-lg border-slate-200 dark:border-slate-700 h-9 px-3 gap-1 font-semibold text-xs"
                            >
                              Next
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </section>
                    )}

                    {/* If only categories, no products */}
                    {(!products || products.data.length === 0) && categories && categories.data.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card py-12 text-center">
                        <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground">No products found. Check matching categories →</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar — Categories */}
                  {categories && categories.data.length > 0 && (
                    <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24">
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-foreground">Related Categories</h3>
                            <span className="ml-auto text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                              {categories.total}
                            </span>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {categories.data.map((category: any) => (
                            <Link
                              key={category.id}
                              to={`/categories/${category.slug}`}
                              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {category.image_url ? (
                                  <img
                                    src={getStorageUrl(category.image_url)}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {category.name}
                                </p>
                                {category.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1">{category.description}</p>
                                )}
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </aside>
                  )}
                </div>
              )}

              {/* Mobile-only categories (below products) */}
              {categories && categories.data.length > 0 && (
                <section className="lg:hidden space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-base font-extrabold text-foreground tracking-tight">Related Categories</h2>
                    <span className="text-xs text-muted-foreground">({categories.total})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.data.map((category: any) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-3 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {category.image_url ? (
                            <img
                              src={getStorageUrl(category.image_url)}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {category.name}
                          </p>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Browse →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
