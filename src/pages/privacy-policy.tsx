import { usePageData } from '@/hooks/usePageData';

const PrivacyPolicy = () => {
  const { data } = usePageData('privacy-policy');
  const heroTitle = data.heroTitle ?? 'Privacy Policy';

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
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">1. Introduction</h2>
              <p>Campus Mart ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">2. Information We Collect</h2>
              <p>We may collect personal information that you voluntarily provide to us, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Institution details</li>
                <li>Payment information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide and maintain our services</li>
                <li>Process your orders and requests</li>
                <li>Communicate with you about our services</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">4. Information Sharing</h2>
              <p>We do not sell or rent your personal information to third parties. We may share your information with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Service providers who assist us in operating our business</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">Email: privacy@campusmart.in</p>
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

export default PrivacyPolicy;
