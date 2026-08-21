import { useGetCategoriesWithProductsQuery } from '@/store/api/categoriesApi';
import ProductCard from '@/components/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getStorageUrl } from '@/lib/utils';

export default function Categories() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCategoriesWithProductsQuery({
    active: 'true',
    sort_by: 'sort_order',
    sort_order: 'asc',
  });

  const categories = data?.data || [];

  const handleShowMore = (categorySlug: string) => {
    navigate(`/products?category=${categorySlug}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shop by Category - Browse All Product Categories</title>
        <meta
          name="description"
          content="Explore our wide range of product categories and discover the latest items in each collection."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
        <div className="container mx-auto px-4 space-y-10">
          
          {/* Header */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-8 sm:p-12 text-center shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-80 bg-gradient-to-b from-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold tracking-wider uppercase">
                EXPLORE BY CATEGORY
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Browse Curated Product Collections
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover lifestyle, technology, fashion, and daily essentials grouped into inspiring collections for faster browsing.
              </p>
            </div>
          </section>

          {/* Categories with Products */}
          <div className="space-y-10">
            {categories.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-card">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">No Categories Available</h3>
                <p className="text-muted-foreground text-sm">
                  Check back soon for new collections and featured products.
                </p>
              </Card>
            ) : (
              categories.map((category: any) => (
                <section
                  key={category.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-6 md:p-8 shadow-xl space-y-6"
                >
                  {/* Category Header */}
                  <div className="flex flex-col gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 p-1.5 border border-indigo-500/20 shadow-inner flex items-center justify-center">
                        {category.image_url ? (
                          <img
                            src={getStorageUrl(category.full_image_url || category.image_url)}
                            alt={category.name}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <Package className="h-7 w-7 text-indigo-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{category.name}</h2>
                        {category.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                        )}
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {category.active_products_count} {category.active_products_count === 1 ? 'Product' : 'Products'} Available
                        </p>
                      </div>
                    </div>
                    {category.products.length > 0 && (
                      <Button
                        onClick={() => handleShowMore(category.slug)}
                        className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
                      >
                        Explore All ({category.name})
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Products Grid */}
                  {category.products.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {category.products.map((product: any) => (
                          <ProductCard key={product.id} product={product} compact />
                        ))}
                      </div>

                      {/* Show More Button (bottom) */}
                      {category.products.length >= 8 && (
                        <div className="flex justify-center pt-4">
                          <Button
                            onClick={() => handleShowMore(category.slug)}
                            variant="outline"
                            size="lg"
                            className="gap-2 rounded-full"
                          >
                            Show More from {category.name}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Card className="p-8 text-center rounded-2xl border border-slate-100 bg-slate-50">
                      <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No products available in this category yet.
                      </p>
                    </Card>
                  )}
                </section>
              ))
            )}
          </div>

          {/* Browse All Products Link */}
          <div className="text-center">
            <Link to="/products">
              <Button size="lg" variant="outline" className="gap-3 rounded-full px-8">
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
