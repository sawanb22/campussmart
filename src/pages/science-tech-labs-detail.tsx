import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FlaskConical } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { SCIENCE_TECH_LABS_PAGE_SLUG, SCIENCE_TECH_LABS_DEFAULTS, slugifyScienceLabTitle } from './science-tech-labs.data';

const ScienceTechLabsDetail = () => {
  const { labSlug } = useParams();
  const { data, loading } = usePageData(SCIENCE_TECH_LABS_PAGE_SLUG);
  const cards = data.cards?.length ? data.cards : SCIENCE_TECH_LABS_DEFAULTS.cards;
  const card = cards.find((item: any) => slugifyScienceLabTitle(item.title) === labSlug);

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
        <p className="text-gray-600">That lab couldn't be found.</p>
        <Link to={`/${SCIENCE_TECH_LABS_PAGE_SLUG}`} className="btn-primary">Back to Science &amp; Tech Labs</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${SCIENCE_TECH_LABS_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Science &amp; Tech Labs
        </Link>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {image && <img src={image} alt={card.title} className="h-56 w-full object-cover sm:h-72" />}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-600">
              <FlaskConical className="h-3 w-3" /> {card.categories?.[0] ?? 'Labs'}
            </div>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-cm-blue-dark sm:text-4xl">{card.title}</h1>
            {card.description && <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">{card.description}</p>}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-cm-blue-dark p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <p className="text-sm font-semibold text-white sm:text-base">Want {card.title.toLowerCase()} on your campus?</p>
          <Link to="/contact-us" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-600">
            Contact Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default ScienceTechLabsDetail;
