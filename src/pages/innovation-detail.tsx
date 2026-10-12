import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import {
  INNOVATION_PAGE_SLUG,
  INNOVATION_DEFAULTS,
  slugifyInnovationTitle,
  type InnovationCard,
  type MoreCard,
} from './innovation.data';

const InnovationDetail = () => {
  const { trackSlug } = useParams();
  const { data, loading } = usePageData<any>(INNOVATION_PAGE_SLUG);
  const cards: InnovationCard[] = Array.isArray(data.cards) && data.cards.length > 0
    ? data.cards
    : INNOVATION_DEFAULTS.cards;
  const moreCards: MoreCard[] = Array.isArray(data.moreCards) && data.moreCards.length > 0
    ? data.moreCards
    : INNOVATION_DEFAULTS.moreCards;
  const rawFeatured = { ...INNOVATION_DEFAULTS.featured, ...(data.featured ?? {}) };

  const featuredArticle: InnovationCard = {
    title: rawFeatured.title,
    description: rawFeatured.description,
    category: rawFeatured.eyebrow || 'Featured Innovation Hub',
    readTime: '6 min read',
    image: rawFeatured.image,
  };

  const moreArticles: InnovationCard[] = moreCards.map((card) => ({
    title: card.title,
    description: card.description || `Practical guidance for education teams establishing ${card.category.toLowerCase()} across an innovation hub.`,
    category: card.category,
    readTime: '4 min read',
    image: card.image || '',
  }));

  const defaultMoreArticles: InnovationCard[] = INNOVATION_DEFAULTS.moreCards.map((card) => ({
    title: card.title,
    description: card.description || `Practical guidance for education teams establishing ${card.category.toLowerCase()} across an innovation hub.`,
    category: card.category,
    readTime: '4 min read',
    image: card.image || '',
  }));

  const matchesTrack = (item: InnovationCard) => {
    if (!item) return false;
    const hrefSlug = item.href ? item.href.replace(/^\/innovation\//, '').trim() : '';
    return (
      item.slug === trackSlug ||
      hrefSlug === trackSlug ||
      slugifyInnovationTitle(item.title) === trackSlug
    );
  };

  const defaultArticles: InnovationCard[] = [featuredArticle, ...INNOVATION_DEFAULTS.cards, ...defaultMoreArticles];
  const fallback = defaultArticles.find(matchesTrack);
  const allArticles: InnovationCard[] = [featuredArticle, ...cards, ...moreArticles];
  const article = allArticles.find(
    (item) => matchesTrack(item) || (fallback && item.title === fallback.title)
  );
  const resolvedArticle = article ? { ...(fallback || {}), ...article } : fallback;

  if (loading && !resolvedArticle) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" />
      </main>
    );
  }

  if (!resolvedArticle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-800">Track not found</h1>
        <p className="text-gray-600">That innovation programme track couldn't be found.</p>
        <Link to={`/${INNOVATION_PAGE_SLUG}`} className="btn-primary">Back to Innovation Hub</Link>
      </main>
    );
  }

  const image = resolvedArticle.image || fallback?.image || rawFeatured.image;
  const categoryTag = resolvedArticle.category || (resolvedArticle.categories?.[0]) || 'Innovation';

  return (
    <main className="min-h-screen bg-[#faf8f0] py-8 sm:py-14">
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          to={`/${INNOVATION_PAGE_SLUG}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#155b51] hover:text-[#f47b20] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Innovation Hub
        </Link>
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          {image && (
            <MediaImage
              src={image}
              alt={resolvedArticle.title}
              className="h-64 w-full object-cover sm:h-[420px]"
            />
          )}
          <div className="p-6 sm:p-10">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#dfe9e4] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#155b51]">
              <Lightbulb className="h-3.5 w-3.5" /> {categoryTag}
            </div>
            <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#155b51] sm:text-4xl">
              {resolvedArticle.title}
            </h1>
            {resolvedArticle.description && (
              <p className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-[#50615b]">
                {resolvedArticle.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl bg-[#155b51] p-6 text-center sm:flex-row sm:p-8 sm:text-left shadow-lg">
          <div>
            <p className="text-lg font-bold text-white">Want to bring {resolvedArticle.title.toLowerCase()} to your campus?</p>
            <p className="text-xs text-[#a3c9c1] mt-1">Talk to our team about setting up tailored maker labs, curriculum mapping and mentor pipelines.</p>
          </div>
          <Link
            to="/partnership"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#f47b20] px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-105 shadow-md"
          >
            Partner With Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default InnovationDetail;
