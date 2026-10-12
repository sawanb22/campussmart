import { useState, useMemo } from 'react';
import { Search, HelpCircle, Phone, Mail, ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { usePageData } from '@/hooks/usePageData';
import type { FaqItem } from '@/components/sections/faq-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface EditableFaqItem extends FaqItem {
  active?: boolean;
}

export default function FaqPage() {
  const { data, loading } = usePageData('faq');
  const { content } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');

  // Read FAQs directly from database (pageData.faqs first, then global site content home_faqs)
  const pageFaqs = (data as any)?.faqs;
  const rawFaqs = Array.isArray(pageFaqs)
    ? pageFaqs
    : Array.isArray(content.home_faqs)
      ? content.home_faqs
      : [];

  const faqs: EditableFaqItem[] = useMemo(() => {
    return (Array.isArray(rawFaqs) ? rawFaqs : []).filter(
      (item: EditableFaqItem) => item && item.question && item.active !== false
    );
  }, [rawFaqs]);

  // Real-time search filtering
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const hideHero = Boolean((data as any)?.hideHero);
  const hideFaqs = Boolean((data as any)?.hideFaqs);
  const hideCta = Boolean((data as any)?.hideCta);

  const heroEyebrow = (data as any)?.heroEyebrow ?? '';
  const heroTitle = (data as any)?.heroTitle ?? '';
  const heroSubtitle = (data as any)?.heroSubtitle ?? '';
  const searchPlaceholder = (data as any)?.searchPlaceholder ?? '';

  const ctaEyebrow = (data as any)?.ctaEyebrow ?? '';
  const ctaTitle = (data as any)?.ctaTitle ?? '';
  const ctaSubtitle = (data as any)?.ctaSubtitle ?? '';
  const ctaBadge1 = (data as any)?.ctaBadge1 ?? '';
  const ctaBadge2 = (data as any)?.ctaBadge2 ?? '';
  const ctaButtonLabel = (data as any)?.ctaButtonLabel ?? '';
  const ctaHref = (data as any)?.ctaHref ?? '/contact-us';

  const phone = (data as any)?.contact_phone || content.contact_phone || '';
  const email = (data as any)?.contact_email || content.contact_email || '';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  if (loading && !heroTitle && faqs.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-[#12395b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* Hero Header */}
      {!hideHero && (heroEyebrow || heroTitle || heroSubtitle) && (
        <div className="bg-[#12395b] text-white py-8 sm:py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {heroEyebrow && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
                <span>{heroEyebrow}</span>
              </div>
            )}
            {heroTitle && (
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5">
                {heroTitle}
              </h1>
            )}
            {heroSubtitle && (
              <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto mb-5 leading-normal">
                {heroSubtitle}
              </p>
            )}

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {(!hideFaqs || !hideCta) && (
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${!hideHero ? '-mt-4' : 'pt-8'}`}>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
            {!hideFaqs && (
              <>
                {searchQuery && (
                  <div className="flex items-center justify-start border-b border-gray-100 pb-3 mb-4">
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Filtered by: "{searchQuery}"
                    </span>
                  </div>
                )}

                {filteredFaqs.length === 0 ? (
                  <div className="py-8 text-center">
                    <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
                    <h3 className="text-base font-bold text-gray-800 mb-1">No matching questions found</h3>
                    {searchQuery && (
                      <>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-md mx-auto">
                          We couldn't find any FAQs matching "{searchQuery}". Try searching for another keyword or reach out to our team directly.
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-3.5 py-1.5 bg-blue-50 text-[#0047AB] font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Clear Search Filter
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <Accordion type="single" collapsible defaultValue="page-faq-0" className="space-y-2">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem
                        key={`page-faq-${index}`}
                        value={`page-faq-${index}`}
                        className="bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl px-4 sm:px-5 transition-colors shadow-xs"
                      >
                        <AccordionTrigger className="py-2.5 sm:py-3.5 text-left text-sm sm:text-base font-bold text-gray-900 hover:text-[#0047AB] hover:no-underline transition-colors">
                          <span className="flex items-start gap-2.5 pr-2">
                            <span className="text-[#0047AB] font-mono text-xs sm:text-sm font-extrabold mt-0.5">
                              {String(index + 1).padStart(2, '0')}.
                            </span>
                            <span>{faq.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 text-xs sm:text-sm leading-relaxed pb-3 pl-6 sm:pl-7 pr-2">
                          <p className="border-t border-gray-100 pt-2">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </>
            )}

            {/* Quick Contact Box */}
            {!hideCta && (ctaTitle || ctaSubtitle || ctaButtonLabel) && (
              <div className={`${!hideFaqs ? 'mt-6' : ''} p-4 sm:p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-xl`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    {ctaEyebrow && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0047AB] mb-0.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ctaEyebrow}</span>
                      </div>
                    )}
                    {ctaTitle && <h3 className="text-lg font-bold text-gray-900">{ctaTitle}</h3>}
                    {ctaSubtitle && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 max-w-xl">
                        {ctaSubtitle}
                      </p>
                    )}
                    {(ctaBadge1 || ctaBadge2) && (
                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs font-medium text-gray-600">
                        {ctaBadge1 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ctaBadge1}</span>
                          </div>
                        )}
                        {ctaBadge2 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ctaBadge2}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    {ctaButtonLabel && (
                      <Link
                        to={ctaHref}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0047AB] text-white text-xs sm:text-sm font-bold hover:bg-[#002A6C] transition-all shadow-sm"
                      >
                        <span>{ctaButtonLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{phone}</span>
                      </a>
                    )}
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>{email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
