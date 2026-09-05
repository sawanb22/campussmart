import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import api from '../api/client';

interface MediaImageListFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export default function MediaImageListField({ label, value, onChange }: MediaImageListFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const upload = async (files: FileList) => {
        setError('');
        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('image', file);
                const { data } = await api.post('/media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedUrls.push(data.url);
            }
            const existingUrls = value.split(',').map(url => url.trim()).filter(Boolean);
            onChange([...existingUrls, ...uploadedUrls].join(', '));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-[10px]">{label}</label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                    className="min-h-20 flex-1 rounded-xl border border-gray-200 px-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Paste URLs separated by commas or upload files"
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                        if (e.target.files?.length) void upload(e.target.files);
                        e.target.value = '';
                    }}
                />
            </div>
            <p className="flex items-center gap-1 text-[11px] text-gray-400">
                <ImagePlus className="h-3.5 w-3.5" /> Select multiple JPG, PNG, WEBP or GIF files, up to 5 MB each
            </p>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}
