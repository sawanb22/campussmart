import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import {
  INNOVATION_PAGE_SLUG,
  slugifyInnovationTitle,
  type InnovationCard,
  type MoreCard,
} from './innovation.data';

const InnovationDetail = () => {
  const { trackSlug } = useParams();
  const { data, loading } = usePageData<any>(INNOVATION_PAGE_SLUG);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f0] py-8 sm:py-14 animate-pulse">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-8 h-5 w-44 rounded bg-stone-200" />
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div className="h-64 w-full bg-stone-200 sm:h-[420px]" />
            <div className="p-6 sm:p-10 space-y-4">
              <div className="h-6 w-28 rounded-full bg-stone-200" />
              <div className="h-9 w-3/4 rounded-lg bg-stone-200" />
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-5/6 rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const cards: InnovationCard[] = Array.isArray(data.cards) ? data.cards : [];
  const moreCards: MoreCard[] = Array.isArray(data.moreCards) ? data.moreCards : [];
  const rawFeatured = data.featured ?? {};

  const featuredArticle: InnovationCard | null = rawFeatured.title
    ? {
        title: rawFeatured.title,
        description: rawFeatured.description,
        category: rawFeatured.eyebrow || 'Featured Innovation Hub',
        readTime: '6 min read',
        image: rawFeatured.image,
        href: rawFeatured.href,
      }
    : null;

  const moreArticles: InnovationCard[] = moreCards.map((card) => ({
    title: card.title,
    description: card.description || `Practical guidance for education teams establishing ${card.category.toLowerCase()} across an innovation hub.`,
    category: card.category,
    readTime: '4 min read',
    image: card.image || '',
    href: card.href,
  }));

  const matchesTrack = (item: InnovationCard) => {
    if (!item || !item.title) return false;
    const hrefSlug = item.href ? item.href.replace(/^\/innovation\//, '').trim() : '';
    return (
      item.slug === trackSlug ||
      hrefSlug === trackSlug ||
      slugifyInnovationTitle(item.title) === trackSlug
    );
  };

  const allArticles: InnovationCard[] = [
    ...(featuredArticle ? [featuredArticle] : []),
    ...cards,
    ...moreArticles,
  ];
  const resolvedArticle = allArticles.find(matchesTrack);

  if (!resolvedArticle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-800">Track not found</h1>
        <p className="text-gray-600">That innovation programme track couldn't be found.</p>
        <Link to={`/${INNOVATION_PAGE_SLUG}`} className="btn-primary">Back to Innovation Hub</Link>
      </main>
    );
  }

  const image = resolvedArticle.image || rawFeatured.image;
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
