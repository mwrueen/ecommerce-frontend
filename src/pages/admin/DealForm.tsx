import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetAdminDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  Save,
  X,
  Tag,
  Percent,
  Flame,
  ShoppingBag,
  Gift,
  Layers,
  Sparkles,
  Calendar as CalendarIcon,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/admin/MultiSelect';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formatInitialDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr.split(' ')[0] || dateStr.split('T')[0] || '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dealSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    short_description: z.string().optional(),
    type: z.enum(['product', 'category', 'flash', 'buy_x_get_y', 'minimum_purchase']),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.coerce.number().positive('Discount value must be greater than 0'),
    maximum_discount: z.coerce.number().optional(),
    minimum_purchase_amount: z.coerce.number().optional(),
    applicable_products: z.array(z.number()).optional().default([]),
    applicable_categories: z.array(z.number()).optional().default([]),
    buy_quantity: z.coerce.number().optional(),
    get_quantity: z.coerce.number().optional(),
    get_product_id: z.coerce.number().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    priority: z.coerce.number().default(0),
    image_url: z.string().optional().or(z.literal('')),
    banner_image_url: z.string().optional().or(z.literal('')),
    image: z.any().optional(),
    banner_image: z.any().optional(),
    usage_limit: z.coerce.number().optional(),
    usage_limit_per_customer: z.coerce.number().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    if (data.type === 'product' && (!data.applicable_products || data.applicable_products.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicable_products'],
        message: 'At least one product must be selected for product deals',
      });
    }

    if (data.type === 'category' && (!data.applicable_categories || data.applicable_categories.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicable_categories'],
        message: 'At least one category must be selected for category deals',
      });
    }

    if (data.type === 'buy_x_get_y') {
      if (!data.buy_quantity || data.buy_quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['buy_quantity'],
          message: 'Buy quantity must be at least 1',
        });
      }
      if (!data.get_quantity || data.get_quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['get_quantity'],
          message: 'Get quantity must be at least 1',
        });
      }
      if (!data.get_product_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['get_product_id'],
          message: 'Free product selection is required',
        });
      }
    }

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_date'],
          message: 'End date must be equal to or after start date',
        });
      }
    }
  });

type DealFormValues = z.infer<typeof dealSchema>;

export default function DealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: dealData } = useGetAdminDealQuery(id!, { skip: !isEdit });
  const { data: productsData } = useGetProductsQuery({ per_page: 500 });
  const { data: categoriesData } = useGetCategoriesQuery({ per_page: 500 });
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const productItems = Array.isArray(productsData?.data)
    ? productsData.data
    : productsData?.data?.data || [];

  const categoryItems = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : categoriesData?.data?.data || [];

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      type: 'product',
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true,
      is_featured: false,
      priority: 0,
      start_date: formatInitialDate(new Date().toISOString()),
      end_date: formatInitialDate(new Date(Date.now() + 7 * 86400000).toISOString()),
      applicable_products: [],
      applicable_categories: [],
    },
  });

  const dealType = form.watch('type');
  const discountType = form.watch('discount_type');

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
        applicable_products: deal.applicable_products || [],
        applicable_categories: deal.applicable_categories || [],
        buy_quantity: deal.buy_quantity,
        get_quantity: deal.get_quantity,
        get_product_id: deal.get_product_id,
        start_date: formatInitialDate(deal.start_date),
        end_date: formatInitialDate(deal.end_date),
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
      if (deal.image_url) setImagePreview(deal.image_url);
      if (deal.banner_image_url) setBannerPreview(deal.banner_image_url);
    }
  }, [dealData, form]);

  const onSubmit = async (values: DealFormValues) => {
    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        // Omit Buy X Get Y specific fields if deal type is not buy_x_get_y
        if (values.type !== 'buy_x_get_y' && ['buy_quantity', 'get_quantity', 'get_product_id'].includes(key)) {
          return;
        }

        // Skip undefined/null/empty/NaN values for optional numeric fields
        if (['buy_quantity', 'get_quantity', 'get_product_id', 'maximum_discount', 'minimum_purchase_amount', 'usage_limit', 'usage_limit_per_customer'].includes(key)) {
          if (value === undefined || value === null || value === '' || isNaN(value as number)) {
            return;
          }
        }

        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          key !== 'applicable_products' &&
          key !== 'applicable_categories' &&
          key !== 'image' &&
          key !== 'banner_image'
        ) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (values.applicable_products && Array.isArray(values.applicable_products)) {
        values.applicable_products.forEach((id, index) => {
          formData.append(`applicable_products[${index}]`, id.toString());
        });
      }

      if (values.applicable_categories && Array.isArray(values.applicable_categories)) {
        values.applicable_categories.forEach((id, index) => {
          formData.append(`applicable_categories[${index}]`, id.toString());
        });
      }

      if (values.image instanceof File) {
        formData.append('image', values.image);
      }
      if (values.banner_image instanceof File) {
        formData.append('banner_image', values.banner_image);
      }

      if (isEdit) {
        formData.append('_method', 'PUT');
        await updateDeal({ id: parseInt(id!), data: formData }).unwrap();
        toast.success('Deal updated successfully');
      } else {
        await createDeal(formData).unwrap();
        toast.success('Deal created successfully');
      }
      navigate('/admin/deals');
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} deal`);
    }
  };

  const dealTypeCards = [
    { type: 'product', title: 'Product Deal', desc: 'Apply discount to specific products', icon: ShoppingBag, color: 'from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30' },
    { type: 'category', title: 'Category Deal', desc: 'Apply discount across entire categories', icon: Layers, color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/30' },
    { type: 'flash', title: 'Flash Sale', desc: 'Urgent time-limited sitewide flash offer', icon: Flame, color: 'from-rose-500/20 to-red-500/20 text-rose-600 border-rose-500/30' },
    { type: 'buy_x_get_y', title: 'Buy X Get Y', desc: 'Bundle promotion with free gift product', icon: Gift, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-500/30' },
    { type: 'minimum_purchase', title: 'Min Purchase', desc: 'Discount when spending above minimum', icon: Percent, color: 'from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white shrink-0"
              onClick={() => navigate('/admin/deals')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold tracking-wide uppercase px-2.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Promotions Engine
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{isEdit ? 'Edit Promotional Deal' : 'Create New Promotional Deal'}</h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {isEdit ? 'Modify promotion rules, dates, and discount rates' : 'Configure flash sales, product discounts, or bundle offers for customers'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Select Deal Type */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-indigo-600" />
                Select Promotion Type
              </CardTitle>
              <CardDescription>
                Choose how this promotion targets products or purchase behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {dealTypeCards.map((item) => {
                        const Icon = item.icon;
                        const isSelected = field.value === item.type;
                        return (
                          <div
                            key={item.type}
                            onClick={() => field.onChange(item.type)}
                            className={cn(
                              'cursor-pointer rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between space-y-3',
                              isSelected
                                ? `bg-gradient-to-br ${item.color} shadow-md ring-2 ring-indigo-500 border-indigo-500`
                                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className={cn('p-2.5 rounded-xl bg-white/80 shadow-xs', isSelected ? 'text-indigo-600' : 'text-slate-600')}>
                                <Icon className="h-5 w-5" />
                              </div>
                              {isSelected && (
                                <Badge className="bg-indigo-600 text-white border-0 text-[10px] px-2">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
              <CardDescription>Public display details and deal content</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Deal Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Mega Sale 30% OFF" className="rounded-xl h-11" {...field} />
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
                      <FormLabel className="font-bold">Custom URL Slug (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. summer-mega-sale" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Leave empty to generate automatically from title</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Short Subtitle / Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief promotional highlight visible on cards" className="rounded-xl h-11" {...field} />
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
                    <FormLabel className="font-bold">Full Description / Terms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed promotion terms, conditions, and highlights" rows={4} className="rounded-2xl resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Deal Value & Target Config */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold">Discount Rate & Target Rules</CardTitle>
              <CardDescription>Configure discount value and targeting conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Discount Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
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
                      <FormLabel className="font-bold">
                        Discount Value * {discountType === 'percentage' ? '(%)' : '($)'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 15.00'} className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximum_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Maximum Discount Cap ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Optional cap (e.g. 50.00)" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Max discount allowed per order</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="minimum_purchase_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Minimum Order Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 100.00" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Subtotal required to trigger this deal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Display Priority</FormLabel>
                      <FormControl>
                        <Input type="number" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Higher priority numbers display first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Eligibility Selectors */}
              <div className="space-y-5 pt-4 border-t">
                <h3 className="font-bold text-sm text-foreground">Target Scope & Eligibility</h3>

                {dealType === 'product' && (
                  <FormField
                    control={form.control}
                    name="applicable_products"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-amber-700">Eligible Products *</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={productItems.map((p: any) => ({
                              label: `${p.name} ${p.sku ? `(SKU: ${p.sku})` : ''}`,
                              value: p.id,
                            }))}
                            selected={Array.isArray(field.value) ? field.value : []}
                            onChange={field.onChange}
                            placeholder="Select target products for this deal..."
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Discount will apply only to selected products
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
                        <FormLabel className="font-bold text-blue-700">Eligible Categories *</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={categoryItems.map((c: any) => ({
                              label: c.name,
                              value: c.id,
                            }))}
                            selected={Array.isArray(field.value) ? field.value : []}
                            onChange={field.onChange}
                            placeholder="Select target categories..."
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Discount will apply to all products under selected categories
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {dealType === 'buy_x_get_y' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <Gift className="h-4 w-4" />
                      Buy X Get Y Bundle Settings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="buy_quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-xs">Buy Quantity (X) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 2" className="rounded-xl h-10 bg-white" {...field} />
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
                            <FormLabel className="font-bold text-xs">Free Quantity (Y) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 1" className="rounded-xl h-10 bg-white" {...field} />
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
                            <FormLabel className="font-bold text-xs">Free Gift Product *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value ? field.value.toString() : ''}
                                onValueChange={(val) => field.onChange(parseInt(val))}
                              >
                                <SelectTrigger className="rounded-xl h-10 bg-white">
                                  <SelectValue placeholder="Select gift item" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {productItems.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Usage Limits */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                Schedule & Usage Limits
              </CardTitle>
              <CardDescription>Define promotion validity period and claim limits</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder="Select start date" />
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
                      <FormLabel className="font-bold">End Date *</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder="Select end date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="usage_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Total Usage Limit (Sitewide)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Leave empty for unlimited" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Total times this deal can be used by all customers combined</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usage_limit_per_customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Usage Limit Per Customer</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Leave empty for unlimited" className="rounded-xl h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Maximum redemptions per user account</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Media */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Promotional Media
              </CardTitle>
              <CardDescription>Upload card image or full-width banner</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Image */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Card Thumbnail Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            className="rounded-xl h-11 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            {...field}
                          />
                          {imagePreview && (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-sm group">
                              <img src={imagePreview} alt="Deal Thumbnail" className="w-full h-full object-cover" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-90 hover:opacity-100"
                                onClick={() => {
                                  setImagePreview(null);
                                  onChange(null);
                                  form.setValue('image_url', '');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-[11px]">Recommended: 800x800px image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Banner Image */}
                <FormField
                  control={form.control}
                  name="banner_image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Banner Hero Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            className="rounded-xl h-11 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setBannerPreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            {...field}
                          />
                          {bannerPreview && (
                            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border shadow-sm group">
                              <img src={bannerPreview} alt="Deal Banner" className="w-full h-full object-cover" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-90 hover:opacity-100"
                                onClick={() => {
                                  setBannerPreview(null);
                                  onChange(null);
                                  form.setValue('banner_image_url', '');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-[11px]">Recommended: 1920x600px wide image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs">Alternative Thumbnail Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="rounded-xl h-10 text-xs" {...field} />
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
                      <FormLabel className="font-bold text-xs">Alternative Banner Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="rounded-xl h-10 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visibility Controls */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-bold">Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border">
                    <div>
                      <FormLabel className="font-bold">Active Promotion</FormLabel>
                      <FormDescription className="text-[11px]">Make this promotion active and accessible to shoppers</FormDescription>
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
                  <FormItem className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <div>
                      <FormLabel className="font-bold text-indigo-900">Featured Promotion</FormLabel>
                      <FormDescription className="text-[11px] text-indigo-700">Display prominently on store home page and deal banners</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl h-12 px-6 font-semibold border-slate-300 hover:bg-slate-100"
              onClick={() => navigate('/admin/deals')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="rounded-2xl h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
            >
              <Save className="h-5 w-5 mr-2" />
              {isEdit ? (isUpdating ? 'Updating...' : 'Update Deal') : isCreating ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
