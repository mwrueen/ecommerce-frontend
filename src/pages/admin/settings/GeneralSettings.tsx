import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Store, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function GeneralSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            title: settings.title || '',
            tagline: settings.tagline || '',
            description: settings.description || '',
            business_name: settings.business_name || '',
            business_registration_number: settings.business_registration_number || '',
            tax_number: settings.tax_number || '',
            store_enabled: !!settings.store_enabled,
            store_mode: settings.store_mode || 'live',
            maintenance_message: settings.maintenance_message || '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('General settings updated successfully');
        } catch (error: any) {
            const msg = error?.data?.message || (error?.data?.errors ? Object.values(error.data.errors).flat().join(', ') : 'Failed to update settings');
            toast.error(msg);
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl text-primary">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">General Settings</CardTitle>
                        <CardDescription>Configure your store's identity and operational mode</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Store Title</Label>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="e.g. Yellow Penguin Store"
                                    className="rounded-xl border-slate-200 focus:ring-primary/20 transition-all h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tagline" className="text-sm font-semibold text-slate-700">Tagline</Label>
                                <Input
                                    id="tagline"
                                    {...register('tagline')}
                                    placeholder="e.g. Quality you can trust"
                                    className="rounded-xl border-slate-200 focus:ring-primary/20 transition-all h-11"
                                />
                            </div>
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    Operational Mode
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="store_enabled" className="text-base font-medium">Store Enabled</Label>
                                        <p className="text-xs text-muted-foreground">Turn on/off all commerce functionality</p>
                                    </div>
                                    <Switch
                                        id="store_enabled"
                                        checked={watch('store_enabled')}
                                        onCheckedChange={(checked) => setValue('store_enabled', checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="store_mode" className="text-sm font-semibold text-slate-700">Store Status Mode</Label>
                                    <Select value={watch('store_mode')} onValueChange={(value) => setValue('store_mode', value)}>
                                        <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                            <SelectValue placeholder="Select store mode" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200">
                                            <SelectItem value="live">Live (Active)</SelectItem>
                                            <SelectItem value="maintenance">Maintenance Mode</SelectItem>
                                            <SelectItem value="coming_soon">Coming Soon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {watch('store_mode') === 'maintenance' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="maintenance_message" className="text-sm font-semibold text-slate-700">Maintenance Message</Label>
                                        <Textarea
                                            id="maintenance_message"
                                            {...register('maintenance_message')}
                                            rows={3}
                                            placeholder="We are currently performing maintenance..."
                                            className="rounded-xl border-slate-200 focus:ring-primary/20 min-h-[100px]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="business_name" className="text-sm font-semibold text-slate-700">Business Name</Label>
                                <Input
                                    id="business_name"
                                    {...register('business_name')}
                                    placeholder="Legal entity name"
                                    className="rounded-xl border-slate-200 h-11"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="business_registration_number" className="text-sm font-semibold text-slate-700">Registration Number</Label>
                                    <Input
                                        id="business_registration_number"
                                        {...register('business_registration_number')}
                                        placeholder="e.g. REG-12345678"
                                        className="rounded-xl border-slate-200 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_number" className="text-sm font-semibold text-slate-700">Tax / VAT ID</Label>
                                    <Input
                                        id="tax_number"
                                        {...register('tax_number')}
                                        placeholder="e.g. TAX-87654321"
                                        className="rounded-xl border-slate-200 h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Store About Description</Label>
                                <RichTextEditor
                                    value={watch('description') || ''}
                                    onChange={(value) => setValue('description', value)}
                                    placeholder="Tell your customers about your store..."
                                />
                            </div>
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
                                'Save General Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
