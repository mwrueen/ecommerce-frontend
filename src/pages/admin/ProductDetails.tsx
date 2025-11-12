import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetProductQuery, useUpdateProductMutation, useUploadProductImagesMutation, useRemoveProductImageMutation, useSetProductThumbnailMutation, useUpdateImageDetailsMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Save, X, Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading } = useGetProductQuery(id!);
  
  const [updateProduct] = useUpdateProductMutation();
  const [uploadImages] = useUploadProductImagesMutation();
  const [removeImage] = useRemoveProductImageMutation();
  const [setThumbnail] = useSetProductThumbnailMutation();
  const [updateImageDetails] = useUpdateImageDetailsMutation();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [imageEditValues, setImageEditValues] = useState<any>({});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <div className="grid gap-6">
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Button onClick={() => navigate('/admin/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValues({ [field]: value });
  };

  const handleSave = async (field: string) => {
    try {
      await updateProduct({ id: product.id, [field]: editValues[field] }).unwrap();
      toast({ title: 'Product updated successfully' });
      setEditingField(null);
      setEditValues({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images[]', file);
    });

    try {
      await uploadImages({ productId: product.id, formData }).unwrap();
      toast({ title: 'Images uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to upload images',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;

    try {
      await removeImage({ productId: product.id, mediaId: deleteImageId }).unwrap();
      toast({ title: 'Image deleted successfully' });
      setDeleteImageId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const handleSetThumbnail = async (mediaId: number) => {
    try {
      await setThumbnail({ productId: product.id, mediaId }).unwrap();
      toast({ title: 'Thumbnail updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to set thumbnail',
        variant: 'destructive',
      });
    }
  };

  const handleEditImage = (media: any) => {
    setEditingImageId(media.id);
    setImageEditValues({
      alt_text: media.alt_text || '',
      title: media.title || '',
    });
  };

  const handleSaveImage = async () => {
    if (!editingImageId) return;

    try {
      await updateImageDetails({
        productId: product.id,
        mediaId: editingImageId,
        ...imageEditValues,
      }).unwrap();
      toast({ title: 'Image details updated successfully' });
      setEditingImageId(null);
      setImageEditValues({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update image details',
        variant: 'destructive',
      });
    }
  };

  const renderEditableField = (label: string, field: string, value: any, type: 'input' | 'textarea' = 'input') => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field, value)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            {type === 'input' ? (
              <Input
                value={editValues[field]}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              />
            ) : (
              <Textarea
                value={editValues[field]}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                rows={4}
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(field)}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{value || 'Not set'}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Full Edit
          </Button>
          <Link to={`/products/${product.slug}`} target="_blank">
            <Button variant="outline">View on Store</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Quick edit product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderEditableField('Name', 'name', product.name)}
            {renderEditableField('Description', 'description', product.description, 'textarea')}
            {renderEditableField('Price', 'price', product.price)}
            {renderEditableField('Stock Quantity', 'stock_quantity', product.stock_quantity)}
            {renderEditableField('Brand', 'brand', product.brand)}
            {renderEditableField('Model', 'model', product.model)}
          </CardContent>
        </Card>

        {/* Status & Category */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <Separator />
            <div>
              <Label>Category</Label>
              <p className="text-sm text-muted-foreground mt-2">
                {product.category?.name || 'No category'}
              </p>
            </div>
            <Separator />
            <div>
              <Label>Weight</Label>
              <p className="text-sm text-muted-foreground mt-2">{product.weight || 'Not set'}</p>
            </div>
            <div>
              <Label>Dimensions</Label>
              <p className="text-sm text-muted-foreground mt-2">{product.dimensions || 'Not set'}</p>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Manage product images and thumbnails</CardDescription>
            </div>
            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <Button variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!product.media || product.media.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.media.map((media: any) => (
                <div key={media.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={media.url}
                      alt={media.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {media.is_thumbnail && (
                    <Badge className="absolute top-2 left-2" variant="default">
                      <Star className="h-3 w-3 mr-1" />
                      Thumbnail
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {!media.is_thumbnail && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetThumbnail(media.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Thumbnail
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditImage(media)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteImageId(media.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {editingImageId === media.id && (
                    <div className="mt-2 p-3 border rounded-lg bg-background space-y-2">
                      <div>
                        <Label className="text-xs">Alt Text</Label>
                        <Input
                          value={imageEditValues.alt_text}
                          onChange={(e) => setImageEditValues({ ...imageEditValues, alt_text: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={imageEditValues.title}
                          onChange={(e) => setImageEditValues({ ...imageEditValues, title: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveImage}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingImageId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Long Description */}
      <Card>
        <CardHeader>
          <CardTitle>Long Description</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEditableField('', 'long_description', product.long_description, 'textarea')}
        </CardContent>
      </Card>

      {/* SEO Information */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderEditableField('Meta Title', 'meta_title', product.meta_title)}
          {renderEditableField('Meta Description', 'meta_description', product.meta_description, 'textarea')}
          {renderEditableField('Meta Keywords', 'meta_keywords', product.meta_keywords)}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteImageId}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
