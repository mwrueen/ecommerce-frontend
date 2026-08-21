import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Globe, Code, Loader2, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function SeoSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit } = useForm({
        defaultValues: {
            meta_title: settings.meta_title || '',
            meta_description: settings.meta_description || '',
            meta_keywords: settings.meta_keywords || '',
            google_analytics_id: settings.google_analytics_id || '',
            facebook_pixel_id: settings.facebook_pixel_id || '',
            custom_scripts: settings.custom_scripts || '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('SEO & Analytics updated');
        } catch (error: any) {
            const msg = error?.data?.message || (error?.data?.errors ? Object.values(error.data.errors).flat().join(', ') : 'Failed to update SEO settings');
            toast.error(msg);
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-xl text-orange-600">
                        <Search className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">SEO & Marketing</CardTitle>
                        <CardDescription>Optimize how your store appears in search engines and track performance</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Meta Tags */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Globe className="h-5 w-5 text-orange-500" />
                                Meta Tags
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">SEO Title</Label>
                                    <Input {...register('meta_title')} placeholder="Primary keyword - Store Name" className="h-11 rounded-xl" />
                                    <p className="text-[10px] text-muted-foreground">Optimal length: 50-60 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Meta Description</Label>
                                    <Textarea {...register('meta_description')} rows={4} placeholder="Summarize your store for search engine results..." className="rounded-xl" />
                                    <p className="text-[10px] text-muted-foreground">Optimal length: 150-160 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Keywords</Label>
                                    <Input {...register('meta_keywords')} placeholder="shop, ecommerce, electronics, gadgets" className="h-11 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Tracking & Scripts */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-orange-500" />
                                Analytics & Tracking
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Google Analytics ID</Label>
                                    <Input {...register('google_analytics_id')} placeholder="G-XXXXXXXXXX" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Facebook Pixel ID</Label>
                                    <Input {...register('facebook_pixel_id')} placeholder="123456789012345" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Code className="h-4 w-4" />
                                        Custom Scripts
                                    </Label>
                                    <Textarea
                                        {...register('custom_scripts')}
                                        rows={6}
                                        placeholder="<!-- Custom JS or tracking codes for <head> -->"
                                        className="rounded-xl font-mono text-xs bg-slate-900 text-slate-100 p-4"
                                    />
                                    <p className="text-[10px] text-orange-600 font-medium">Warning: These scripts will be injected into all pages. Be careful!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-10 h-12 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Update SEO Settings'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
