import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sliders, Sparkles, ShoppingBag, Shield, Star, Truck, Eye, Upload, X, Palette, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';
import { getStorageUrl } from '@/lib/utils';

// Premium background gradient presets
const BG_COLOR_PRESETS = [
  { name: 'Indigo Glow', value: 'linear-gradient(to bottom, rgb(99 102 241 / 0.08), rgb(99 102 241 / 0.03), transparent)' },
  { name: 'Royal Violet', value: 'linear-gradient(to bottom, rgb(139 92 246 / 0.1), rgb(139 92 246 / 0.03), transparent)' },
  { name: 'Emerald Sparkle', value: 'linear-gradient(to bottom, rgb(16 185 129 / 0.08), rgb(16 185 129 / 0.02), transparent)' },
  { name: 'Amber Sun', value: 'linear-gradient(to bottom, rgb(245 158 11 / 0.08), rgb(245 158 11 / 0.02), transparent)' },
  { name: 'Midnight Deep', value: 'linear-gradient(to bottom, rgb(30 41 59 / 0.95), rgb(15 23 42 / 0.98), rgb(2 6 23 / 1))' },
  { name: 'Slate Minimal', value: 'linear-gradient(to bottom, rgb(100 116 139 / 0.05), rgb(100 116 139 / 0.01), transparent)' },
];

export default function HeroSettings({ settings }: { settings: any }) {
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const additional = settings.additional_settings || {};
  const mockupData = additional.hero_mockup || {};

  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string>(additional.hero_bg_image || '');
  const [removeBgImage, setRemoveBgImage] = useState<boolean>(false);

  // Sync preview when settings are refreshed from the server after save
  useEffect(() => {
    if (!bgImageFile) {
      setBgImagePreview(additional.hero_bg_image || '');
    }
  }, [additional.hero_bg_image]);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      hero_title: additional.hero_title || settings.title || 'Welcome to Our Store',
      hero_tagline: additional.hero_tagline || settings.tagline || 'Premium Quality Redefined',
      hero_description: additional.hero_description || settings.description || 'Discover a new standard of shopping.',
      hero_bg_type: additional.hero_bg_type || 'color',
      hero_bg_color: additional.hero_bg_color || 'linear-gradient(to bottom, rgb(99 102 241 / 0.08), rgb(99 102 241 / 0.03), transparent)',
      mockup_badge: mockupData.badge || 'Hot Release',
      mockup_product_name: mockupData.product_name || 'VibePro Wireless ANC Headphones',
      mockup_product_description: mockupData.product_description || 'Experience audio purity with our flagship adaptive noise cancelling technology.',
      mockup_price: mockupData.price || '299.00',
      mockup_discount: mockupData.discount || 'Save 25%',
      mockup_rating: mockupData.rating || '4.9',
      mockup_happy_users: mockupData.happy_users || '10K+',
      mockup_link: mockupData.link || '/products',
    },
  });

  // Watch fields for live preview
  const watchedTitle = watch('hero_title');
  const watchedTagline = watch('hero_tagline');
  const watchedDescription = watch('hero_description');
  const watchedBgType = watch('hero_bg_type');
  const watchedBgColor = watch('hero_bg_color');
  const watchedBadge = watch('mockup_badge');
  const watchedProdName = watch('mockup_product_name');
  const watchedProdDesc = watch('mockup_product_description');
  const watchedPrice = watch('mockup_price');
  const watchedDiscount = watch('mockup_discount');
  const watchedRating = watch('mockup_rating');
  const watchedHappyUsers = watch('mockup_happy_users');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImageFile(file);
        setBgImagePreview(reader.result as string);
        setRemoveBgImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setBgImageFile(null);
    setBgImagePreview('');
    setRemoveBgImage(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      
      if (bgImageFile) {
        formData.append('hero_bg_image', bgImageFile);
      } else if (removeBgImage) {
        formData.append('remove_hero_bg_image', 'true');
      }

      const updatedAdditional = {
        ...additional,
        hero_title: data.hero_title,
        hero_tagline: data.hero_tagline,
        hero_description: data.hero_description,
        hero_bg_type: data.hero_bg_type,
        hero_bg_color: data.hero_bg_color,
        hero_mockup: {
          badge: data.mockup_badge,
          product_name: data.mockup_product_name,
          product_description: data.mockup_product_description,
          price: data.mockup_price,
          discount: data.mockup_discount,
          rating: data.mockup_rating,
          happy_users: data.mockup_happy_users,
          link: data.mockup_link,
        },
      };

      formData.append('additional_settings', JSON.stringify(updatedAdditional));

      await updateSettings(formData).unwrap();
      setBgImageFile(null);
      toast.success('Hero section and background settings updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update settings');
    }
  };

  // Determine current preview background styling
  const previewBgStyle = watchedBgType === 'image' && bgImagePreview
    ? { backgroundImage: `url(${bgImagePreview.startsWith('data:') ? bgImagePreview : getStorageUrl(bgImagePreview)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: watchedBgColor };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* Configuration Form */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl text-primary">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Hero Section Settings</CardTitle>
              <CardDescription>Customize the fallback text hero copy, background styling, and interactive mockup showcase</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Copy Customization */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Hero Text Copy
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="hero_title" className="text-sm font-semibold text-slate-700">Hero Main Title</Label>
                <Input
                  id="hero_title"
                  {...register('hero_title')}
                  placeholder="e.g. Welcome to Our Store"
                  className="rounded-xl border-slate-200 focus:ring-primary/20 transition-all h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_tagline" className="text-sm font-semibold text-slate-700">Hero Tagline / Badge Text</Label>
                <Input
                  id="hero_tagline"
                  {...register('hero_tagline')}
                  placeholder="e.g. Premium Quality Redefined"
                  className="rounded-xl border-slate-200 focus:ring-primary/20 transition-all h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_description" className="text-sm font-semibold text-slate-700">Hero Description</Label>
                <Textarea
                  id="hero_description"
                  {...register('hero_description')}
                  rows={3}
                  placeholder="Tell your customers about what makes your store unique..."
                  className="rounded-xl border-slate-200 focus:ring-primary/20 min-h-[80px]"
                />
              </div>
            </div>

            {/* Background Customization */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Palette className="h-4 w-4 text-indigo-600" />
                Hero Background Styling
              </h3>

              <div className="space-y-2">
                <Label htmlFor="hero_bg_type" className="text-sm font-semibold text-slate-700">Background Type</Label>
                <Select value={watchedBgType} onValueChange={(val) => setValue('hero_bg_type', val)}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Select background type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="color">Solid / Gradient Color</SelectItem>
                    <SelectItem value="image">Custom Background Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchedBgType === 'color' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Choose a Preset Gradient</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BG_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setValue('hero_bg_color', preset.value)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left relative overflow-hidden flex flex-col justify-between h-20 ${
                            watchedBgColor === preset.value
                              ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="absolute inset-0 opacity-40" style={{ background: preset.value }} />
                          <span className="relative z-10 text-slate-700 dark:text-slate-300">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero_bg_color" className="text-sm font-semibold text-slate-700">Custom CSS Color / Gradient</Label>
                    <Input
                      id="hero_bg_color"
                      {...register('hero_bg_color')}
                      placeholder="e.g. #ffffff or linear-gradient(...)"
                      className="rounded-xl border-slate-200 h-11 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Label className="text-sm font-semibold text-slate-700">Background Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-[2.5/1] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {bgImagePreview ? (
                        <>
                          <img
                            src={bgImagePreview.startsWith('data:') ? bgImagePreview : getStorageUrl(bgImagePreview)}
                            alt="Background Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 rounded-full"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <ImageIcon className="h-10 w-10 text-slate-300" />
                          <span className="text-xs font-semibold">Upload background image</span>
                        </div>
                      )}
                    </div>
                    
                    <input
                      id="hero_bg_image_input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl"
                      onClick={() => document.getElementById('hero_bg_image_input')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image File
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mockup Card Customization */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
                Right-side Mockup Product Card
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mockup_badge" className="text-sm font-semibold text-slate-700">Card Promo Badge</Label>
                  <Input
                    id="mockup_badge"
                    {...register('mockup_badge')}
                    placeholder="e.g. Hot Release"
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mockup_discount" className="text-sm font-semibold text-slate-700">Discount Badge</Label>
                  <Input
                    id="mockup_discount"
                    {...register('mockup_discount')}
                    placeholder="e.g. Save 25%"
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mockup_product_name" className="text-sm font-semibold text-slate-700">Featured Product Name</Label>
                <Input
                  id="mockup_product_name"
                  {...register('mockup_product_name')}
                  placeholder="Product name"
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mockup_product_description" className="text-sm font-semibold text-slate-700">Short Pitch / Description</Label>
                <Textarea
                  id="mockup_product_description"
                  {...register('mockup_product_description')}
                  rows={2}
                  placeholder="One sentence pitch..."
                  className="rounded-xl border-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mockup_price" className="text-sm font-semibold text-slate-700">Display Price</Label>
                  <Input
                    id="mockup_price"
                    {...register('mockup_price')}
                    placeholder="e.g. 299.00"
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mockup_rating" className="text-sm font-semibold text-slate-700">Rating Score</Label>
                  <Input
                    id="mockup_rating"
                    {...register('mockup_rating')}
                    placeholder="e.g. 4.9"
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mockup_happy_users" className="text-sm font-semibold text-slate-700">Happy Users</Label>
                  <Input
                    id="mockup_happy_users"
                    {...register('mockup_happy_users')}
                    placeholder="e.g. 10K+"
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mockup_link" className="text-sm font-semibold text-slate-700">Product CTA Link</Label>
                <Input
                  id="mockup_link"
                  {...register('mockup_link')}
                  placeholder="e.g. /products/vibepro-wireless"
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Hero Configuration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview Panel */}
      <div className="sticky top-24 space-y-4">
        <div className="flex items-center gap-2 text-slate-500 font-semibold px-1">
          <Eye className="h-4 w-4" />
          <span>Interactive Live Preview (Fallback Hero Section Mode)</span>
        </div>
        
        <Card
          className="border-none shadow-xl text-white overflow-hidden rounded-[32px] p-8 space-y-8 relative min-h-[500px] flex flex-col justify-between transition-all duration-500"
          style={previewBgStyle}
        >
          {/* Blur Overlay when background is an image to ensure contrast */}
          {watchedBgType === 'image' && bgImagePreview && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] -z-10" />
          )}

          {/* Tagline & Badge */}
          <div className="space-y-4 relative z-10">
            {watchedTagline && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-white font-medium text-xs backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{watchedTagline}</span>
              </div>
            )}
            
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white filter drop-shadow-sm">
              <span className="text-slate-900 dark:text-white">{watchedTitle || 'Welcome to Our Store'}</span>{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Redefined.
              </span>
            </h1>
            
            {watchedDescription && (
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-md font-medium filter drop-shadow-sm">
                {watchedDescription}
              </p>
            )}
          </div>

          {/* Device Mockup */}
          <div className="relative mx-auto w-full max-w-[320px] aspect-[4/5] rounded-[28px] bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent p-3 border border-white/10 shadow-2xl z-10">
            <div className="h-full w-full rounded-[22px] overflow-hidden bg-slate-950 text-white p-5 flex flex-col justify-between relative border border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <ShoppingBag className="h-36 w-36 text-white" />
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <Badge className="bg-white/10 text-white text-[10px] border-0 h-5">Live Platform</Badge>
              </div>

              <div className="my-auto space-y-4">
                <div className="space-y-1.5">
                  {watchedBadge && (
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 border-0 text-[10px] px-2 py-0">
                      {watchedBadge}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold leading-tight">{watchedProdName || 'Featured Product'}</h3>
                  {watchedProdDesc && <p className="text-xs text-slate-400 leading-normal">{watchedProdDesc}</p>}
                </div>
                
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Exclusive Launch Price</p>
                    <p className="text-lg font-black text-white">
                      {settings.currency_symbol || '$'}{watchedPrice || '299.00'}
                    </p>
                  </div>
                  {watchedDiscount && (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-semibold px-2 py-0">
                      {watchedDiscount}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="text-center bg-white/5 rounded-lg p-2 border border-white/5">
                  <p className="text-[9px] text-slate-400">Rating</p>
                  <p className="text-sm font-bold text-white flex items-center justify-center gap-0.5">
                    {watchedRating || '4.9'} <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  </p>
                </div>
                <div className="text-center bg-white/5 rounded-lg p-2 border border-white/5">
                  <p className="text-[9px] text-slate-400">Happy Users</p>
                  <p className="text-sm font-bold text-white">{watchedHappyUsers || '10K+'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
