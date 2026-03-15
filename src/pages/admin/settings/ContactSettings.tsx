import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function ContactSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            email: settings.email || '',
            support_email: settings.support_email || '',
            contact_number: settings.contact_number || '',
            address: settings.address || '',
            notification_email: settings.notification_email || '',
            email_notifications: !!settings.email_notifications,
            sms_notifications: !!settings.sms_notifications,
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('Contact info updated');
        } catch (error: any) {
            toast.error('Failed to update');
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-600">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Contact & Notifications</CardTitle>
                        <CardDescription>Manage how customers reach you and how you receive alerts</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Phone className="h-5 w-5 text-blue-600" />
                                Contact Details
                            </h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Store Public Email</Label>
                                <Input {...register('email')} placeholder="hello@store.com" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Support Email</Label>
                                <Input {...register('support_email')} placeholder="support@store.com" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Phone Number</Label>
                                <Input {...register('contact_number')} placeholder="+1 234 567 890" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Store Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Textarea {...register('address')} rows={3} placeholder="123 Shopping Ave, Retail City" className="pl-10 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                Notification Preferences
                            </h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Admin Notification Email</Label>
                                <Input {...register('notification_email')} placeholder="admin@store.com" className="h-11 rounded-xl" />
                                <p className="text-[10px] text-muted-foreground">Internal alerts will be sent here</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                                    <div className="space-y-0.5">
                                        <Label className="font-semibold">Email Alerts</Label>
                                        <p className="text-xs text-muted-foreground">Get order and system notifications via email</p>
                                    </div>
                                    <Switch
                                        checked={watch('email_notifications')}
                                        onCheckedChange={(checked) => setValue('email_notifications', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                                    <div className="space-y-0.5">
                                        <Label className="font-semibold">SMS Alerts</Label>
                                        <p className="text-xs text-muted-foreground">Mobile alerts for urgent updates (Coming Soon)</p>
                                    </div>
                                    <Switch
                                        disabled
                                        checked={watch('sms_notifications')}
                                        onCheckedChange={(checked) => setValue('sms_notifications', checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-8 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Save Contact Info'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
