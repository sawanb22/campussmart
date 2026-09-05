import Shop from '@/pages/shop';
import { usePageData } from '@/hooks/usePageData';

const DEFAULTS = {
  heroTitle: 'Tech Infrastructure Products',
  heroSubtitle: 'Explore networking, display, and security products for campus technology infrastructure.',
};

const TechInfraProducts = () => {
  const { data } = usePageData('tech-infra-products');
  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;

  return (
    <main className="min-h-screen bg-cm-gray">
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 mt-4 rounded-[2rem] px-6 py-10 text-white shadow-inner">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">{heroTitle}</h1>
          <p className="mt-3 max-w-2xl text-white/85">{heroSubtitle}</p>
        </div>
      </section>
      <Shop categoryPage="tech-infra" hideCategorySidebar />
    </main>
  );
};

export default TechInfraProducts;
