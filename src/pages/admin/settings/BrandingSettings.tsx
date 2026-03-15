import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateSiteSettingsMutation, useRemoveSliderItemsMutation } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2, Upload, X, ChevronUp, ChevronDown, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn, getStorageUrl } from '@/lib/utils';

export default function BrandingSettings({ settings }: { settings: any }) {
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
    const [removeSliderItems] = useRemoveSliderItemsMutation();

    const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
    const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [headerLogoPreview, setHeaderLogoPreview] = useState<string>(settings.header_logo || '');
    const [footerLogoPreview, setFooterLogoPreview] = useState<string>(settings.footer_logo || '');
    const [faviconPreview, setFaviconPreview] = useState<string>(settings.favicon || '');

    const [sliderFiles, setSliderFiles] = useState<File[]>([]);
    const initialSliders = settings.slider_images || [];
    const [sliderPreviews, setSliderPreviews] = useState<any[]>(initialSliders);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer' | 'favicon') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'header') { setHeaderLogoFile(file); setHeaderLogoPreview(result); }
                else if (type === 'footer') { setFooterLogoFile(file); setFooterLogoPreview(result); }
                else { setFaviconFile(file); setFaviconPreview(result); }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSliderFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newFiles = [...sliderFiles, ...files];
            setSliderFiles(newFiles);

            const filePromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({
                        image: reader.result as string,
                        title: '',
                        subtitle: '',
                        hyperlink: '',
                        isNew: true
                    });
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(newPreviews => {
                setSliderPreviews([...sliderPreviews, ...newPreviews]);
            });
        }
    };

    const removeSliderImage = async (index: number) => {
        const preview = sliderPreviews[index];
        if (!preview.isNew) {
            try {
                await removeSliderItems({ slider_indices: [index] }).unwrap();
                toast.success('Slider image removed');
            } catch (error: any) {
                toast.error('Failed to remove image');
                return;
            }
        } else {
            // It's a brand new file
            const newFiles = [...sliderFiles];
            const newIndex = index - sliderPreviews.filter(p => !p.isNew).length;
            newFiles.splice(newIndex, 1);
            setSliderFiles(newFiles);
        }

        const newPreviews = [...sliderPreviews];
        newPreviews.splice(index, 1);
        setSliderPreviews(newPreviews);
    };

    const updateSliderField = (index: number, field: string, value: string) => {
        const newPreviews = [...sliderPreviews];
        newPreviews[index] = { ...newPreviews[index], [field]: value };
        setSliderPreviews(newPreviews);
    };

    const onSubmit = async () => {
        try {
            const formData = new FormData();
            if (headerLogoFile) formData.append('header_logo', headerLogoFile);
            if (footerLogoFile) formData.append('footer_logo', footerLogoFile);
            if (faviconFile) formData.append('favicon', faviconFile);

            if (sliderFiles.length > 0) {
                sliderFiles.forEach((file, idx) => {
                    formData.append('slider_images[]', file);
                    const previewIdx = sliderPreviews.findIndex(p => p.isNew && sliderPreviews.slice(0, sliderPreviews.indexOf(p)).filter(prev => prev.isNew).length === idx);
                    if (previewIdx !== -1) {
                        formData.append('slider_titles[]', sliderPreviews[previewIdx].title || '');
                        formData.append('slider_subtitles[]', sliderPreviews[previewIdx].subtitle || '');
                        formData.append('slider_hyperlinks[]', sliderPreviews[previewIdx].hyperlink || '');
                    }
                });
            }

            // Existing sliders data (for meta changes)
            const existing = sliderPreviews.filter(p => !p.isNew).map(p => ({
                image: p.image.includes('/storage/') ? p.image.split('/storage/')[1] : p.image,
                title: p.title || '',
                subtitle: p.subtitle || '',
                hyperlink: p.hyperlink || ''
            }));
            formData.append('slider_images', JSON.stringify(existing));

            await updateSettings(formData).unwrap();
            setHeaderLogoFile(null);
            setFooterLogoFile(null);
            setFaviconFile(null);
            setSliderFiles([]);
            toast.success('Branding updated successfully');
        } catch (error: any) {
            toast.error('Failed to update branding');
        }
    };

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl text-purple-600">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Branding & Assets</CardTitle>
                        <CardDescription>Manage logos, icons, and hero slider content</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Header Logo */}
                    <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-md h-full">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-purple-600" />
                            Header Logo
                        </Label>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full aspect-video rounded-xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                {headerLogoPreview ? (
                                    <img src={getStorageUrl(headerLogoPreview)} alt="Header Logo" className="max-h-24 object-contain" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => document.getElementById('header_logo_input')?.click()}>
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <input
                                id="header_logo_input"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'header')}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl"
                                onClick={() => document.getElementById('header_logo_input')?.click()}
                            >
                                Change Header Logo
                            </Button>
                        </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-md h-full">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-purple-600" />
                            Footer Logo
                        </Label>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full aspect-video rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                {footerLogoPreview ? (
                                    <img src={getStorageUrl(footerLogoPreview)} alt="Footer Logo" className="max-h-24 object-contain" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-slate-600" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => document.getElementById('footer_logo_input')?.click()}>
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <input
                                id="footer_logo_input"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'footer')}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl"
                                onClick={() => document.getElementById('footer_logo_input')?.click()}
                            >
                                Change Footer Logo
                            </Button>
                        </div>
                    </div>

                    {/* Favicon */}
                    <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-md h-full">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-purple-600" />
                            Favicon
                        </Label>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                {faviconPreview ? (
                                    <img src={getStorageUrl(faviconPreview)} alt="Favicon" className="h-10 w-10 object-contain" />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full" onClick={() => document.getElementById('favicon_input')?.click()}>
                                        <Upload className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <input
                                id="favicon_input"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'favicon')}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl"
                                onClick={() => document.getElementById('favicon_input')?.click()}
                            >
                                Change Favicon
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hero Slider Management */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Homepage Slider</h3>
                            <p className="text-sm text-muted-foreground">Add high-quality images for your landing page hero section</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => document.getElementById('slider_input')?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Add Items
                        </Button>
                        <input id="slider_input" type="file" multiple className="hidden" onChange={handleSliderFilesChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sliderPreviews.map((slider, index) => (
                            <Card key={index} className="rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all">
                                <div className="flex h-full">
                                    <div className="w-1/3 relative overflow-hidden">
                                        <img src={getStorageUrl(slider.image)} alt="Slider" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 left-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => removeSliderImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        {slider.isNew && (
                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">NEW</div>
                                        )}
                                    </div>
                                    <div className="w-2/3 p-4 space-y-3 bg-slate-50/30">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-slate-500">Title</Label>
                                            <Input
                                                value={slider.title || ''}
                                                onChange={(e) => updateSliderField(index, 'title', e.target.value)}
                                                placeholder="Heading"
                                                className="h-8 text-sm rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-slate-500">Subtitle</Label>
                                            <Textarea
                                                value={slider.subtitle || ''}
                                                onChange={(e) => updateSliderField(index, 'subtitle', e.target.value)}
                                                placeholder="Subheading"
                                                className="h-16 text-xs rounded-lg resize-none py-2"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-slate-500">Call to Action Link</Label>
                                            <Input
                                                value={slider.hyperlink || ''}
                                                onChange={(e) => updateSliderField(index, 'hyperlink', e.target.value)}
                                                placeholder="/products"
                                                className="h-8 text-[11px] rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-slate-100">
                    <Button
                        onClick={onSubmit}
                        disabled={isUpdating}
                        className="rounded-xl px-10 h-12 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all hover:scale-105"
                    >
                        {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Apply Branding Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
