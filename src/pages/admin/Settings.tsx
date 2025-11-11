import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Settings() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settingsData?.data) {
      reset(settingsData.data);
    }
  }, [settingsData, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSettings(data).unwrap();
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your store settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your store's basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Store Title</Label>
                  <Input id="title" {...register('title')} placeholder="My Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" {...register('tagline')} placeholder="Best products online" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" {...register('currency')} placeholder="USD" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency_symbol">Currency Symbol</Label>
                    <Input id="currency_symbol" {...register('currency_symbol')} placeholder="$" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input id="business_name" {...register('business_name')} placeholder="My Business LLC" />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="contact@mystore.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input id="support_email" type="email" {...register('support_email')} placeholder="support@mystore.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Phone</Label>
                  <Input id="contact_number" {...register('contact_number')} placeholder="+1-234-567-8900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" {...register('address')} rows={3} placeholder="123 Business Street, City, State" />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social_links.facebook">Facebook</Label>
                  <Input id="social_links.facebook" {...register('social_links.facebook')} placeholder="https://facebook.com/yourpage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_links.twitter">Twitter</Label>
                  <Input id="social_links.twitter" {...register('social_links.twitter')} placeholder="https://twitter.com/yourhandle" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_links.instagram">Instagram</Label>
                  <Input id="social_links.instagram" {...register('social_links.instagram')} placeholder="https://instagram.com/yourhandle" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_links.linkedin">LinkedIn</Label>
                  <Input id="social_links.linkedin" {...register('social_links.linkedin')} placeholder="https://linkedin.com/company/yourcompany" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_links.youtube">YouTube</Label>
                  <Input id="social_links.youtube" {...register('social_links.youtube')} placeholder="https://youtube.com/c/yourchannel" />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input id="meta_title" {...register('meta_title')} placeholder="Store Name - Best Products Online" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea id="meta_description" {...register('meta_description')} rows={3} placeholder="Shop the best products with great deals..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input id="meta_keywords" {...register('meta_keywords')} placeholder="ecommerce, online shopping, products" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input id="google_analytics_id" {...register('google_analytics_id')} placeholder="GA-XXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                  <Input id="facebook_pixel_id" {...register('facebook_pixel_id')} placeholder="123456789012345" />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
