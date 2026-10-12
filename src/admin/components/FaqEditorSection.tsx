import { Plus, Trash2, RotateCcw, Eye, EyeOff, HelpCircle, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { defaultFaqs, type FaqItem } from '@/components/sections/faq-section';
import type { PageData } from './UnifiedPageEditor';

export interface EditableFaqItem extends FaqItem {
    active?: boolean;
}

interface FaqEditorSectionProps {
    data: PageData;
    set: (key: string, value: any) => void;
}

export default function FaqEditorSection({ data, set }: FaqEditorSectionProps) {
    const faqs: EditableFaqItem[] = Array.isArray((data as any).faqs) ? (data as any).faqs : [];

    const updateFaqs = (nextFaqs: EditableFaqItem[]) => {
        set('faqs', nextFaqs);
    };

    const addFaq = () => {
        const nextIndex = faqs.length;
        updateFaqs([
            ...faqs,
            {
                question: 'New Question',
                answer: '',
                active: true,
            },
        ]);
        requestAnimationFrame(() => {
            setTimeout(() => {
                const el = document.getElementById(`faq-editor-item-${nextIndex}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const input = el.querySelector<HTMLInputElement>('input[type="text"]');
                    if (input) {
                        input.focus();
                        input.select();
                    }
                }
            }, 80);
        });
    };

    const updateFaqField = (idx: number, field: keyof EditableFaqItem, value: any) => {
        const next = [...faqs];
        next[idx] = { ...next[idx], [field]: value };
        updateFaqs(next);
    };

    const removeFaq = (idx: number) => {
        updateFaqs(faqs.filter((_, i) => i !== idx));
    };

    const moveFaq = (idx: number, dir: 'up' | 'down') => {
        const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= faqs.length) return;
        const next = [...faqs];
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        updateFaqs(next);
    };

    const resetFaqsToDefault = () => {
        if (window.confirm('Reset all FAQs to the standard 5 CampusMart questions?')) {
            updateFaqs(defaultFaqs.map((f) => ({ ...f, active: true })));
        }
    };

    return (
        <div className="space-y-12">
            {/* 1. Hero Header & Search Bar Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                            Hero Banner &amp; Search Bar Content
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">Top header and search input displayed on /faq</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => set('hideHero', !data.hideHero)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            data.hideHero
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Header Eyebrow Badge</label>
                        <input
                            type="text"
                            value={(data as any).heroEyebrow ?? ''}
                            onChange={(e) => set('heroEyebrow', e.target.value)}
                            placeholder="Support & Guidance"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Hero Heading *</label>
                        <input
                            type="text"
                            value={data.heroTitle ?? ''}
                            onChange={(e) => set('heroTitle', e.target.value)}
                            placeholder="Frequently Asked Questions"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Hero Sub-heading</label>
                        <textarea
                            rows={2}
                            value={data.heroSubtitle ?? ''}
                            onChange={(e) => set('heroSubtitle', e.target.value)}
                            placeholder="Find answers to common questions about our campus infrastructure solutions..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Search Bar Placeholder</label>
                        <input
                            type="text"
                            value={(data as any).searchPlaceholder ?? ''}
                            onChange={(e) => set('searchPlaceholder', e.target.value)}
                            placeholder="Search by keywords (e.g. UGC, furniture, quote, classrooms)..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* 2. FAQ Accordion Questions & Answers Section */}
            <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                            Frequently Asked Questions ({faqs.length})
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Add, edit, reorder, or toggle visibility of individual FAQ items on /faq
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => set('hideFaqs', !(data as any).hideFaqs)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                (data as any).hideFaqs
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                        >
                            {(data as any).hideFaqs ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {(data as any).hideFaqs ? 'Hidden / Draft' : 'Live on Page'}
                        </button>
                        <button
                            type="button"
                            onClick={resetFaqsToDefault}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                        </button>
                        <button
                            type="button"
                            onClick={addFaq}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Add Question
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {faqs.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
                            <p className="font-semibold text-gray-600 mb-1">No FAQs configured</p>
                            <p className="text-xs mb-4">
                                Click "+ Add Question" to create one or "Reset Defaults" to restore the 5 standard questions.
                            </p>
                            <button
                                onClick={resetFaqsToDefault}
                                type="button"
                                className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Restore Standard 5 Questions
                            </button>
                        </div>
                    ) : (
                        faqs.map((faq, i) => {
                            const isActive = faq.active !== false;
                            return (
                                <div
                                    key={i}
                                    id={`faq-editor-item-${i}`}
                                    className={`border rounded-2xl p-4 sm:p-5 transition-colors ${
                                        isActive
                                            ? 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                            : 'border-amber-200/80 bg-amber-50/20 opacity-80'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-gray-200/60 pb-2.5">
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-mono font-bold">
                                                {i + 1}
                                            </span>
                                            <span>FAQ #{i + 1}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => updateFaqField(i, 'active', !isActive)}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                                    isActive
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                }`}
                                                title="Toggle question visibility on live FAQ page"
                                            >
                                                {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {isActive ? 'Live' : 'Hidden'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveFaq(i, 'up')}
                                                disabled={i === 0}
                                                title="Move Up"
                                                className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveFaq(i, 'down')}
                                                disabled={i === faqs.length - 1}
                                                title="Move Down"
                                                className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFaq(i)}
                                                title="Remove FAQ"
                                                className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold ml-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Question</label>
                                            <input
                                                type="text"
                                                value={faq.question ?? ''}
                                                onChange={(e) => updateFaqField(i, 'question', e.target.value)}
                                                placeholder="e.g. What turnkey infrastructure does CampusMart provide?"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Answer</label>
                                            <textarea
                                                rows={3}
                                                value={faq.answer ?? ''}
                                                onChange={(e) => updateFaqField(i, 'answer', e.target.value)}
                                                placeholder="Provide a comprehensive and clear answer..."
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* 3. Direct Assistance / Quick Contact Box Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            Direct Assistance / Quick Contact Box
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">Bottom assistance callout card displayed below the FAQ list</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => set('hideCta', !data.hideCta)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            data.hideCta
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        {data.hideCta ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {data.hideCta ? 'Hidden / Draft' : 'Live on Page'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Eyebrow Label</label>
                        <input
                            type="text"
                            value={(data as any).ctaEyebrow ?? ''}
                            onChange={(e) => set('ctaEyebrow', e.target.value)}
                            placeholder="Direct Assistance"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">CTA Heading</label>
                        <input
                            type="text"
                            value={data.ctaTitle ?? ''}
                            onChange={(e) => set('ctaTitle', e.target.value)}
                            placeholder="Still have unanswered questions?"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">CTA Description</label>
                        <textarea
                            rows={2}
                            value={data.ctaSubtitle ?? ''}
                            onChange={(e) => set('ctaSubtitle', e.target.value)}
                            placeholder="Our educational infrastructure consultants are available to provide custom walkthroughs..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Highlight Badge 1</label>
                        <input
                            type="text"
                            value={(data as any).ctaBadge1 ?? ''}
                            onChange={(e) => set('ctaBadge1', e.target.value)}
                            placeholder="Free Initial Assessment"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Highlight Badge 2</label>
                        <input
                            type="text"
                            value={(data as any).ctaBadge2 ?? ''}
                            onChange={(e) => set('ctaBadge2', e.target.value)}
                            placeholder="24-48h Response Time"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Primary Button Label</label>
                        <input
                            type="text"
                            value={data.ctaButtonLabel ?? ''}
                            onChange={(e) => set('ctaButtonLabel', e.target.value)}
                            placeholder="Contact Our Team"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Primary Button Link</label>
                        <input
                            type="text"
                            value={data.ctaHref ?? ''}
                            onChange={(e) => set('ctaHref', e.target.value)}
                            placeholder="/contact-us"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Direct Phone Number</label>
                        <input
                            type="text"
                            value={(data as any).contact_phone ?? ''}
                            onChange={(e) => set('contact_phone', e.target.value)}
                            placeholder="+91 9966109191"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Direct Email Address</label>
                        <input
                            type="text"
                            value={(data as any).contact_email ?? ''}
                            onChange={(e) => set('contact_email', e.target.value)}
                            placeholder="info@campusmart.in"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
