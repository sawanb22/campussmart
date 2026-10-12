import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, Phone, Send } from 'lucide-react';
import api from '@/api/client';
import { useContactAction } from '@/hooks/useContactAction';
import ContactActionModal from '@/components/ui/contact-action-modal';
import { useSiteContent } from '@/contexts/SiteContentContext';

gsap.registerPlugin(ScrollTrigger);

export interface PartnershipContentData {
  formTitle?: string;
  formSubtitle?: string;
  readyTitle?: string;
  readyText?: string;
  whatsappNumber?: string;
  whatsappText?: string;
  phoneNumber?: string;
  phoneText?: string;
}

const PartnershipForm = () => {
  const { content } = useSiteContent();
  const pData: PartnershipContentData = content.home_partnership || {};
  const formTitle = pData.formTitle || 'Partnership Enquiry Form';
  const formSubtitle = pData.formSubtitle || "Please fill out the form and we'll get back to you as soon as possible.";
  const readyTitle = pData.readyTitle || 'Ready to talk?';
  const readyText = pData.readyText || 'At Campus Mart, we have the expertise in guiding you to set up your new campus project and help you maximize the performance of your campus while also figuring out your return on investment. We have the expertise in guiding you to set up your new campus project and help you maximize.';
  const whatsappNumber = pData.whatsappNumber || '919966109191';
  const whatsappText = pData.whatsappText || 'Connect On WhatsApp';
  const phoneNumber = pData.phoneNumber || '+919966109191';
  const phoneText = pData.phoneText || 'Call Us 9966109191';

  const { modalState, closeModal, triggerPhone } = useContactAction();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Form container slide in
      gsap.fromTo(
        formRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Form fields stagger
      const formFields = formRef.current?.querySelectorAll('.form-field');
      if (formFields) {
        gsap.fromTo(
          formFields,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Contact info slide in
      gsap.fromTo(
        contactRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Buttons pop in
      const buttons = contactRef.current?.querySelectorAll('.contact-btn');
      if (buttons) {
        gsap.fromTo(
          buttons,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.4,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        subject: 'Partnership Enquiry',
        message: formData.message,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', institution: '', message: '' });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={containerRef} className="py-4 md:py-6 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-cm-gray rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-cm-blue-dark mb-1">
              {formTitle}
            </h2>
            <p className="text-gray-600 mb-4">
              {formSubtitle}
            </p>
            {submitted && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Thank you. Your partnership enquiry has been submitted successfully.
              </div>
            )}
            {submitError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="form-field">
                <label htmlFor="partnership-name" className="form-label">
                  Full Name <span className="text-cm-red">*</span>
                </label>
                <input
                  type="text"
                  id="partnership-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="partnership-email" className="form-label">
                  Email <span className="text-cm-red">*</span>
                </label>
                <input
                  type="email"
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  id="partnership-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="partnership-phone" className="form-label">
                  Phone Number <span className="text-cm-red">*</span>
                </label>
                <input
                  type="tel"
                  pattern="(?:\+?91[\s\-]?)?0?[0-9\s\-]{10,14}"
                  minLength={10}
                  maxLength={14}
                  id="partnership-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="partnership-institution" className="form-label">
                  Institution
                </label>
                <input
                  type="text"
                  id="partnership-institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="form-input"
                  placeholder="Institution or organisation"
                />
              </div>

              <div className="form-field lg:col-span-2">
                <label htmlFor="partnership-message" className="form-label">
                  Message <span className="text-cm-red">*</span>
                </label>
                <textarea
                  id="partnership-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input min-h-[88px] resize-none"
                  placeholder="Tell us about your requirements..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full lg:col-span-2 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </div>
          </form>

          {/* Contact Info */}
          <div ref={contactRef} className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-cm-blue-dark mb-4">
              {readyTitle}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {readyText}
            </p>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn btn-whatsapp w-full justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                {whatsappText}
              </a>

              <button
                type="button"
                onClick={() => triggerPhone(phoneNumber, 'Call Campus Mart Support')}
                className="contact-btn btn-call w-full justify-center cursor-pointer"
                title={`Call ${phoneNumber}`}
              >
                <Phone className="w-5 h-5" />
                {phoneText}
              </button>
            </div>

          </div>
        </div>
      </div>
      <ContactActionModal state={modalState} onClose={closeModal} />
    </section>
  );
};

export default PartnershipForm;
