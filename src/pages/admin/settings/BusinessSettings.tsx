import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';

export default function BusinessSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            business_hours: settings.business_hours || {
                monday: { closed: false, open: '09:00', close: '17:00' },
                tuesday: { closed: false, open: '09:00', close: '17:00' },
                wednesday: { closed: false, open: '09:00', close: '17:00' },
                thursday: { closed: false, open: '09:00', close: '17:00' },
                friday: { closed: false, open: '09:00', close: '17:00' },
                saturday: { closed: false, open: '10:00', close: '16:00' },
                sunday: { closed: true, open: '10:00', close: '16:00' },
            },
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('Business hours updated');
        } catch (error: any) {
            const msg = error?.data?.message || (error?.data?.errors ? Object.values(error.data.errors).flat().join(', ') : 'Failed to update business hours');
            toast.error(msg);
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Operations & Hours</CardTitle>
                        <CardDescription>Define when your support and store operations are active</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {days.map((day) => (
                            <div key={day} className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white">
                                <div className="flex items-center gap-4 w-full md:w-1/4">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <Label className="font-bold capitalize">{day}</Label>
                                </div>

                                <div className="flex flex-1 items-center justify-center gap-6 mt-4 md:mt-0">
                                    <div className="flex items-center gap-3">
                                        <Label className="text-xs text-muted-foreground">Open</Label>
                                        <Input
                                            type="time"
                                            disabled={watch(`business_hours.${day}.closed` as any)}
                                            {...register(`business_hours.${day}.open` as any)}
                                            className="h-9 w-32 rounded-lg"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label className="text-xs text-muted-foreground">Close</Label>
                                        <Input
                                            type="time"
                                            disabled={watch(`business_hours.${day}.closed` as any)}
                                            {...register(`business_hours.${day}.close` as any)}
                                            className="h-9 w-32 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-1/4 justify-end">
                                    <Label className="text-xs font-semibold text-slate-500">Closed</Label>
                                    <Switch
                                        checked={watch(`business_hours.${day}.closed` as any)}
                                        onCheckedChange={(checked) => setValue(`business_hours.${day}.closed` as any, checked)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-10 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Set Business Hours'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
