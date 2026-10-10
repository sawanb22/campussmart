import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { DEFAULTS } from './ugc-guidelines';

const slugify = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const UGCGuidelineArticle = () => {
  const { articleSlug } = useParams();
  const { data, loading } = usePageData<any>('ugc-guidelines');
  const cards = Array.isArray(data.cards) ? data.cards : (data.cards === undefined ? DEFAULTS.cards : []);
  const moreCards = Array.isArray(data.moreCards) ? data.moreCards : (data.moreCards === undefined ? DEFAULTS.moreCards : []);
  const allArticles = [...cards, ...moreCards];
  const article = allArticles.find(item => slugify(item.title) === articleSlug);

  if (loading) return <main className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" aria-label="Loading article" /></main>;
  if (!article) return <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4"><h1 className="text-3xl font-bold text-cm-blue-dark">Guidance not found</h1><Link to="/ugc-guidelines" className="btn-primary">Back to UGC Guidelines</Link></main>;

  const image = article.image;

  return (
    <main className="min-h-screen bg-[#f5f4ef] py-6 sm:py-10 font-opensans">
      <article className="mx-auto max-w-4xl px-4 sm:px-8">
        <Link to="/ugc-guidelines" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#155b51]">
          <ArrowLeft size={16} /> Back to UGC Guidelines
        </Link>
        <div className="overflow-hidden rounded-[20px] bg-[#f8f8f4] shadow-sm border border-[#e5ebe7]">
          {image && (
            <MediaImage src={image} alt={article.title} className="h-64 w-full object-cover sm:h-[400px]" />
          )}
          <div className="px-6 py-6 sm:px-10 sm:py-9">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#f47b20]">
              {article.category}{article.readTime ? ` · ${article.readTime}` : ''}
            </div>
            <h1 className="mb-5 font-poppins text-3xl font-bold leading-tight tracking-tight text-[#155b51] sm:text-5xl">
              {article.title}
            </h1>
            <p className="max-w-2xl border-l-2 border-[#f47b20] pl-5 text-base leading-relaxed text-[#173e39] sm:text-lg">
              {article.description || `Practical guidance for education teams working on ${article.category.toLowerCase()} across a modern campus.`}
            </p>
          </div>
        </div>
        <Link to="/ugc-guidelines" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#155b51]">
          Explore more guidance <ArrowRight size={15} />
        </Link>
      </article>
    </main>
  );
};

export default UGCGuidelineArticle;