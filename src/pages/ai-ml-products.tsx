import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Shop from '@/pages/shop';
import { usePageData } from '@/hooks/usePageData';

const DEFAULTS = {
  heroTitle: 'AI/ML Products',
  heroSubtitle: 'Explore AI and machine learning hardware and platforms for modern campuses.',
};

const AIMLProducts = () => {
  const { data } = usePageData('ai-ml-products');
  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;

  return (
    <main className="min-h-screen bg-cm-gray">
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 mt-4 rounded-[2rem] px-6 py-10 text-white shadow-inner">
        <div className="max-w-6xl mx-auto">
          <Link to="/ai-ml" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to AI &amp; ML
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{heroTitle}</h1>
          <p className="mt-3 max-w-2xl text-white/85">{heroSubtitle}</p>
        </div>
      </section>
      <Shop categoryPage="ai-ml" hideCategorySidebar />
    </main>
  );
};

export default AIMLProducts;
