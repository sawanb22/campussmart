import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { DIGITAL_TRANSFORMATION_PAGE_SLUG, DIGITAL_TRANSFORMATION_DEFAULTS, slugifyDigitalTransformationCard } from './digital-transformation';

const DigitalTransformationDetail = () => {
  const { cardSlug } = useParams();
  const { data, loading } = usePageData(DIGITAL_TRANSFORMATION_PAGE_SLUG);
  const cards = Array.isArray(data.section2Cards) ? data.section2Cards : DIGITAL_TRANSFORMATION_DEFAULTS.section2Cards;
  const card = cards.find((item: any) => slugifyDigitalTransformationCard(item.title) === cardSlug);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" />
      </main>
    );
  }

  if (!card) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600">That item couldn't be found.</p>
        <Link to={`/${DIGITAL_TRANSFORMATION_PAGE_SLUG}`} className="btn-primary">Back to Digital Transformation</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${DIGITAL_TRANSFORMATION_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Digital Transformation
        </Link>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {image && <img src={image} alt={card.title} className="h-56 w-full object-cover sm:h-72" />}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cm-blue">
              <Sparkles className="h-3 w-3" /> Why Go Digital
            </div>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-cm-blue-dark sm:text-4xl">{card.title}</h1>
            {card.description && <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">{card.description}</p>}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-cm-blue-dark p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <p className="text-sm font-semibold text-white sm:text-base">Have a digital transformation project in mind?</p>
          <Link to="/contact-us" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-cm-yellow px-6 py-3 text-sm font-bold text-cm-blue-dark transition-colors hover:brightness-95">
            Start The Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default DigitalTransformationDetail;
