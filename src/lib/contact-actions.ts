/**
 * Contact Action Utilities
 * Robust sanitization, device detection, and URL generation for Email, Phone & WhatsApp.
 */

export interface SanitizedPhone {
  display: string;
  dial: string;
  whatsapp: string;
  isValid: boolean;
}

export interface SanitizedEmail {
  email: string;
  isValid: boolean;
}

const DEFAULT_PHONE = '+91 9966109191';
const DEFAULT_EMAIL = 'info@campusmart.in';

/**
 * Sanitizes and validates an email string.
 * Prevents protocol injection and XSS.
 */
export function sanitizeEmail(raw?: string | null): SanitizedEmail {
  if (!raw || typeof raw !== 'string') {
    return { email: DEFAULT_EMAIL, isValid: true };
  }
  const cleaned = raw.replace(/^mailto:/i, '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(cleaned);
  return {
    email: isValid ? cleaned : DEFAULT_EMAIL,
    isValid,
  };
}

/**
 * Sanitizes phone numbers for display, direct tel: dial, and WhatsApp web.
 */
export function sanitizePhone(raw?: string | null): SanitizedPhone {
  if (!raw || typeof raw !== 'string') {
    return { display: DEFAULT_PHONE, dial: '+919966109191', whatsapp: '919966109191', isValid: true };
  }
  let firstSegment = raw.replace(/^tel:/i, '').trim();
  if (/[,;\n\r]/.test(firstSegment)) {
    const parts = firstSegment.split(/[,;\n\r]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      firstSegment = parts[0];
    }
  }

  const hasPlus = firstSegment.startsWith('+');
  const digits = firstSegment.replace(/\D/g, '');

  if (!digits || digits.length < 8) {
    return { display: DEFAULT_PHONE, dial: '+919966109191', whatsapp: '919966109191', isValid: false };
  }

  let formattedDial: string;
  let formattedWhatsApp: string;
  let formattedDisplay: string;

  if (digits.length === 10) {
    formattedDisplay = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    formattedDial = `+91${digits}`;
    formattedWhatsApp = `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    formattedDisplay = `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
    formattedDial = `+${digits}`;
    formattedWhatsApp = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    const local = digits.slice(1);
    formattedDisplay = `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
    formattedDial = `+91${local}`;
    formattedWhatsApp = `91${local}`;
  } else if (hasPlus) {
    formattedDisplay = `+${digits}`;
    formattedDial = `+${digits}`;
    formattedWhatsApp = digits;
  } else {
    formattedDisplay = `+${digits}`;
    formattedDial = `+${digits}`;
    formattedWhatsApp = digits;
  }

  return {
    display: formattedDisplay,
    dial: formattedDial,
    whatsapp: formattedWhatsApp,
    isValid: true,
  };
}

/**
 * Detects whether the client is on a mobile device (touch / native dialer capable).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
  return mobileRegex.test(userAgent) || (window.innerWidth <= 768 && 'ontouchstart' in window);
}

/**
 * Generates official Gmail Web compose URL with pre-filled recipient.
 */
export function getGmailComposeUrl(email: string, subject = 'Campus Mart Enquiry', body = ''): string {
  const sanitized = sanitizeEmail(email).email;
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: sanitized,
  });
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Generates WhatsApp Web / App chat URL.
 */
export function getWhatsAppUrl(phone: string, text = 'Hello, I have an enquiry regarding Campus Mart solutions.'): string {
  const sanitized = sanitizePhone(phone).whatsapp;
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(text)}`;
}

/**
 * Safe clipboard copy with fallback for older browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
