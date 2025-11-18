import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useGetDealQuery, useCreateDealMutation, useUpdateDealMutation, useGetProductsQuery, useGetCategoriesQuery } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  type: z.enum(['product', 'category', 'flash', 'buy_x_get_y', 'minimum_purchase']),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive('Discount value must be positive'),
  maximum_discount: z.coerce.number().optional(),
  minimum_purchase_amount: z.coerce.number().optional(),
  applicable_products: z.string().optional(),
  applicable_categories: z.string().optional(),
  buy_quantity: z.coerce.number().optional(),
  get_quantity: z.coerce.number().optional(),
  get_product_id: z.coerce.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  priority: z.coerce.number().default(0),
  image_url: z.string().url().optional().or(z.literal('')),
  banner_image_url: z.string().url().optional().or(z.literal('')),
  usage_limit: z.coerce.number().optional(),
  usage_limit_per_customer: z.coerce.number().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

export default function DealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: dealData } = useGetDealQuery(id!, { skip: !isEdit });
  const { data: productsData } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      type: 'product',
      discount_type: 'percentage',
      discount_value: 0,
      is_active: true,
      is_featured: false,
      priority: 0,
    },
  });

  const dealType = form.watch('type');

  useEffect(() => {
    if (dealData?.data) {
      const deal = dealData.data;
      form.reset({
        title: deal.title,
        slug: deal.slug,
        description: deal.description || '',
        short_description: deal.short_description || '',
        type: deal.type,
        discount_type: deal.discount_type,
        discount_value: parseFloat(deal.discount_value),
        maximum_discount: deal.maximum_discount ? parseFloat(deal.maximum_discount) : undefined,
        minimum_purchase_amount: deal.minimum_purchase_amount ? parseFloat(deal.minimum_purchase_amount) : undefined,
        applicable_products: deal.applicable_products?.join(',') || '',
        applicable_categories: deal.applicable_categories?.join(',') || '',
        buy_quantity: deal.buy_quantity,
        get_quantity: deal.get_quantity,
        get_product_id: deal.get_product_id,
        start_date: deal.start_date.split('T')[0],
        end_date: deal.end_date.split('T')[0],
        is_active: deal.is_active,
        is_featured: deal.is_featured,
        priority: deal.priority,
        image_url: deal.image_url || '',
        banner_image_url: deal.banner_image_url || '',
        usage_limit: deal.usage_limit,
        usage_limit_per_customer: deal.usage_limit_per_customer,
        meta_title: deal.meta_title || '',
        meta_description: deal.meta_description || '',
        meta_keywords: deal.meta_keywords || '',
      });
    }
  }, [dealData, form]);

  const onSubmit = async (values: DealFormValues) => {
    try {
      const data: any = {
        ...values,
        applicable_products: values.applicable_products 
          ? values.applicable_products.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : undefined,
        applicable_categories: values.applicable_categories
          ? values.applicable_categories.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : undefined,
      };

      if (isEdit) {
        await updateDeal({ id: parseInt(id!), data }).unwrap();
        toast.success('Deal updated successfully');
      } else {
        await createDeal(data).unwrap();
        toast.success('Deal created successfully');
      }
      navigate('/admin/deals');
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} deal`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/deals')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Deal' : 'Create Deal'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update deal information' : 'Add a new promotional deal'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="auto-generated if empty" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="flash">Flash Sale</SelectItem>
                          <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                          <SelectItem value="minimum_purchase">Minimum Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maximum_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimum_purchase_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Purchase</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(dealType === 'product' || dealType === 'flash') && (
                  <FormField
                    control={form.control}
                    name="applicable_products"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicable Products (IDs, comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1,2,3" />
                        </FormControl>
                        <FormDescription>
                          Enter product IDs separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {dealType === 'category' && (
                  <FormField
                    control={form.control}
                    name="applicable_categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicable Categories (IDs, comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1,2,3" />
                        </FormControl>
                        <FormDescription>
                          Enter category IDs separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {dealType === 'buy_x_get_y' && (
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="buy_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buy Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="get_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Get Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="get_product_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Get Product ID</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Usage Limit</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="Unlimited" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usage_limit_per_customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit Per Customer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="Unlimited" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Higher priority deals appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this deal available to customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Display this deal prominently on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/deals')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update Deal' : 'Create Deal'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
