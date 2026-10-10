import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

gsap.registerPlugin(ScrollTrigger);

export interface FaqItem {
  question: string;
  answer: string;
}

export const defaultFaqs: FaqItem[] = [
  {
    question: 'What turnkey infrastructure and technology services does CampusMart offer?',
    answer: 'CampusMart provides end-to-end infrastructure and technology solutions for schools, colleges, and universities. Our capabilities encompass campus master planning, ergonomic classroom and laboratory furniture, AI-powered smart classrooms, STEM and science labs, athletic sports infrastructure, and unified digital campus automation.',
  },
  {
    question: 'Can CampusMart upgrade or retrofit existing campuses, or is it strictly for new builds?',
    answer: 'We cater to both new greenfield campus setups and existing institutions. Our specialists provide phased modular retrofitting to modernize traditional lecture halls, legacy computer labs, and libraries into digital-first environments with minimal disruption to ongoing academic operations.',
  },
  {
    question: 'Are CampusMart’s smart infrastructure solutions compliant with UGC and NEP 2020 guidelines?',
    answer: 'Yes. All our digital learning frameworks, smart classroom technologies, laboratory setups, and campus designs are meticulously planned in alignment with UGC norms and National Education Policy (NEP 2020) standards to ensure seamless institutional compliance and accreditation.',
  },
  {
    question: 'How does CampusMart manage project execution, quality assurance, and warranties?',
    answer: 'Every project is led by a dedicated project engineer and procurement manager. We manage end-to-end delivery—from 3D layout simulation and OEM manufacturing to on-site installation and testing. All hardware, digital systems, and custom furniture include comprehensive OEM warranties and post-installation support.',
  },
  {
    question: 'How can our institution request a campus consultation or customized quote?',
    answer: 'You can submit an enquiry using the partnership form below, email us at info@campusmart.in, or call our advisory team directly at +91 9966109191. Our campus consultants will analyze your institution\'s specific needs and provide a tailored proposal within 24 to 48 hours.',
  },
];

export default function FaqSection() {
  const { content } = useSiteContent();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  // Consume dynamic CMS FAQs if configured, otherwise fall back to defaults
  // Honor toggle and explicit empty array so admins can remove FAQs
  const showFaqs = content.show_home_faqs !== false && content.show_home_faqs !== 'false';
  const rawFaqs = content.home_faqs;
  const isExplicitlyEmpty = Array.isArray(rawFaqs) && rawFaqs.length === 0;

  if (!showFaqs || isExplicitlyEmpty) {
    return null;
  }

  const faqs: FaqItem[] = Array.isArray(rawFaqs) && rawFaqs.length > 0
    ? rawFaqs
    : defaultFaqs;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      const items = accordionRef.current?.querySelectorAll('.faq-accordion-item');
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: accordionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [faqs.length]);

  return (
    <section ref={containerRef} className="py-12 md:py-16 bg-[#fbfbfb] border-t border-gray-200/60 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0047AB] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Have Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#12395b] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base leading-relaxed">
            Everything you need to know about partnering with CampusMart for modern campus design, 
            smart classroom technology, and turnkey educational infrastructure.
          </p>
        </div>

        {/* Accordion Container */}
        <div ref={accordionRef} className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={`faq-${index}`}
                value={`faq-${index}`}
                className="faq-accordion-item bg-white border border-gray-200/90 rounded-2xl px-5 sm:px-6 shadow-xs hover:border-[#0047AB]/40 transition-colors duration-200 overflow-hidden"
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
                  <div className="pt-1 border-t border-gray-100">
                    <p className="mt-2.5">{faq.answer}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Quick Help Callout */}
          <div className="mt-10 p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047AB] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">Have a question not listed here?</h4>
                <p className="text-xs sm:text-sm text-gray-500">Our campus infrastructure experts are ready to assist you.</p>
              </div>
            </div>
            <a
              href="#partnership-name"
              onClick={(e) => {
                const target = document.getElementById('partnership-name') || document.querySelector('form');
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0047AB] text-white text-xs sm:text-sm font-bold hover:bg-[#002A6C] transition-all shadow-sm shrink-0"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
