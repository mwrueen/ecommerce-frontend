import { useGetCategoriesWithProductsQuery } from '@/store/api/categoriesApi';
import ProductCard from '@/components/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-12">
        <div className="container mx-auto px-4 space-y-12">
          {/* Header */}
          <section className="rounded-3xl border border-slate-100 bg-white/95 p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Shop by Category</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore curated collections</h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Browse lifestyle, tech, and essentials grouped into beautiful collections designed to inspire your next purchase.
            </p>
          </section>

          {/* Categories with Products */}
          <div className="space-y-10">
          {categories.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl border border-slate-100 bg-white/90">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
              <p className="text-muted-foreground">
                Check back soon for new categories and products.
              </p>
            </Card>
          ) : (
            categories.map((category: any) => (
              <section
                key={category.id}
                className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Category Header */}
                <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-primary/10 p-1.5 ring-2 ring-primary/10">
                      {category.image_url ? (
                        <img
                          src={category.full_image_url || category.image_url}
                          alt={category.name}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <Package className="h-full w-full text-primary" />
                      )}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      {category.description && (
                        <p className="text-muted-foreground">{category.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.active_products_count} {category.active_products_count === 1 ? 'product' : 'products'} available
                      </p>
                    </div>
                  </div>
                  {category.products.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => handleShowMore(category.slug)}
                      className="gap-2 rounded-full"
                    >
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Products Grid */}
                {category.products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {category.products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
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
