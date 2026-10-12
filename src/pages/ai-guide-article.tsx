import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { DEFAULTS, type Article } from './ai-guide';

const slugify = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const AIGuideArticle = () => {
  const { articleSlug } = useParams();
  const { data, loading } = usePageData<any>('ai-guide');
  const defaultArticles = [{ ...DEFAULTS.featured, readTime: '' }, ...DEFAULTS.cards];
  const fallback = defaultArticles.find((c) => slugify(c.title) === articleSlug);
  const cards: Article[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const featured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };
  const articles = [{ ...featured, readTime: '' }, ...cards];
  const article = articles.find((item) => slugify(item.title) === articleSlug || (fallback && item.title === fallback.title));
  const resolvedArticle = article ? { ...(fallback || {}), ...article } : fallback;

  if (loading && !resolvedArticle) {
    return <main className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" aria-label="Loading article" /></main>;
  }

  if (!resolvedArticle) {
    return <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4"><h1 className="text-3xl font-bold text-cm-blue-dark">Article not found</h1><Link to="/ai-guide" className="btn-primary">Back to AI Guide</Link></main>;
  }

  return (
    <main className="ai-guide-article-page min-h-screen bg-[#faf8f0] py-10 sm:py-16">
      <article className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link to="/ai-guide" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#3d718f] hover:text-[#3c2f26]"><ArrowLeft size={16} /> Back to AI Guide</Link>
        <div className="overflow-hidden rounded-lg bg-[#fffdf8] shadow-sm">
          <MediaImage src={resolvedArticle.image} alt={resolvedArticle.title} className="h-64 w-full object-cover sm:h-[440px]" />
          <div className="px-6 py-8 sm:px-12 sm:py-12">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ed9816]">{resolvedArticle.category}</div>
            <h1 className="mb-6 font-serif text-4xl font-medium leading-tight tracking-tight text-[#3c2f26] sm:text-6xl">{resolvedArticle.title}</h1>
            <p className="max-w-2xl border-l-2 border-[#ed9816] pl-5 text-base leading-8 text-[#695e56] sm:text-lg">{resolvedArticle.description}</p>
            {resolvedArticle.readTime && <div className="mt-8 flex items-center justify-between border-t border-[#3c2f26]/10 pt-5 text-xs uppercase tracking-[0.12em] text-[#89614d]"><span>{resolvedArticle.category}</span><span>{resolvedArticle.readTime}</span></div>}
          </div>
        </div>
        <Link to="/ai-guide" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3c2f26]">Explore more insights <ArrowRight size={15} /></Link>
      </article>
    </main>
  );
};

export default AIGuideArticle;