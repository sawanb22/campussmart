import { usePageData } from '@/hooks/usePageData';

const TermsOfUse = () => {
  const { data } = usePageData('terms-of-use');
  const heroTitle = data.heroTitle ?? 'Terms of Use';

  return (
    <main className="min-h-screen bg-cm-gray py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-cm-blue-dark mb-2">{heroTitle}</h1>

          <div className="space-y-6 text-gray-700">
            {Array.isArray(data.sections) ? data.sections.map((section: any) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-cm-blue-dark mb-3">{section.heading}</h2>
                <p className="whitespace-pre-line">{section.body}</p>
                {section.bullets?.length ? <ul className="list-disc pl-6 mt-2 space-y-1">{section.bullets.map((bullet: string) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              </section>
            )) : <>
            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using the Campus Mart website and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">2. Use of Services</h2>
              <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use our services in any way that violates applicable laws</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Transmit any harmful or malicious content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">3. Account Registration</h2>
              <p>To access certain features, you may need to create an account. You are responsible for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">4. Intellectual Property</h2>
              <p>All content on our website, including text, graphics, logos, and images, is the property of Campus Mart or its licensors and is protected by copyright and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">5. Product Information</h2>
              <p>We strive to provide accurate product information, but we do not warrant that product descriptions, pricing, or other content is accurate, complete, or current. Prices and availability are subject to change without notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">6. Limitation of Liability</h2>
              <p>Campus Mart shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">7. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">8. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">9. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us:</p>
              <p className="mt-2">Email: legal@campusmart.in</p>
              <p>Phone: +91 9966109191</p>
            </section>
            </>}

            <p className="text-sm text-gray-500 mt-8">Last updated: {data.lastUpdated ?? 'January 2025'}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsOfUse;
