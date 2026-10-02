import { usePageData } from '@/hooks/usePageData';

const PaymentPolicy = () => {
  const { data } = usePageData('payment-policy');
  const heroTitle = data.heroTitle ?? 'Payment Policy';

  return (
    <main className="min-h-screen bg-cm-gray py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-cm-blue-dark mb-6">{heroTitle}</h1>

          <div className="space-y-6 text-gray-700">
            {Array.isArray(data.sections) ? data.sections.map((section: any) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-cm-blue-dark mb-3">{section.heading}</h2>
                <p className="whitespace-pre-line">{section.body}</p>
                {section.bullets?.length ? <ul className="list-disc pl-6 mt-2 space-y-1">{section.bullets.map((bullet: string) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              </section>
            )) : <>
            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">1. Payment Methods</h2>
              <p>We accept various payment methods including Credit/Debit Cards, Net Banking, and UPI through our secure payment gateway partners.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">2. Currency</h2>
              <p>All transactions are processed in Indian Rupees (INR) unless otherwise explicitly specified in the order quotation.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">3. Billing and Taxes</h2>
              <p>GST will be applied as per the prevailing government regulations. A detailed tax invoice will be provided for all purchases.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">4. Security</h2>
              <p>We do not store your credit card or sensitive financial information on our servers. All payments are handled by certified third-party payment processors.</p>
            </section>
            </>}

            <p className="text-sm text-gray-500 mt-8">Last updated: {data.lastUpdated ?? 'March 2024'}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPolicy;
