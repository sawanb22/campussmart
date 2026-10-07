import { useState, useMemo } from 'react';
import { Search, HelpCircle, Phone, Mail, ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { defaultFaqs, type FaqItem } from '@/components/sections/faq-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FaqPage() {
  const { content } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');

  // Consume dynamic CMS FAQs if configured, otherwise fall back to defaults
  const rawFaqs = content.home_faqs;
  const faqs: FaqItem[] = Array.isArray(rawFaqs) && rawFaqs.length > 0
    ? rawFaqs
    : defaultFaqs;

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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header */}
      <div className="bg-[#12395b] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            <span>Support & Guidance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Find answers to common questions about our campus infrastructure solutions, 
            smart classroom technologies, UGC/NEP compliance, and turnkey procurement.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. UGC, furniture, quote, classrooms)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
              Showing {filteredFaqs.length} of {faqs.length} Questions
            </div>
            {searchQuery && (
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                Filtered by: "{searchQuery}"
              </span>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">No matching questions found</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any FAQs matching "{searchQuery}". Try searching for another keyword or reach out to our team directly.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-blue-50 text-[#0047AB] font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible defaultValue="page-faq-0" className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={`page-faq-${index}`}
                  value={`page-faq-${index}`}
                  className="bg-gray-50/50 hover:bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 transition-colors shadow-xs"
                >
                  <AccordionTrigger className="py-4 sm:py-5 text-left text-base sm:text-lg font-bold text-gray-900 hover:text-[#0047AB] hover:no-underline transition-colors">
                    <span className="flex items-start gap-3 pr-2">
                      <span className="text-[#0047AB] font-mono text-sm sm:text-base font-extrabold mt-0.5">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span>{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed pb-5 pl-7 sm:pl-8 pr-2">
                    <div className="pt-2 border-t border-gray-200/50">
                      <p className="mt-1">{faq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Quick Contact Box */}
          <div className="mt-12 p-6 sm:p-8 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0047AB] mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Assistance</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Still have unanswered questions?</h3>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                  Our educational infrastructure consultants are available to provide custom walkthroughs,
                  budget estimations, and architectural assessments for your institution.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Initial Assessment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>24-48h Response Time</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0047AB] text-white text-sm font-bold hover:bg-[#002A6C] transition-all shadow-sm"
                >
                  <span>Contact Our Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+919966109191"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>+91 9966109191</span>
                </a>
                <a
                  href="mailto:info@campusmart.in"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>info@campusmart.in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
