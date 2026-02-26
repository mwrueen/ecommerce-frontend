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
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation, useRemoveSliderItemsMutation } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';

// Fields sent per tab to keep payloads small
const TAB_FIELDS: Record<string, string[]> = {
  general: ['title', 'tagline', 'description', 'business_name', 'business_registration_number', 'tax_number', 'store_enabled', 'store_mode', 'maintenance_message'],
  branding: ['header_logo', 'footer_logo', 'favicon', 'slider_images'],
  contact: ['email', 'support_email', 'contact_number', 'address', 'notification_email', 'email_notifications', 'sms_notifications'],
  ecommerce: ['currency', 'currency_symbol', 'currency_position', 'shipping_cost', 'free_shipping_threshold', 'tax_rate', 'tax_inclusive', 'payment_methods', 'shipping_methods', 'accepted_countries'],
  business: ['business_hours'],
  social: ['social_links'],
  seo: ['meta_title', 'meta_description', 'meta_keywords', 'google_analytics_id', 'facebook_pixel_id', 'custom_scripts'],
  legal: ['terms_of_service', 'privacy_policy', 'return_policy', 'shipping_policy'],
};

function pick(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  });
  return out;
}

export default function Settings() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const [removeSliderItems] = useRemoveSliderItemsMutation();
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm({
    defaultValues: {
      store_enabled: false,
      store_mode: 'live',
      email_notifications: false,
      sms_notifications: false,
      currency_position: 'before',
      tax_inclusive: false,
      payment_methods: [],
      shipping_methods: [],
      accepted_countries: [],
      business_hours: {
        monday: { closed: false, open: '09:00', close: '17:00' },
        tuesday: { closed: false, open: '09:00', close: '17:00' },
        wednesday: { closed: false, open: '09:00', close: '17:00' },
        thursday: { closed: false, open: '09:00', close: '17:00' },
        friday: { closed: false, open: '09:00', close: '17:00' },
        saturday: { closed: false, open: '09:00', close: '17:00' },
        sunday: { closed: false, open: '09:00', close: '17:00' },
      },
    },
  });
  
  const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [headerLogoPreview, setHeaderLogoPreview] = useState<string>('');
  const [footerLogoPreview, setFooterLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);
  const [sliderPreviews, setSliderPreviews] = useState<Array<{image: string, title: string, subtitle: string, hyperlink: string}>>([]);
  const [existingSliders, setExistingSliders] = useState<Array<{image: string, title: string, subtitle: string, hyperlink: string}>>([]);

  useEffect(() => {
    if (settingsData?.data) {
      // Merge with defaults to ensure all fields are controlled
      const mergedData = {
        store_enabled: settingsData.data.store_enabled ?? false,
        store_mode: settingsData.data.store_mode || 'live',
        email_notifications: settingsData.data.email_notifications ?? false,
        sms_notifications: settingsData.data.sms_notifications ?? false,
        currency_position: settingsData.data.currency_position || 'before',
        tax_inclusive: settingsData.data.tax_inclusive ?? false,
        payment_methods: Array.isArray(settingsData.data.payment_methods) 
          ? settingsData.data.payment_methods 
          : [],
        shipping_methods: Array.isArray(settingsData.data.shipping_methods) 
          ? settingsData.data.shipping_methods 
          : [],
        accepted_countries: Array.isArray(settingsData.data.accepted_countries) 
          ? settingsData.data.accepted_countries 
          : [],
        business_hours: settingsData.data.business_hours || {
          monday: { closed: false, open: '09:00', close: '17:00' },
          tuesday: { closed: false, open: '09:00', close: '17:00' },
          wednesday: { closed: false, open: '09:00', close: '17:00' },
          thursday: { closed: false, open: '09:00', close: '17:00' },
          friday: { closed: false, open: '09:00', close: '17:00' },
          saturday: { closed: false, open: '09:00', close: '17:00' },
          sunday: { closed: false, open: '09:00', close: '17:00' },
        },
        ...settingsData.data,
      };
      
      reset(mergedData);
      setHeaderLogoPreview(settingsData.data.header_logo || '');
      setFooterLogoPreview(settingsData.data.footer_logo || '');
      setFaviconPreview(settingsData.data.favicon || '');
      
      // Handle slider images - can be array of strings or array of objects
      const sliders = settingsData.data.slider_images || [];
      const formattedSliders = sliders.map((slider: any) => {
        if (typeof slider === 'string') {
          return { image: slider, title: '', subtitle: '', hyperlink: '' };
        }
        return {
          image: slider.image || '',
          title: slider.title || '',
          subtitle: slider.subtitle || '',
          hyperlink: slider.hyperlink || ''
        };
      });
      
      setExistingSliders(formattedSliders);
      setSliderPreviews(formattedSliders);
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
      const newPreviews: Array<{image: string, title: string, subtitle: string, hyperlink: string}> = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            image: reader.result as string,
            title: '',
            subtitle: '',
            hyperlink: ''
          });
          if (newPreviews.length === files.length) {
            setSliderPreviews([...sliderPreviews, ...newPreviews]);
            setSliderFiles([...sliderFiles, ...files]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeSliderImage = async (index: number) => {
    // If it's an existing slider (from server), use the remove API
    if (index < existingSliders.length) {
      try {
        await removeSliderItems({ slider_indices: [index] }).unwrap();
        toast.success('Slider image removed successfully');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to remove slider image');
        return;
      }
    } else {
      // If it's a new file (not yet uploaded), just remove from local state
      const newPreviews = sliderPreviews.filter((_, i) => i !== index);
      const newFiles = sliderFiles.filter((_, i) => i !== index - existingSliders.length);
      
      setSliderPreviews(newPreviews);
      setSliderFiles(newFiles);
    }
  };

  const moveSliderImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sliderPreviews.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newPreviews = [...sliderPreviews];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    
    setSliderPreviews(newPreviews);
    
    // Update files and existing accordingly
    if (index < existingSliders.length && newIndex < existingSliders.length) {
      const newExisting = [...existingSliders];
      [newExisting[index], newExisting[newIndex]] = [newExisting[newIndex], newExisting[index]];
      setExistingSliders(newExisting);
    } else if (index >= existingSliders.length && newIndex >= existingSliders.length) {
      const fileIndex = index - existingSliders.length;
      const fileNewIndex = newIndex - existingSliders.length;
      const newFiles = [...sliderFiles];
      [newFiles[fileIndex], newFiles[fileNewIndex]] = [newFiles[fileNewIndex], newFiles[fileIndex]];
      setSliderFiles(newFiles);
    }
  };

  const updateSliderField = (index: number, field: 'title' | 'subtitle' | 'hyperlink', value: string) => {
    const newPreviews = [...sliderPreviews];
    newPreviews[index] = { ...newPreviews[index], [field]: value };
    setSliderPreviews(newPreviews);
    
    if (index < existingSliders.length) {
      const newExisting = [...existingSliders];
      newExisting[index] = { ...newExisting[index], [field]: value };
      setExistingSliders(newExisting);
    }
  };

  const appendToFormData = (fd: FormData, key: string, val: unknown) => {
    if (val === null || val === undefined) return;
    if (val instanceof File || val instanceof Blob) {
      fd.append(key, val as Blob);
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        appendToFormData(fd, `${key}[${index}]`, item);
      });
    } else if (typeof val === 'object') {
      Object.keys(val as object).forEach((childKey) => {
        appendToFormData(fd, `${key}[${childKey}]`, (val as Record<string, unknown>)[childKey]);
      });
    } else if (typeof val === 'boolean') {
      fd.append(key, val ? '1' : '0');
    } else {
      fd.append(key, String(val));
    }
  };

  const submitTab = async (tab: string) => {
    try {
      const allValues = getValues() as Record<string, unknown>;
      const keys = TAB_FIELDS[tab];
      if (!keys?.length) return;
      const data = pick(allValues, keys) as Record<string, unknown>;

      const booleanFields = ['store_enabled', 'tax_inclusive', 'email_notifications', 'sms_notifications'];
      booleanFields.forEach((field) => {
        if (field in data) data[field] = Boolean(data[field]);
      });
      if ('social_links' in data && data.social_links == null) data.social_links = {};
      if ('business_hours' in data && data.business_hours == null) data.business_hours = {};

      const hasFiles = headerLogoFile || footerLogoFile || faviconFile || sliderFiles.length > 0;

      if (tab === 'branding' && hasFiles) {
        const formData = new FormData();
        // Do not send logo/slider as URL strings — only send new files and slider JSON
        const skipKeys = ['header_logo', 'footer_logo', 'favicon', 'slider_images'];
        Object.keys(data).forEach((key) => {
          if (skipKeys.includes(key)) return;
          appendToFormData(formData, key, data[key]);
        });
        if (headerLogoFile) formData.append('header_logo', headerLogoFile);
        if (footerLogoFile) formData.append('footer_logo', footerLogoFile);
        if (faviconFile) formData.append('favicon', faviconFile);
        if (sliderFiles.length > 0) {
          sliderFiles.forEach((file, index) => {
            formData.append('slider_images[]', file);
            const sliderIndex = existingSliders.length + index;
            formData.append('slider_titles[]', sliderPreviews[sliderIndex]?.title || '');
            formData.append('slider_subtitles[]', sliderPreviews[sliderIndex]?.subtitle || '');
            formData.append('slider_hyperlinks[]', sliderPreviews[sliderIndex]?.hyperlink || '');
          });
        } else if (existingSliders.length > 0) {
          const sliderData = existingSliders.map((slider) => ({
            image: slider.image.includes('/storage/') ? slider.image.split('/storage/')[1] : slider.image,
            title: slider.title || '',
            subtitle: slider.subtitle || '',
            hyperlink: slider.hyperlink || '',
          }));
          formData.append('slider_images', JSON.stringify(sliderData));
        } else {
          formData.append('slider_images', JSON.stringify([]));
        }
        const result = await updateSettings(formData).unwrap();
        setHeaderLogoFile(null);
        setFooterLogoFile(null);
        setFaviconFile(null);
        setSliderFiles([]);
        if (result?.data) {
          if (result.data.header_logo) setHeaderLogoPreview(result.data.header_logo);
          if (result.data.footer_logo) setFooterLogoPreview(result.data.footer_logo);
          if (result.data.favicon) setFaviconPreview(result.data.favicon);
          if (Array.isArray(result.data.slider_images) && result.data.slider_images.length > 0) {
            const formatted = result.data.slider_images.map((s: { image: string; title?: string; subtitle?: string; hyperlink?: string }) => ({
              image: s.image ?? '',
              title: s.title ?? '',
              subtitle: s.subtitle ?? '',
              hyperlink: s.hyperlink ?? '',
            }));
            setExistingSliders(formatted);
            setSliderPreviews(formatted);
          }
        }
      } else if (tab === 'branding') {
        const sliderData = existingSliders.map((slider) => ({
          image: slider.image.includes('/storage/') ? slider.image.split('/storage/')[1] : slider.image,
          title: slider.title || '',
          subtitle: slider.subtitle || '',
          hyperlink: slider.hyperlink || '',
        }));
        await updateSettings({ ...data, slider_images: sliderData }).unwrap();
      } else {
        await updateSettings(data).unwrap();
      }

      toast.success('Settings updated successfully');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to update settings');
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
              <form onSubmit={handleSubmit(() => submitTab('general'))} className="space-y-4">
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
                    checked={!!watch('store_enabled')}
                    onCheckedChange={(checked) => setValue('store_enabled', checked)}
                  />
                  <Label htmlFor="store_enabled">Store Enabled</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_mode">Store Mode</Label>
                  <Select value={watch('store_mode') || 'live'} onValueChange={(value) => setValue('store_mode', value)}>
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
              <form onSubmit={handleSubmit(() => submitTab('branding'))} className="space-y-6">
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
                      <div className="space-y-4">
                        {sliderPreviews.map((preview, index) => (
                          <Card key={index} className="relative group">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={preview.image}
                                    alt={`Slider ${index + 1}`}
                                    className="w-32 h-32 object-cover rounded-lg border"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => moveSliderImage(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => moveSliderImage(index, 'down')}
                                      disabled={index === sliderPreviews.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <Label htmlFor={`slider-title-${index}`} className="text-sm">Title (optional)</Label>
                                    <Input
                                      id={`slider-title-${index}`}
                                      value={preview.title}
                                      onChange={(e) => updateSliderField(index, 'title', e.target.value)}
                                      placeholder="Enter slider title"
                                      maxLength={255}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`slider-subtitle-${index}`} className="text-sm">Subtitle (optional)</Label>
                                    <Textarea
                                      id={`slider-subtitle-${index}`}
                                      value={preview.subtitle}
                                      onChange={(e) => updateSliderField(index, 'subtitle', e.target.value)}
                                      placeholder="Enter slider subtitle"
                                      maxLength={500}
                                      rows={2}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`slider-hyperlink-${index}`} className="text-sm">Link (optional)</Label>
                                    <Input
                                      id={`slider-hyperlink-${index}`}
                                      value={preview.hyperlink}
                                      onChange={(e) => updateSliderField(index, 'hyperlink', e.target.value)}
                                      placeholder="https://example.com"
                                      maxLength={500}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex-shrink-0">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeSliderImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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
              <form onSubmit={handleSubmit(() => submitTab('contact'))} className="space-y-4">
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
                      checked={!!watch('email_notifications')}
                      onCheckedChange={(checked) => setValue('email_notifications', checked)}
                    />
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sms_notifications" 
                      checked={!!watch('sms_notifications')}
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
              <form onSubmit={handleSubmit(() => submitTab('ecommerce'))} className="space-y-4">
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
                    <Select value={watch('currency_position') || 'before'} onValueChange={(value) => setValue('currency_position', value)}>
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
                      checked={!!watch('tax_inclusive')}
                      onCheckedChange={(checked) => setValue('tax_inclusive', checked)}
                    />
                    <Label htmlFor="tax_inclusive">Tax Inclusive Prices</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_methods">Payment Methods (comma-separated)</Label>
                  <Input 
                    id="payment_methods" 
                    placeholder="credit_card, paypal, stripe, bank_transfer" 
                    value={Array.isArray(watch('payment_methods')) 
                      ? watch('payment_methods').join(', ') 
                      : (typeof watch('payment_methods') === 'string' 
                        ? watch('payment_methods') 
                        : '')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('payment_methods', values);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping_methods">Shipping Methods (comma-separated)</Label>
                  <Input 
                    id="shipping_methods" 
                    placeholder="standard, express, overnight, pickup" 
                    value={Array.isArray(watch('shipping_methods')) 
                      ? watch('shipping_methods').join(', ') 
                      : (typeof watch('shipping_methods') === 'string' 
                        ? watch('shipping_methods') 
                        : '')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('shipping_methods', values);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accepted_countries">Accepted Countries (comma-separated codes)</Label>
                  <Input 
                    id="accepted_countries" 
                    placeholder="US, CA, GB, AU, DE, FR" 
                    value={Array.isArray(watch('accepted_countries')) 
                      ? watch('accepted_countries').join(', ') 
                      : (typeof watch('accepted_countries') === 'string' 
                        ? watch('accepted_countries') 
                        : '')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setValue('accepted_countries', values);
                    }}
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
              <form onSubmit={handleSubmit(() => submitTab('business'))} className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-32">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={!watch(`business_hours.${day}.closed`) ?? false}
                        onCheckedChange={(checked) => setValue(`business_hours.${day}.closed`, !checked)}
                      />
                      <Label>Open</Label>
                    </div>
                    {!(watch(`business_hours.${day}.closed`) ?? false) && (
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
              <form onSubmit={handleSubmit(() => submitTab('social'))} className="space-y-4">
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
              <form onSubmit={handleSubmit(() => submitTab('seo'))} className="space-y-4">
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
              <form onSubmit={handleSubmit(() => submitTab('legal'))} className="space-y-4">
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
