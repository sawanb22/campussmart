import { usePageData } from '@/hooks/usePageData';

const ReplacementReturn = () => {
  const { data } = usePageData('replacement-return');
  const heroTitle = data.heroTitle ?? 'Replacement & Return Policy';

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
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">1. Overview</h2>
              <p>At Campus Mart, we strive to ensure that every product delivered meets our high standards of quality. However, if you receive a product that is damaged or defective, we are committed to resolving the issue through our replacement policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">2. Conditions for Replacement</h2>
              <p>Replacements will only be considered under the following circumstances:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Products received in a physically damaged condition.</li>
                <li>Products that have missing parts or accessories.</li>
                <li>Products that are different from what was ordered.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">3. Reporting an Issue</h2>
              <p>Any damage or discrepancy must be reported within 48 hours of delivery. Please provide photographic evidence of the damage and your order details to our support team at info@campusmart.in.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">4. Return Process</h2>
              <p>Once your request is approved, we will arrange for the collection of the damaged item. Please ensure the product is in its original packaging with all manuals and accessories included.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-cm-blue-dark mb-3">5. Non-Returnable Items</h2>
              <p>Custom-made furniture, specially ordered equipment, and digital software solutions are generally non-returnable unless they possess a manufacturing defect.</p>
            </section>
            </>}

            <p className="text-sm text-gray-500 mt-8">Last updated: {data.lastUpdated ?? 'March 2024'}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReplacementReturn;
