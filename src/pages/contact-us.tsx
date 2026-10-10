import { useState } from 'react';
import { Phone, Mail, Clock, Send, MessageCircle, type LucideIcon } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { getWhatsAppUrl, sanitizePhone } from '@/lib/contact-actions';

interface ContactInfoItem { title: string; content?: string; description?: string; icon: LucideIcon; }

const subCategories: Record<string, string[]> = {
  labs: ['Chemistry Lab', 'Physics Lab', 'Math Lab', 'Biology Lab', 'Composite Skill Lab', 'AI/ML Lab'],
  techLabs: ['Computer Lab', 'AI Stations'],
  innovationLabs: ['STEM Labs'],
  furnitures: [
    'Student Desks and Chairs', 'Teacher’s Desk and Chair', 'Storage Cabinets',
    'Office Furniture', 'Lab Furniture', 'Library Furniture',
    'Science Lab Tables', 'Lab Stools', 'Computer Desks', 'Reading Tables and Chairs',
    'Bookshelves and Racks', 'Art and Craft / Music Tables', 'Principal and Staff Room Desks',
    'Visitor Seating', 'Chairs', 'Stools', 'Almirah', 'Center Table', 'Sofa Table',
    'Desk Bench', 'Lecture Stand', 'White Board', 'Open Book Shelves',
  ],
  innovation: ['Idea Lab', 'Entrepreneur Cell', 'Prototyping Lab'],
  sportsTurfs: ['Football', 'Volley Ball', 'Cricket', 'Badminton', 'Tennis'],
};

export const DEFAULTS = {
  heroTitle: 'Contact Us',
  heroSubtitle: "Have a question or need assistance? We're here to help. Reach out to us through any of the channels below.",
  contact_phone: '+91 9966109191',
  contact_phone_alt: '+91 9866091111',
  contact_email: 'info@campusmart.in',
  contact_email_alt: 'support@campusmart.in',
  contact_whatsapp: '919966109191',
  contact_hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM',
  contact_address: 'Campus Mart Head Office\nHyderabad, Telangana, India',
  whatsappCtaTitle: 'Chat with us on WhatsApp',
  whatsappCtaSubtitle: 'Get direct support and immediate quotation guidance through WhatsApp with our team.',
  whatsappCtaButton: 'Start WhatsApp Chat',
  cards: [
    {
      title: 'Phone',
      description: '+91 9966109191\n+91 9866091111',
    },
    {
      title: 'Email',
      description: 'info@campusmart.in\nsupport@campusmart.in',
    },
    {
      title: 'Working Hours',
      description: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM',
    },
  ],
};

const ContactUs = () => {
  const { data } = usePageData('contact-us');
  const { content } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    authorisedPerson: '',
    address: '',
    category: '',
    subCategory: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.collegeName,
        subject: formData.category,
        message: `College / University: ${formData.collegeName}\nAuthorised Person: ${formData.authorisedPerson}\nAddress: ${formData.address}\nCategory: ${formData.category}\nSub-category: ${formData.subCategory || 'Not applicable'}\n\n${formData.message}`,
      });
      setSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        collegeName: '',
        authorisedPerson: '',
        address: '',
        category: '',
        subCategory: '',
        message: '' 
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const phone1 = content.contact_phone || data.contact_phone || DEFAULTS.contact_phone;
  const phone2 = content.contact_phone_alt || data.contact_phone_alt || DEFAULTS.contact_phone_alt;
  const phoneDisplay = phone2 ? `${phone1}\n${phone2}` : phone1;

  const email1 = content.contact_email || data.contact_email || DEFAULTS.contact_email;
  const email2 = content.contact_email_alt || data.contact_email_alt || DEFAULTS.contact_email_alt;
  const emailDisplay = email2 ? `${email1}\n${email2}` : email1;

  const hoursDisplay = content.contact_hours || data.contact_hours || DEFAULTS.contact_hours;

  const defaultContactInfo: ContactInfoItem[] = [
    {
      icon: Phone,
      title: 'Phone',
      content: phoneDisplay,
    },
    {
      icon: Mail,
      title: 'Email',
      content: emailDisplay,
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: hoursDisplay,
    },
  ];

  const contactInfo: ContactInfoItem[] = (Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : defaultContactInfo).map((item: any, index: number) => {
    const titleLower = (item.title || '').toLowerCase();
    const icon = titleLower.includes('phone') ? Phone : titleLower.includes('email') ? Mail : titleLower.includes('hour') || titleLower.includes('time') ? Clock : [Phone, Mail, Clock][index % 3];

    let contentText = item.description ?? item.content;
    if (!contentText || (titleLower.includes('phone') && (contentText === DEFAULTS.cards[0].description || !item.description))) {
      contentText = phoneDisplay;
    } else if (titleLower.includes('email') && (contentText === DEFAULTS.cards[1].description || !item.description)) {
      contentText = emailDisplay;
    } else if ((titleLower.includes('hour') || titleLower.includes('working')) && (contentText === DEFAULTS.cards[2].description || !item.description)) {
      contentText = hoursDisplay;
    }

    return {
      ...item,
      icon,
      content: contentText,
    };
  });

  const whatsappNum = content.contact_whatsapp || data.contact_whatsapp || phone1;
  const whatsAppUrl = getWhatsAppUrl(whatsappNum, 'Hello CampusMart team, I have an enquiry regarding institutional solutions.');
  const primaryPhone = sanitizePhone(phone1);

  const whatsappCtaTitle = data.whatsappCtaTitle ?? DEFAULTS.whatsappCtaTitle;
  const whatsappCtaSubtitle = data.whatsappCtaSubtitle ?? DEFAULTS.whatsappCtaSubtitle;
  const whatsappCtaButton = data.whatsappCtaButton ?? DEFAULTS.whatsappCtaButton;

  return (
    <main className="min-h-screen relative pb-16">
      {/* Hero Section */}
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-12 md:py-16 mt-4">
        <div className="w-full mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {data.heroTitle ?? DEFAULTS.heroTitle}
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {data.heroSubtitle ?? DEFAULTS.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="w-full mx-auto px-2 sm:px-4">
        <div className="flex flex-col">
          {/* Contact Form - Centered */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  ✅ Thank you! Your message has been sent. We'll get back to you shortly.
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">College / University Name *</label>
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="form-input"
                      placeholder="Name of Institution"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Authorised Person *</label>
                    <input
                      type="text"
                      value={formData.authorisedPerson}
                      onChange={(e) => setFormData({ ...formData, authorisedPerson: e.target.value })}
                      className="form-input"
                      placeholder="Principal / Director / HOD"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      pattern="(?:\+91[ -]?)?[6-9][0-9]{9}"
                      minLength={10}
                      maxLength={14}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                      className="form-input"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="labs">Labs</option>
                      <option value="techLabs">Tech Labs</option>
                      <option value="innovationLabs">Innovation Labs</option>
                      <option value="furnitures">Furnitures</option>
                      <option value="innovation">Innovation</option>
                      <option value="sportsTurfs">Sports Turfs</option>
                      <option value="generalEnquiry">General Enquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Full Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    placeholder="Physical address of the institution"
                    required
                  />
                </div>
                {subCategories[formData.category] && (
                  <div>
                    <label className="form-label">Sub-category *</label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="">Select a sub-category</option>
                      {subCategories[formData.category].map((subCategory) => (
                        <option key={subCategory} value={subCategory}>{subCategory}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="form-label">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input min-h-[150px] resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60 w-full justify-center">
                  <Send className="w-5 h-5" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info - Grid Below Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {contactInfo.map(({ icon: Icon, title, content: infoContent }) => {
              const isPhone = title.toLowerCase().includes('phone');
              return (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-cm-blue/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-cm-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-cm-blue-dark mb-2">{title}</h3>
                      <p className="text-gray-600 whitespace-pre-line text-sm">{infoContent}</p>
                    </div>
                  </div>
                  {isPhone && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-3">
                      <a
                        href={`tel:${primaryPhone.dial}`}
                        className="text-xs font-bold text-cm-blue hover:text-cm-blue-dark px-3 py-1.5 rounded-lg border border-cm-blue/20 hover:bg-cm-blue/5 transition-all inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-green-600 hover:text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-all inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 md:p-8 text-white max-w-2xl mx-auto w-full mt-10 shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <MessageCircle className="w-7 h-7" />
                <h3 className="text-xl font-bold">{whatsappCtaTitle}</h3>
              </div>
              <p className="text-white/90 text-sm max-w-md">
                {whatsappCtaSubtitle}
              </p>
            </div>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-bold shadow-md hover:bg-gray-50 hover:shadow-lg transition-all shrink-0 text-sm"
            >
              <MessageCircle className="w-4 h-4" /> {whatsappCtaButton}
            </a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#1EBE5D] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </main>
  );
};

export default ContactUs;
