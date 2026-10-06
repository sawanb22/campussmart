import { useState, useCallback } from 'react';
import { isMobileDevice, sanitizeEmail, sanitizePhone } from '@/lib/contact-actions';
import type { ContactModalState } from '@/components/ui/contact-action-modal';

export function useContactAction() {
  const [modalState, setModalState] = useState<ContactModalState>({
    isOpen: false,
    type: 'email',
    value: '',
    title: '',
    subject: '',
  });

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const triggerEmail = useCallback((rawEmail: string, subject = 'Campus Mart Enquiry', title?: string) => {
    const { email } = sanitizeEmail(rawEmail);
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    if (isMobileDevice()) {
      // Mobile phone directly opens native mail client
      window.location.href = mailtoUrl;
    } else {
      // Desktop: attempt native handler & display desktop fallback modal (Gmail / Copy)
      try {
        window.location.href = mailtoUrl;
      } catch {
        /* fallback below handles it */
      }
      setModalState({
        isOpen: true,
        type: 'email',
        value: email,
        title: title || 'Send an Email',
        subject,
      });
    }
  }, []);

  const triggerPhone = useCallback((rawPhone: string, title?: string) => {
    const { dial, display } = sanitizePhone(rawPhone);
    const telUrl = `tel:${dial}`;

    if (isMobileDevice()) {
      // Mobile phone directly triggers native dialer
      window.location.href = telUrl;
    } else {
      // Desktop: attempt native handler & display desktop fallback modal (WhatsApp Web / Copy)
      try {
        window.location.href = telUrl;
      } catch {
        /* fallback below handles it */
      }
      setModalState({
        isOpen: true,
        type: 'phone',
        value: display,
        title: title || 'Contact Phone Support',
      });
    }
  }, []);

  const triggerContact = useCallback((rawTarget: string, title?: string) => {
    if (!rawTarget) return;
    const isEmail = rawTarget.includes('@') || rawTarget.startsWith('mailto:');
    if (isEmail) {
      triggerEmail(rawTarget, 'Campus Mart Enquiry', title);
    } else {
      triggerPhone(rawTarget, title);
    }
  }, [triggerEmail, triggerPhone]);

  return {
    modalState,
    closeModal,
    triggerEmail,
    triggerPhone,
    triggerContact,
  };
}
