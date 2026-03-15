import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSiteSettingsMutation } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

export default function SocialSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

    const { register, handleSubmit } = useForm({
        defaultValues: {
            social_links: {
                facebook: settings.social_links?.facebook || '',
                twitter: settings.social_links?.twitter || '',
                instagram: settings.social_links?.instagram || '',
                linkedin: settings.social_links?.linkedin || '',
                youtube: settings.social_links?.youtube || '',
                tiktok: settings.social_links?.tiktok || '',
                whatsapp: settings.social_links?.whatsapp || '',
            },
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success('Social links updated');
        } catch (error: any) {
            toast.error('Failed to update');
        }
    };

    const socialPlatforms = [
        { id: 'facebook', icon: Facebook, color: 'text-blue-600', label: 'Facebook URL' },
        { id: 'twitter', icon: Twitter, color: 'text-sky-500', label: 'Twitter / X URL' },
        { id: 'instagram', icon: Instagram, color: 'text-pink-600', label: 'Instagram URL' },
        { id: 'linkedin', icon: Linkedin, color: 'text-blue-700', label: 'LinkedIn URL' },
        { id: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube Channel' },
        { id: 'whatsapp', icon: MessageSquare, color: 'text-emerald-500', label: 'WhatsApp Number' },
    ];

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-xl text-teal-600">
                        <Share2 className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Social Connections</CardTitle>
                        <CardDescription>Link your store to your social media profiles</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {socialPlatforms.map((platform) => (
                            <div key={platform.id} className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                <Label htmlFor={`social-${platform.id}`} className="text-sm font-bold flex items-center gap-2">
                                    <platform.icon className={cn("h-4 w-4", platform.color)} />
                                    {platform.label}
                                </Label>
                                <Input
                                    id={`social-${platform.id}`}
                                    {...register(`social_links.${platform.id}` as any)}
                                    placeholder="https://..."
                                    className="h-10 rounded-xl bg-transparent"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-xl px-10 h-12 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-100"
                        >
                            {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Update Social Links'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
