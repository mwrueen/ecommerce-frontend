import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0, 'Discount value must be positive'),
  minimum_purchase: z.number().min(0).optional(),
  maximum_discount: z.number().min(0).optional(),
  usage_limit: z.number().int().min(0).optional(),
  usage_limit_per_customer: z.number().int().min(0).optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  is_active: z.boolean(),
  first_order_only: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function CouponForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: couponData } = useGetCouponQuery(id, { skip: !isEdit });
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount_value: 0,
      minimum_purchase: 0,
      maximum_discount: 0,
      usage_limit: 0,
      usage_limit_per_customer: 0,
      valid_from: '',
      valid_until: '',
      is_active: true,
      first_order_only: false,
    },
  });

  useEffect(() => {
    if (couponData?.data) {
      const coupon = couponData.data;
      form.reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        type: coupon.type,
        discount_value: parseFloat(coupon.discount_value),
        minimum_purchase: coupon.minimum_purchase ? parseFloat(coupon.minimum_purchase) : 0,
        maximum_discount: coupon.maximum_discount ? parseFloat(coupon.maximum_discount) : 0,
        usage_limit: coupon.usage_limit || 0,
        usage_limit_per_customer: coupon.usage_limit_per_customer || 0,
        valid_from: coupon.valid_from || '',
        valid_until: coupon.valid_until || '',
        is_active: coupon.is_active,
        first_order_only: coupon.first_order_only,
      });
    }
  }, [couponData, form]);

  const onSubmit = async (data: CouponFormData) => {
    try {
      // Prepare data: convert 0 to undefined for optional numeric fields
      const submitData = {
        ...data,
        minimum_purchase: data.minimum_purchase && data.minimum_purchase > 0 ? data.minimum_purchase : undefined,
        maximum_discount: data.maximum_discount && data.maximum_discount > 0 ? data.maximum_discount : undefined,
        usage_limit: data.usage_limit && data.usage_limit > 0 ? data.usage_limit : undefined,
        usage_limit_per_customer: data.usage_limit_per_customer && data.usage_limit_per_customer > 0 ? data.usage_limit_per_customer : undefined,
      };

      if (isEdit) {
        await updateCoupon({ id: parseInt(id!), ...submitData }).unwrap();
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
        });
      } else {
        await createCoupon(submitData).unwrap();
        toast({
          title: 'Success',
          description: 'Coupon created successfully',
        });
      }
      navigate('/admin/coupons');
    } catch (error: any) {
      // Handle API validation errors
      if (error?.data?.errors) {
        const apiErrors = error.data.errors;
        // Set field-level errors from API response
        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldErrors = apiErrors[fieldName];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            // Use the first error message for each field
            form.setError(fieldName as keyof CouponFormData, {
              type: 'server',
              message: fieldErrors[0],
            });
          }
        });
      }
      
      toast({
        title: 'Error',
        description: error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} coupon`,
        variant: 'destructive',
      });
    }
  };

  const discountType = form.watch('type');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/coupons')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Create'} Coupon</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update coupon details' : 'Add a new discount coupon'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Coupon Code <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SAVE20" className="font-mono uppercase" />
                      </FormControl>
                      <FormDescription>
                        Unique code customers will use to apply the discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="20% Off Summer Sale" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Coupon description..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormDescription>
                          Make this coupon available for use
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
                  name="first_order_only"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          First Order Only <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormDescription>
                          Restrict to first-time customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Discount Type <span className="text-destructive">*</span>
                      </FormLabel>
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
                      <FormLabel>
                        Discount Value <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {discountType === 'percentage' ? 'Percentage (0-100)' : 'Dollar amount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimum_purchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Minimum order amount required</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {discountType === 'percentage' && (
                  <FormField
                    control={form.control}
                    name="maximum_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Cap the discount amount</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Limits & Validity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="usage_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Usage Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                            field.onChange(isNaN(value as number) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Total times coupon can be used</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usage_limit_per_customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per-Customer Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                            field.onChange(isNaN(value as number) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Times each customer can use it</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder="Select valid from date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder="Select valid until date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
