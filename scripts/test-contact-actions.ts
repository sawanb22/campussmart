import assert from 'node:assert';
import {
  sanitizeEmail,
  sanitizePhone,
  getGmailComposeUrl,
  getWhatsAppUrl,
  isMobileDevice,
} from '../src/lib/contact-actions';

console.log('--- Testing Contact Actions Utilities ---');

// 1. Email Sanitization & Validation
{
  const test1 = sanitizeEmail('info@campusmart.in');
  assert.strictEqual(test1.email, 'info@campusmart.in');
  assert.strictEqual(test1.isValid, true, 'Standard email should be valid');

  const test2 = sanitizeEmail('  HELLO@CampusMart.IN  ');
  assert.strictEqual(test2.email, 'hello@campusmart.in', 'Email should be trimmed and lowercased');
  assert.strictEqual(test2.isValid, true);

  const test3 = sanitizeEmail('mailto:contact@domain.com');
  assert.strictEqual(test3.email, 'contact@domain.com', 'mailto: prefix should be stripped');
  assert.strictEqual(test3.isValid, true);

  const test4 = sanitizeEmail('invalid-email-string');
  assert.strictEqual(test4.isValid, false, 'Invalid string should fail validation');
  assert.strictEqual(test4.email, 'info@campusmart.in', 'Should fallback to default email');

  const test5 = sanitizeEmail('<script>alert(1)</script>');
  assert.strictEqual(test5.isValid, false, 'XSS payload should fail validation');
  assert.strictEqual(test5.email, 'info@campusmart.in', 'Should fallback safely');

  console.log('✓ Email sanitization and validation tests passed');
}

// 2. Phone Sanitization & Validation
{
  const test1 = sanitizePhone('9966109191');
  assert.strictEqual(test1.dial, '+919966109191', '10-digit should default to +91 country code');
  assert.strictEqual(test1.whatsapp, '919966109191');
  assert.strictEqual(test1.isValid, true);

  const test2 = sanitizePhone('+91 9966 109 191');
  assert.strictEqual(test2.dial, '+919966109191', 'Spaces should be stripped from dial');
  assert.strictEqual(test2.whatsapp, '919966109191');
  assert.strictEqual(test2.isValid, true);

  const test3 = sanitizePhone('tel:+919866091111');
  assert.strictEqual(test3.dial, '+919866091111', 'tel: prefix should be cleanly handled');
  assert.strictEqual(test3.isValid, true);

  const test4 = sanitizePhone('call us on 9966109191');
  assert.strictEqual(test4.dial, '+919966109191', 'String prefix should be stripped to digits');
  assert.strictEqual(test4.isValid, true);

  const test5 = sanitizePhone('123');
  assert.strictEqual(test5.isValid, false, 'Short number should be marked invalid');
  assert.strictEqual(test5.dial, '+919966109191', 'Fallback to default dial');

  console.log('✓ Phone sanitization and validation tests passed');
}

// 3. Gmail Web Compose URL Generation
{
  const url1 = getGmailComposeUrl('info@campusmart.in', 'Institutional Quote', 'Hello team');
  assert(url1.startsWith('https://mail.google.com/mail/?'), 'Should target Gmail web compose');
  assert(url1.includes('to=info%40campusmart.in'), 'Should encode email');
  assert(url1.includes('su=Institutional+Quote'), 'Should encode subject');
  assert(url1.includes('body=Hello+team'), 'Should encode body');

  // XSS Defense test
  const urlXss = getGmailComposeUrl('"><script>alert(1)</script>');
  assert(!urlXss.includes('<script>'), 'Must not inject script tag into URL');

  console.log('✓ Gmail compose URL generator tests passed');
}

// 4. WhatsApp Web URL Generation
{
  const wa1 = getWhatsAppUrl('9966109191', 'Hi CampusMart');
  assert.strictEqual(wa1, 'https://wa.me/919966109191?text=Hi%20CampusMart');

  console.log('✓ WhatsApp URL generator tests passed');
}

console.log('All 4 test suites passed with 100% assertions!');
