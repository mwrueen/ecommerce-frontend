import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, FileText, RefreshCcw, Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function LegalSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            terms_of_service: settings.terms_of_service || '',
            privacy_policy: settings.privacy_policy || '',
            return_policy: settings.return_policy || '',
            shipping_policy: settings.shipping_policy || '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('Legal policies updated');
        } catch (error: any) {
            toast.error('Failed to update');
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl text-red-600">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Legal & Policies</CardTitle>
                        <CardDescription>Draft and manage your legal documents and customer policies</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs defaultValue="tos" className="space-y-6">
                        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex-wrap">
                            <TabsTrigger value="tos" className="rounded-lg py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4" /> Terms of Service
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="rounded-lg py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <ShieldAlert className="h-4 w-4" /> Privacy Policy
                            </TabsTrigger>
                            <TabsTrigger value="return" className="rounded-lg py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <RefreshCcw className="h-4 w-4" /> Return Policy
                            </TabsTrigger>
                            <TabsTrigger value="shipping" className="rounded-lg py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Truck className="h-4 w-4" /> Shipping Policy
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tos" className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Terms of Service</Label>
                                <RichTextEditor
                                    value={watch('terms_of_service')}
                                    onChange={(val) => setValue('terms_of_service', val)}
                                    placeholder="Define your terms and conditions..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="privacy" className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Privacy Policy</Label>
                                <RichTextEditor
                                    value={watch('privacy_policy')}
                                    onChange={(val) => setValue('privacy_policy', val)}
                                    placeholder="Explain how you handle user data..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="return" className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Return & Refund Policy</Label>
                                <RichTextEditor
                                    value={watch('return_policy')}
                                    onChange={(val) => setValue('return_policy', val)}
                                    placeholder="Conditions for returns and refunds..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="shipping" className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Shipping Policy</Label>
                                <RichTextEditor
                                    value={watch('shipping_policy')}
                                    onChange={(val) => setValue('shipping_policy', val)}
                                    placeholder="Delivery times, carriers, and costs..."
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-8 border-t border-slate-100 mt-8">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-10 h-12 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Save All Policies'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
