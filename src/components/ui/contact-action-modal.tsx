import { useState, useEffect } from 'react';
import { Mail, Phone, Copy, Check, ExternalLink, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  sanitizeEmail,
  sanitizePhone,
  getGmailComposeUrl,
  getWhatsAppUrl,
  copyToClipboard,
} from '@/lib/contact-actions';

export type ContactModalType = 'email' | 'phone';

export interface ContactModalState {
  isOpen: boolean;
  type: ContactModalType;
  value: string;
  title?: string;
  subject?: string;
}

interface ContactActionModalProps {
  state: ContactModalState;
  onClose: () => void;
}

export default function ContactActionModal({ state, onClose }: ContactActionModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!state.isOpen) {
      setCopied(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  const isEmail = state.type === 'email';
  const emailData = isEmail ? sanitizeEmail(state.value) : null;
  const phoneData = !isEmail ? sanitizePhone(state.value) : null;

  const displayTarget = isEmail ? emailData?.email : phoneData?.display;
  const rawDial = phoneData?.dial;

  const handleCopy = async () => {
    const textToCopy = isEmail ? (emailData?.email || '') : (phoneData?.display || '');
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpenNative = () => {
    if (isEmail && emailData) {
      window.location.href = `mailto:${emailData.email}?subject=${encodeURIComponent(state.subject || 'Campus Mart Enquiry')}`;
    } else if (phoneData) {
      window.location.href = `tel:${rawDial}`;
    }
  };

  const handleOpenGmail = () => {
    if (emailData) {
      const url = getGmailComposeUrl(emailData.email, state.subject || 'Campus Mart Enquiry');
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const handleOpenWhatsApp = () => {
    if (phoneData) {
      const url = getWhatsAppUrl(phoneData.whatsapp);
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform-gpu animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isEmail ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isEmail ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                {state.title || (isEmail ? 'Send us an Email' : 'Contact Support & Sales')}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate max-w-[240px]">
                {displayTarget}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Options */}
        <div className="p-6 space-y-3">
          {isEmail ? (
            <>
              {/* Option 1: Gmail Web (The tester PC savior) */}
              <button
                type="button"
                onClick={handleOpenGmail}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm shadow-md hover:from-red-600 hover:to-rose-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">Open in Gmail Web</div>
                    <div className="text-[11px] font-normal text-white/80">Composes in browser tab (no app needed)</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 2: Default OS Mail App (Outlook, Thunderbird, Mail) */}
              <button
                type="button"
                onClick={handleOpenNative}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">Open Desktop Mail App</div>
                    <div className="text-[11px] font-normal text-slate-500">Outlook, Windows Mail, Thunderbird</div>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Option 1: WhatsApp Web */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm shadow-md hover:bg-[#20ba59] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">Chat on WhatsApp Web</div>
                    <div className="text-[11px] font-normal text-white/85">Instant chat & call assistance</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 2: Desktop Call / Teams / Skype */}
              <button
                type="button"
                onClick={handleOpenNative}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">Call via Desktop App</div>
                    <div className="text-[11px] font-normal text-slate-500">Teams, Skype, or Phone Link</div>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Copy to Clipboard */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied {displayTarget} to clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy {isEmail ? 'Email' : 'Number'} to Clipboard</span>
              </>
            )}
          </button>
        </div>

        {/* Footer with Contact Form link */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Need immediate quotation?</span>
          <Link
            to="/contact-us"
            onClick={onClose}
            className="font-bold text-cm-blue hover:underline"
          >
            Go to Contact Form &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
