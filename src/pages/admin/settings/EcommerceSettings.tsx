import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Truck, Percent, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function EcommerceSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            currency: settings.currency || 'USD',
            currency_symbol: settings.currency_symbol || '$',
            currency_position: settings.currency_position || 'before',
            shipping_cost: settings.shipping_cost || 0,
            free_shipping_threshold: settings.free_shipping_threshold || 0,
            tax_rate: settings.tax_rate || 0,
            tax_inclusive: !!settings.tax_inclusive,
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('Ecommerce settings updated');
        } catch (error: any) {
            toast.error('Failed to update');
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-600">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Ecommerce & Finance</CardTitle>
                        <CardDescription>Set your currency, taxes, and shipping rules</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                Currency Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Currency Code</Label>
                                    <Input {...register('currency')} placeholder="USD" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Currency Symbol</Label>
                                    <Input {...register('currency_symbol')} placeholder="$" className="h-11 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Symbol Position</Label>
                                <Select value={watch('currency_position')} onValueChange={(val) => setValue('currency_position', val)}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="before">Before ($100)</SelectItem>
                                        <SelectItem value="after">After (100$)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Truck className="h-5 w-5 text-emerald-600" />
                                Shipping Rules
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Standard Shipping Cost</Label>
                                    <Input type="number" step="0.01" {...register('shipping_cost')} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Free Shipping Above</Label>
                                    <Input type="number" step="0.01" {...register('free_shipping_threshold')} className="h-11 rounded-xl" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                Set to 0 if standard shipping is free.
                            </p>
                        </div>

                        <div className="space-y-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 lg:col-span-2">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Percent className="h-5 w-5 text-emerald-600" />
                                Tax Calculations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Default Tax Rate (%)</Label>
                                    <Input type="number" step="0.01" {...register('tax_rate')} className="h-11 rounded-xl" placeholder="8.25" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label className="font-semibold">Prices include Tax</Label>
                                        <p className="text-xs text-muted-foreground">Toggle if displayed prices are tax-inclusive</p>
                                    </div>
                                    <Switch
                                        checked={watch('tax_inclusive')}
                                        onCheckedChange={(checked) => setValue('tax_inclusive', checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-10 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Update Store Policies'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
