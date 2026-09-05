import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Handshake } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { PARTNER_PAGE_SLUG, PARTNER_DEFAULTS, slugifyModelTitle } from './partner-with-colleges.data';

const PartnershipModelDetail = () => {
  const { modelSlug } = useParams();
  const { data, loading } = usePageData(PARTNER_PAGE_SLUG);
  const cards: any[] = data.cards?.length ? data.cards : PARTNER_DEFAULTS.cards;
  const card = cards.find((item) => slugifyModelTitle(item.title) === modelSlug);

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
        <p className="text-gray-600">That partnership model couldn't be found.</p>
        <Link to={`/${PARTNER_PAGE_SLUG}`} className="btn-primary">Back to Partnerships</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${PARTNER_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Partnerships
        </Link>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {image && <img src={image} alt={card.title} className="h-56 w-full object-cover sm:h-72" />}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cm-blue">
              <Handshake className="h-3 w-3" /> Partnership Model
            </div>
            <h1 className="mb-6 text-3xl font-bold leading-tight text-cm-blue-dark sm:text-4xl">{card.title}</h1>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">{card.description}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-cm-blue-dark to-cm-blue p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <p className="text-sm font-semibold text-white sm:text-base">Interested in the {card.title.toLowerCase()} model?</p>
          <Link to="/partnership" className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-6 py-3 text-sm font-bold">
            Submit Enquiry <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default PartnershipModelDetail;
