import { useEffect, useState } from 'react';
import { Mail, Phone, Check, Building2, Download, BriefcaseBusiness } from 'lucide-react';
import api from '../api/client';

interface ContactEnquiry { id: number; name: string; email: string; phone?: string; subject?: string; role?: string; message: string; resumeOriginalName?: string; read: boolean; createdAt: string; }
interface QuoteRequest { id: number; name: string; email: string; phone?: string; institution?: string; items?: string; message: string; read: boolean; createdAt: string; }

export default function Enquiries() {
    const [contacts, setContacts] = useState<ContactEnquiry[]>([]);
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [tab, setTab] = useState<'contact' | 'quote' | 'jobs'>('contact');
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        const { data } = await api.get('/admin/enquiries');
        setContacts(data.contacts);
        setQuotes(data.quotes);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const markRead = async (type: 'contact' | 'quote', id: number) => {
        await api.put(`/admin/enquiries/${type}/${id}/read`);
        if (type === 'contact') setContacts((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
        else setQuotes((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
    };

    const downloadResume = async (enquiry: ContactEnquiry) => {
        const response = await api.get(`/admin/enquiries/contact/${enquiry.id}/resume`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = enquiry.resumeOriginalName || 'resume';
        link.click();
        URL.revokeObjectURL(url);
    };

    const data = tab === 'quote' ? quotes : tab === 'jobs' ? contacts.filter((e) => Boolean(e.resumeOriginalName)) : contacts.filter((e) => !e.resumeOriginalName);
    const unread = (arr: { read: boolean }[]) => arr.filter((e) => !e.read).length;

    return (
        <div className="p-8">
            <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Enquiries</h1></div>

            <div className="flex gap-4 mb-6">
                {(['contact', 'quote'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-cm-blue text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                        {t === 'contact' ? 'Contact Enquiries' : 'Quote Requests'}
                        {unread(t === 'contact' ? contacts : quotes) > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unread(t === 'contact' ? contacts : quotes)}</span>
                        )}
                    </button>
                ))}
                <button onClick={() => setTab('jobs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'jobs' ? 'bg-cm-blue text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                    <BriefcaseBusiness className="mr-1 inline-block h-4 w-4" /> Job Applications
                    {unread(contacts.filter((e) => Boolean(e.resumeOriginalName))) > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unread(contacts.filter((e) => Boolean(e.resumeOriginalName)))}</span>}
                </button>
            </div>

            {loading ? <div className="text-gray-400">Loading...</div> : (
                <div className="space-y-4">
                    {data.map((e) => (
                        <div key={e.id} className={`card ${!e.read ? 'border-l-4 border-l-cm-blue' : ''}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="font-semibold text-gray-900">{e.name}</div>
                                        {!e.read && <span className="badge-blue">New</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{e.email}</span>
                                        {e.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{e.phone}</span>}
                                        {'institution' in e && e.institution && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{e.institution}</span>}
                                    </div>
                                    {'subject' in e && e.subject && <div className="text-sm font-medium text-gray-700 mb-1">{e.subject as string}</div>}
                                    {'role' in e && (e as ContactEnquiry).role && <div className="text-sm font-medium text-cm-blue mb-1">Role: {(e as ContactEnquiry).role}</div>}
                                    {'items' in e && (e as QuoteRequest).items && <div className="text-sm text-gray-500 mb-2"><strong>Items:</strong> {(e as QuoteRequest).items}</div>}
                                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{e.message}</p>
                                    {'resumeOriginalName' in e && (e as ContactEnquiry).resumeOriginalName && <button type="button" onClick={() => downloadResume(e as ContactEnquiry)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cm-blue px-3 py-2 text-sm font-medium text-cm-blue hover:bg-blue-50"><Download className="h-4 w-4" /> Download {(e as ContactEnquiry).resumeOriginalName}</button>}
                                    <div className="mt-2 text-xs text-gray-400">{new Date(e.createdAt).toLocaleString('en-IN')}</div>
                                </div>
                                {!e.read && (
                                    <button onClick={() => markRead(tab === 'quote' ? 'quote' : 'contact', e.id)} className="ml-4 flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-green-200">
                                        <Check className="w-3.5 h-3.5" /> Mark Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && <div className="card text-center text-gray-400 py-8">No {tab} enquiries yet.</div>}
                </div>
            )}
        </div>
    );
}
