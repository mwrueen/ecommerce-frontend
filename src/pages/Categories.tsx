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

  const handleShowMore = (categoryId: number) => {
    navigate(`/products?category_id=${categoryId}`);
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

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-muted-foreground text-lg">
            Explore our curated collections and discover products that match your style
          </p>
        </div>

        {/* Categories with Products */}
        <div className="space-y-16">
          {categories.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
              <p className="text-muted-foreground">
                Check back soon for new categories and products.
              </p>
            </Card>
          ) : (
            categories.map((category: any) => (
              <div key={category.id} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    {category.image_url && (
                      <img
                        src={category.full_image_url || category.image_url}
                        alt={category.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
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
                      variant="outline"
                      onClick={() => handleShowMore(category.id)}
                      className="gap-2"
                    >
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Products Grid */}
                {category.products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Show More Button (bottom) */}
                    {category.products.length >= 8 && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => handleShowMore(category.id)}
                          variant="secondary"
                          size="lg"
                          className="gap-2"
                        >
                          Show More from {category.name}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No products available in this category yet.
                    </p>
                  </Card>
                )}
              </div>
            ))
          )}
        </div>

        {/* Browse All Products Link */}
        <div className="mt-16 text-center">
          <Link to="/products">
            <Button size="lg" variant="outline" className="gap-2">
              Browse All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
