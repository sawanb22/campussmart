import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import UnifiedPageEditor, { type Page } from '../components/UnifiedPageEditor';

export default function PageEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: p } = await api.get(`/pages/${id}`);
                setPage(p);
            } catch (err: any) {
                console.error(`Failed to load page ${id}:`, err);
                setError('Failed to load page.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="p-8 text-gray-400 font-medium">Loading page editor...</div>;
    if (error || !page) return <div className="p-8 text-red-500 font-medium">{error || 'Page not found.'}</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
            <UnifiedPageEditor
                page={page}
                isStandalone
                onClose={() => navigate('/admin/pages')}
                onSaved={(updated) => setPage(updated)}
            />
        </div>
    );
}
