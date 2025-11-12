import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  useGetCategoryQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/useApi';

interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: categoryData, isLoading: isLoadingCategory } = useGetCategoryQuery(id!, {
    skip: !isEdit,
  });

  const { data: categoriesData } = useGetCategoriesQuery({ paginate: false });
  const categories = categoriesData?.data || [];

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      is_active: true,
      is_featured: false,
    },
  });

  const isActive = watch('is_active');
  const isFeatured = watch('is_featured');

  useEffect(() => {
    if (isEdit && categoryData?.data) {
      const category = categoryData.data;
      setValue('name', category.name);
      setValue('slug', category.slug);
      setValue('description', category.description || '');
      setValue('parent_id', category.parent_id);
      setValue('icon', category.icon || '');
      setValue('sort_order', category.sort_order);
      setValue('is_active', category.is_active);
      setValue('is_featured', category.is_featured);
      setValue('meta_title', category.meta_title || '');
      setValue('meta_description', category.meta_description || '');
      setValue('meta_keywords', category.meta_keywords || '');
    }
  }, [categoryData, isEdit, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEdit) {
        await updateCategory({ id: Number(id), ...data }).unwrap();
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        await createCategory(data).unwrap();
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      navigate('/admin/categories');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingCategory) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Update category information' : 'Add a new product category'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Basic category details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Electronics"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register('slug')} placeholder="electronics" />
                <p className="text-xs text-muted-foreground">
                  Leave empty to auto-generate from name
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Category description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Category</Label>
                <Select
                  value={watch('parent_id')?.toString() || 'none'}
                  onValueChange={(value) =>
                    setValue('parent_id', value === 'none' ? null : Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {categories
                      .filter((cat: any) => cat.id !== Number(id))
                      .map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input id="icon" {...register('icon')} placeholder="fa-laptop" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Featured
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize category for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                {...register('meta_title')}
                placeholder="Electronics - Best Deals"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                {...register('meta_description')}
                placeholder="Shop the latest electronics at great prices"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                {...register('meta_keywords')}
                placeholder="electronics, gadgets, devices"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/categories')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
