import { useRef, useState } from 'react';
import { Film, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import api from '../api/client';
import { resolveMediaUrl } from '../../lib/media-url';

interface MediaImageFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    previewClassName?: string;
}

export default function MediaImageField({ label, value, onChange, previewClassName = 'h-36' }: MediaImageFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const isVideo = /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(value || '');

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

    const upload = async (file: File) => {
        setError('');
        const isFileVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);

        // Instant client-side validation
        if (!isFileVideo && file.size > MAX_IMAGE_SIZE) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            setError(`Image is ${sizeMb} MB. Images must be under 5 MB for fast website loading. Please compress or select a smaller image.`);
            return;
        }

        if (isFileVideo && file.size > MAX_VIDEO_SIZE) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            setError(`Video is ${sizeMb} MB. Videos must be under 100 MB. Please trim or compress the video.`);
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('media', file);
            formData.append('image', file);
            const { data } = await api.post('/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(data.url);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Media upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    className="min-w-0 flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/30"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Paste an image/video URL or upload a file"
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cm-blue px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cm-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void upload(file);
                        e.target.value = '';
                    }}
                />
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <ImagePlus className="h-3.5 w-3.5" /> Images: JPG, PNG, WEBP (max 5 MB) | <Film className="h-3.5 w-3.5 ml-1" /> Videos: MP4, WebM (max 100 MB)
            </p>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
            {value && (
                <div className={`relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 ${previewClassName}`}>
                    {isVideo ? (
                        <video 
                            src={resolveMediaUrl(value)} 
                            controls 
                            className="h-full w-full object-contain bg-slate-900" 
                        />
                    ) : (
                        <img 
                            src={resolveMediaUrl(value)} 
                            alt={`${label} preview`} 
                            className="h-full w-full object-cover" 
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                        aria-label={`Remove ${label}`}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
