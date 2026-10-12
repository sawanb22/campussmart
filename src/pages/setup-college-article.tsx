import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { DEFAULTS, type SetupArticle } from './setup-college';

const slugify = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const SetupCollegeArticle = () => {
  const { articleSlug } = useParams();
  const { data, loading } = usePageData<any>('setup-college');
  const cards: SetupArticle[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const rawFeatured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };
  const rawSmallFeature = { ...DEFAULTS.smallFeature, ...(data.smallFeature ?? {}) };

  const featuredArticle: SetupArticle = {
    title: rawFeatured.title,
    description: 'Comprehensive strategies and actionable steps for planning and building a world-class higher education campus in India.',
    category: rawFeatured.category || 'Planning · Campus Setup',
    readTime: '08 MIN READ',
    image: rawFeatured.image,
  };

  const smallFeatureArticle: SetupArticle = {
    title: rawSmallFeature.title,
    description: 'Practical architectural and spatial design principles to cultivate high-performance academic and student living spaces.',
    category: rawSmallFeature.category || 'Infrastructure · Campus Life',
    readTime: '05 MIN READ',
    image: rawSmallFeature.image,
  };

  const fallbackArticles: SetupArticle[] = [featuredArticle, smallFeatureArticle, ...DEFAULTS.cards];
  const fallback = fallbackArticles.find((c) => slugify(c.title) === articleSlug);
  const allArticles: SetupArticle[] = [featuredArticle, smallFeatureArticle, ...cards];
  const article = allArticles.find(
    (item) => slugify(item.title) === articleSlug || (fallback && item.title === fallback.title)
  );
  const resolvedArticle = article ? { ...(fallback || {}), ...article } : fallback;

  if (loading && !resolvedArticle) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" aria-label="Loading guide" />
      </main>
    );
  }

  if (!resolvedArticle) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <h1 className="text-3xl font-bold text-cm-blue-dark">Guide not found</h1>
        <Link to="/setup-college" className="btn-primary">Back to Setup College</Link>
      </main>
    );
  }

  const image = resolvedArticle.image || fallback?.image || DEFAULTS.featured.image;

  return (
    <main className="setup-college-article-page min-h-screen bg-[#faf8f0] py-10 sm:py-16">
      <article className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link
          to="/setup-college"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#3d718f] hover:text-[#3c2f26]"
        >
          <ArrowLeft size={16} /> Back to Setup College
        </Link>
        <div className="overflow-hidden rounded-lg bg-[#fffdf8] shadow-sm">
          {image && (
            <MediaImage
              src={image}
              alt={resolvedArticle.title}
              className="h-64 w-full object-cover sm:h-[440px]"
            />
          )}
          <div className="px-6 py-8 sm:px-12 sm:py-12">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ed9816]">
              {resolvedArticle.category}
            </div>
            <h1 className="mb-6 font-serif text-4xl font-medium leading-tight tracking-tight text-[#3c2f26] sm:text-6xl">
              {resolvedArticle.title}
            </h1>
            <p className="max-w-2xl border-l-2 border-[#ed9816] pl-5 text-base leading-8 text-[#695e56] sm:text-lg">
              {resolvedArticle.description || `A practical ${resolvedArticle.category?.toLowerCase() || 'campus'} guide for planning and building a stronger college campus.`}
            </p>
            {resolvedArticle.readTime && (
              <div className="mt-8 flex items-center justify-between border-t border-[#3c2f26]/10 pt-5 text-xs uppercase tracking-[0.12em] text-[#89614d]">
                <span>{resolvedArticle.category}</span>
                <span>{resolvedArticle.readTime}</span>
              </div>
            )}
          </div>
        </div>
        <Link
          to="/setup-college"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3c2f26]"
        >
          Explore more guides <ArrowRight size={15} />
        </Link>
      </article>
    </main>
  );
};

export default SetupCollegeArticle;