import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function Settings() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  
  const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [headerLogoPreview, setHeaderLogoPreview] = useState<string>('');
  const [footerLogoPreview, setFooterLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  const [sliderPreviews, setSliderPreviews] = useState<string[]>([]);
  const [existingSliders, setExistingSliders] = useState<string[]>([]);

  useEffect(() => {
    if (settingsData?.data) {
      reset(settingsData.data);
      setHeaderLogoPreview(settingsData.data.header_logo || '');
      setFooterLogoPreview(settingsData.data.footer_logo || '');
      setFaviconPreview(settingsData.data.favicon || '');
      setExistingSliders(settingsData.data.slider_images || []);
      setSliderPreviews(settingsData.data.slider_images || []);
    }
  }, [settingsData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'header') {
          setHeaderLogoFile(file);
          setHeaderLogoPreview(reader.result as string);
        } else if (type === 'footer') {
          setFooterLogoFile(file);
          setFooterLogoPreview(reader.result as string);
        } else {
          setFaviconFile(file);
          setFaviconPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: 'header' | 'footer' | 'favicon') => {
    if (type === 'header') {
      setHeaderLogoFile(null);
      setHeaderLogoPreview(settingsData?.data?.header_logo || '');
    } else if (type === 'footer') {
      setFooterLogoFile(null);
      setFooterLogoPreview(settingsData?.data?.footer_logo || '');
    } else {
      setFaviconFile(null);
      setFaviconPreview(settingsData?.data?.favicon || '');
    }
  };

  const handleSliderFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews: string[] = [];
      const newFiles: File[] = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setSliderPreviews([...sliderPreviews, ...newPreviews]);
            setSliderFiles([...sliderFiles, ...files]);
          }
        };
        reader.readAsDataURL(file);
        newFiles.push(file);
      });
    }
  };

  const removeSliderImage = (index: number) => {
    const newPreviews = sliderPreviews.filter((_, i) => i !== index);
    const newFiles = sliderFiles.filter((_, i) => i !== index);
    const newExisting = existingSliders.filter((_, i) => i !== index);
    
    setSliderPreviews(newPreviews);
    setSliderFiles(newFiles);
    setExistingSliders(newExisting);
  };

  const moveSliderImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliderPreviews.length) return;

    const newPreviews = [...sliderPreviews];
    const newFiles = [...sliderFiles];
    const newExisting = [...existingSliders];

    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    if (newFiles.length > 0) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    }
    if (newExisting.length > 0) {
      [newExisting[index], newExisting[newIndex]] = [newExisting[newIndex], newExisting[index]];
    }

    setSliderPreviews(newPreviews);
    setSliderFiles(newFiles);
    setExistingSliders(newExisting);
  };

  const onSubmit = async (data: any) => {
    try {
      console.log('Form data before processing:', data);
      
      // Prepare clean data with proper types and ensure all required fields exist
      const cleanData: any = {
        ...data,
        // Ensure required object fields always exist (Laravel expects these as arrays/objects)
        social_links: data.social_links || {},
        business_hours: data.business_hours || {},
        additional_settings: data.additional_settings || {},
      };
      
      // Convert boolean fields - ensure they're actual booleans
      const booleanFields = ['store_enabled', 'tax_inclusive', 'email_notifications', 'sms_notifications'];
      booleanFields.forEach(field => {
        if (field in cleanData) {
          cleanData[field] = Boolean(cleanData[field]);
        }
      });
      
      console.log('Clean data after processing:', cleanData);
      
      // Check if we have files to upload
      const hasFiles = headerLogoFile || footerLogoFile || faviconFile || sliderFiles.length > 0;
      
      if (hasFiles) {
        const formData = new FormData();

        // Helper to append nested objects/arrays using bracket notation for Laravel
        const append = (fd: FormData, key: string, val: any) => {
          if (val === null || val === undefined) return;
          if (val instanceof File || val instanceof Blob) {
            fd.append(key, val as Blob);
          } else if (Array.isArray(val)) {
            // Append array items with []/index notation
            val.forEach((item, index) => {
              append(fd, `${key}[${index}]`, item);
            });
          } else if (typeof val === 'object') {
            Object.keys(val).forEach((childKey) => {
              append(fd, `${key}[${childKey}]`, val[childKey]);
            });
          } else if (typeof val === 'boolean') {
            fd.append(key, val ? '1' : '0');
          } else {
            fd.append(key, String(val));
          }
        };

        // Append all fields; skip string logo fields if files are selected to avoid duplicates
        Object.keys(cleanData).forEach((key) => {
          if ((key === 'header_logo' && headerLogoFile) || 
              (key === 'footer_logo' && footerLogoFile) || 
              (key === 'favicon' && faviconFile) ||
              (key === 'slider_images' && sliderFiles.length > 0)) {
            return;
          }
          append(formData, key, cleanData[key]);
        });

        // Append files
        if (headerLogoFile) formData.append('header_logo', headerLogoFile);
        if (footerLogoFile) formData.append('footer_logo', footerLogoFile);
        if (faviconFile) formData.append('favicon', faviconFile);

        // Handle slider images
        if (sliderFiles.length > 0) {
          sliderFiles.forEach((file) => {
            formData.append('slider_images[]', file);
          });
        } else if (existingSliders.length > 0) {
          // Send existing slider paths to maintain order
          existingSliders.forEach((path) => {
            const extractedPath = path.replace(/^.*\/storage\//, '');
            formData.append('slider_images[]', extractedPath);
          });
        }

        console.log('FormData entries:', Array.from(formData.entries()));

        await updateSettings(formData).unwrap();
      } else {
        // Use JSON for regular updates
        console.log('Sending JSON payload:', cleanData);
        await updateSettings(cleanData).unwrap();
      }
      
      toast.success('Settings updated successfully');
      
      // Reset file states
      setHeaderLogoFile(null);
      setFooterLogoFile(null);
      setFaviconFile(null);
      setSliderFiles([]);
      
      // Refetch to update existing sliders
      if (settingsData?.data) {
        setExistingSliders(settingsData.data.slider_images || []);
        setSliderPreviews(settingsData.data.slider_images || []);
      }
    } catch (error: any) {
      console.error('Settings update error:', error);
      console.error('Error details:', error?.data);
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="ecommerce">Ecommerce</TabsTrigger>
          <TabsTrigger value="business">Business Hours</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
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
                  <RichTextEditor
                    value={watch('description') || ''}
                    onChange={(value) => setValue('description', value)}
                    placeholder="Enter store description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input id="business_name" {...register('business_name')} placeholder="My Business LLC" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_registration_number">Registration Number</Label>
                    <Input id="business_registration_number" {...register('business_registration_number')} placeholder="REG123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">Tax Number</Label>
                    <Input id="tax_number" {...register('tax_number')} placeholder="TAX987654321" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="store_enabled" 
                    checked={watch('store_enabled')}
                    onCheckedChange={(checked) => setValue('store_enabled', checked)}
                  />
                  <Label htmlFor="store_enabled">Store Enabled</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_mode">Store Mode</Label>
                  <Select value={watch('store_mode')} onValueChange={(value) => setValue('store_mode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {watch('store_mode') === 'maintenance' && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea id="maintenance_message" {...register('maintenance_message')} rows={3} placeholder="We are currently performing maintenance..." />
                  </div>
                )}
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Logos</CardTitle>
              <CardDescription>Upload your logos and favicon</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="header_logo">Header Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="header_logo"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={(e) => handleFileChange(e, 'header')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('header_logo')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Header Logo
                    </Button>
                    {headerLogoPreview && (
                      <div className="relative">
                        <img src={headerLogoPreview} alt="Header logo" className="h-16 w-auto object-contain border rounded" />
                        {headerLogoFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeFile('header')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Max size: 2MB. Formats: JPEG, PNG, JPG, GIF, SVG</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_logo">Footer Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="footer_logo"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={(e) => handleFileChange(e, 'footer')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('footer_logo')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Footer Logo
                    </Button>
                    {footerLogoPreview && (
                      <div className="relative">
                        <img src={footerLogoPreview} alt="Footer logo" className="h-16 w-auto object-contain border rounded" />
                        {footerLogoFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeFile('footer')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Max size: 2MB. Formats: JPEG, PNG, JPG, GIF, SVG</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="favicon"
                      type="file"
                      accept="image/x-icon,image/png"
                      onChange={(e) => handleFileChange(e, 'favicon')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('favicon')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Favicon
                    </Button>
                    {faviconPreview && (
                      <div className="relative">
                        <img src={faviconPreview} alt="Favicon" className="h-8 w-8 object-contain border rounded" />
                        {faviconFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeFile('favicon')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Max size: 1MB. Formats: ICO, PNG</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slider_images">Slider Images</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        id="slider_images"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                        onChange={handleSliderFilesChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('slider_images')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Add Slider Images
                      </Button>
                    </div>
                    {sliderPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sliderPreviews.map((preview, index) => (
                          <div key={index} className="relative group border rounded-lg p-2">
                            <img 
                              src={preview} 
                              alt={`Slider ${index + 1}`} 
                              className="w-full h-32 object-cover rounded" 
                            />
                            <div className="absolute top-4 right-4 flex gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => moveSliderImage(index, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => moveSliderImage(index, 'down')}
                                disabled={index === sliderPreviews.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeSliderImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-center mt-2 text-muted-foreground">
                              Image {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload multiple images for homepage slider. Max size: 2MB per image. Formats: JPEG, PNG, JPG, GIF, SVG
                  </p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="contact@mystore.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input id="support_email" type="email" {...register('support_email')} placeholder="support@mystore.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Phone</Label>
                  <Input id="contact_number" {...register('contact_number')} placeholder="+1-234-567-8900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" {...register('address')} rows={3} placeholder="123 Business Street, City, State" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification_email">Notification Email</Label>
                  <Input id="notification_email" type="email" {...register('notification_email')} placeholder="notifications@mystore.com" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="email_notifications" 
                      checked={watch('email_notifications')}
                      onCheckedChange={(checked) => setValue('email_notifications', checked)}
                    />
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sms_notifications" 
                      checked={watch('sms_notifications')}
                      onCheckedChange={(checked) => setValue('sms_notifications', checked)}
                    />
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                  </div>
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ecommerce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ecommerce Settings</CardTitle>
              <CardDescription>Configure your store's ecommerce options</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency Code</Label>
                    <Input id="currency" {...register('currency')} placeholder="USD" maxLength={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency_symbol">Symbol</Label>
                    <Input id="currency_symbol" {...register('currency_symbol')} placeholder="$" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency_position">Position</Label>
                    <Select value={watch('currency_position')} onValueChange={(value) => setValue('currency_position', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before ($100)</SelectItem>
                        <SelectItem value="after">After (100$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_cost">Default Shipping Cost</Label>
                    <Input id="shipping_cost" type="number" step="0.01" {...register('shipping_cost')} placeholder="9.99" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                    <Input id="free_shipping_threshold" type="number" step="0.01" {...register('free_shipping_threshold')} placeholder="50.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input id="tax_rate" type="number" step="0.01" {...register('tax_rate')} placeholder="8.25" />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch 
                      id="tax_inclusive" 
                      checked={watch('tax_inclusive')}
                      onCheckedChange={(checked) => setValue('tax_inclusive', checked)}
                    />
                    <Label htmlFor="tax_inclusive">Tax Inclusive Prices</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_methods">Payment Methods (comma-separated)</Label>
                  <Input 
                    id="payment_methods" 
                    {...register('payment_methods')} 
                    placeholder="credit_card, paypal, stripe, bank_transfer" 
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('payment_methods', values);
                    }}
                    defaultValue={watch('payment_methods')?.join(', ') || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping_methods">Shipping Methods (comma-separated)</Label>
                  <Input 
                    id="shipping_methods" 
                    {...register('shipping_methods')} 
                    placeholder="standard, express, overnight, pickup" 
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('shipping_methods', values);
                    }}
                    defaultValue={watch('shipping_methods')?.join(', ') || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accepted_countries">Accepted Countries (comma-separated codes)</Label>
                  <Input 
                    id="accepted_countries" 
                    {...register('accepted_countries')} 
                    placeholder="US, CA, GB, AU, DE, FR" 
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('accepted_countries', values);
                    }}
                    defaultValue={watch('accepted_countries')?.join(', ') || ''}
                  />
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your business operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-32">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={!watch(`business_hours.${day}.closed`)}
                        onCheckedChange={(checked) => setValue(`business_hours.${day}.closed`, !checked)}
                      />
                      <Label>Open</Label>
                    </div>
                    {!watch(`business_hours.${day}.closed`) && (
                      <>
                        <Input 
                          type="time" 
                          {...register(`business_hours.${day}.open`)} 
                          className="w-32"
                        />
                        <span>to</span>
                        <Input 
                          type="time" 
                          {...register(`business_hours.${day}.close`)} 
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
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
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="social_links.tiktok">TikTok</Label>
                    <Input id="social_links.tiktok" {...register('social_links.tiktok')} placeholder="https://tiktok.com/@yourhandle" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_links.whatsapp">WhatsApp Number</Label>
                  <Input id="social_links.whatsapp" {...register('social_links.whatsapp')} placeholder="+1234567890" />
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
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>Optimize your store for search engines and track analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input id="meta_title" {...register('meta_title')} placeholder="Store Name - Best Products Online" maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea id="meta_description" {...register('meta_description')} rows={3} placeholder="Shop the best products with great deals..." maxLength={500} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input id="meta_keywords" {...register('meta_keywords')} placeholder="ecommerce, online shopping, products" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input id="google_analytics_id" {...register('google_analytics_id')} placeholder="GA-XXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                    <Input id="facebook_pixel_id" {...register('facebook_pixel_id')} placeholder="123456789012345" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_scripts">Custom Scripts (HTML/JavaScript)</Label>
                  <Textarea id="custom_scripts" {...register('custom_scripts')} rows={5} placeholder="<script>...</script>" className="font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">Add custom tracking scripts or HTML snippets</p>
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Policies</CardTitle>
              <CardDescription>Manage your legal policies and terms</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms_of_service">Terms of Service</Label>
                  <RichTextEditor
                    value={watch('terms_of_service') || ''}
                    onChange={(value) => setValue('terms_of_service', value)}
                    placeholder="Enter terms of service..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy_policy">Privacy Policy</Label>
                  <RichTextEditor
                    value={watch('privacy_policy') || ''}
                    onChange={(value) => setValue('privacy_policy', value)}
                    placeholder="Enter privacy policy..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return_policy">Return Policy</Label>
                  <RichTextEditor
                    value={watch('return_policy') || ''}
                    onChange={(value) => setValue('return_policy', value)}
                    placeholder="Enter return policy..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_policy">Shipping Policy</Label>
                  <RichTextEditor
                    value={watch('shipping_policy') || ''}
                    onChange={(value) => setValue('shipping_policy', value)}
                    placeholder="Enter shipping policy..."
                  />
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
