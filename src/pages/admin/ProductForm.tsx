import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductQuery, useCreateProductMutation, useUpdateProductMutation, useGetCategoriesQuery, useUploadProductImagesMutation, useRemoveProductImageMutation, useSetProductThumbnailMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, X, Star } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  long_description: string;
  price: string;
  stock_quantity: string;
  sku: string;
  category_id: string;
  weight: string;
  dimensions: string;
  brand: string;
  model: string;
  tags: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: product, isLoading: loadingProduct } = useGetProductQuery(id!, { skip: !isEdit });
  const { data: categoriesData } = useGetCategoriesQuery({ paginate: false });
  const categories = categoriesData?.data || [];

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadImages, { isLoading: uploading }] = useUploadProductImagesMutation();
  const [removeImage] = useRemoveProductImageMutation();
  const [setThumbnail] = useSetProductThumbnailMutation();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    weight: '',
    dimensions: '',
    brand: '',
    model: '',
    tags: '',
    is_active: true,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        long_description: product.long_description || '',
        price: product.price || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        sku: product.sku || '',
        category_id: product.category_id?.toString() || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        brand: product.brand || '',
        model: product.model || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
        is_active: product.is_active ?? true,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: product.meta_keywords || '',
      });
    }
  }, [product]);

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: parseInt(formData.category_id),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      let productId = id;

      if (isEdit) {
        await updateProduct({ id: parseInt(id!), ...payload }).unwrap();
        toast({ title: 'Product updated successfully' });
      } else {
        const result = await createProduct(payload).unwrap();
        productId = result.data.id;
        toast({ title: 'Product created successfully' });
      }

      // Upload images if any
      if (selectedFiles.length > 0 && productId) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('images[]', file);
        });
        await uploadImages({ productId, formData }).unwrap();
        toast({ title: 'Images uploaded successfully' });
      }

      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveImage = async () => {
    if (!deleteImageId) return;

    try {
      await removeImage({ productId: parseInt(id!), mediaId: deleteImageId }).unwrap();
      toast({ title: 'Image removed successfully' });
      setDeleteImageId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const handleSetThumbnail = async (mediaId: number) => {
    try {
      await setThumbnail({ productId: parseInt(id!), mediaId }).unwrap();
      toast({ title: 'Thumbnail updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to set thumbnail',
        variant: 'destructive',
      });
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Update product information' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            {isEdit && <TabsTrigger value="images">Images</TabsTrigger>}
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      placeholder="Auto-generated from name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleChange('description', value)}
                    placeholder="Enter a short description of the product..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Long Description</Label>
                  <RichTextEditor
                    value={formData.long_description}
                    onChange={(value) => handleChange('long_description', value)}
                    placeholder="Enter a detailed description of the product..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleChange('stock_quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Additional product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleChange('dimensions', e.target.value)}
                      placeholder="L x W x H"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="comma, separated, tags"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Textarea
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => handleChange('meta_keywords', e.target.value)}
                    rows={2}
                    maxLength={500}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isEdit && (
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Manage product photos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product?.media && product.media.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {product.media.map((media: any) => (
                        <div key={media.id} className="relative group">
                          <img
                            src={media.url}
                            alt={media.alt_text || ''}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={media.is_thumbnail ? "default" : "secondary"}
                              onClick={() => handleSetThumbnail(media.id)}
                            >
                              <Star className={`h-4 w-4 ${media.is_thumbnail ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteImageId(media.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {media.is_thumbnail && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Thumbnail
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="images">Upload New Images</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                      />
                      {selectedFiles.length > 0 && (
                        <Button
                          type="button"
                          onClick={async () => {
                            const formData = new FormData();
                            selectedFiles.forEach((file) => {
                              formData.append('images[]', file);
                            });
                            try {
                              await uploadImages({ productId: parseInt(id!), formData }).unwrap();
                              toast({ title: 'Images uploaded successfully' });
                              setSelectedFiles([]);
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error?.data?.message || 'Failed to upload images',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload
                        </Button>
                      )}
                    </div>
                    {selectedFiles.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {selectedFiles.length} file(s) selected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {(creating || updating) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? 'Update' : 'Create'} Product
            </Button>
          </div>
        </Tabs>
      </form>

      <ConfirmDialog
        open={!!deleteImageId}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
        onConfirm={handleRemoveImage}
        title="Remove Image"
        description="Are you sure you want to remove this image? This action cannot be undone."
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
