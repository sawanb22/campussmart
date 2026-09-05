import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { SPORTS_INFRASTRUCTURE_PAGE_SLUG, SPORTS_INFRASTRUCTURE_DEFAULTS, slugifySportsInfrastructureTitle } from './sports-infrastructure.data';

const SportsInfrastructureDetail = () => {
  const { facilitySlug } = useParams();
  const { data, loading } = usePageData(SPORTS_INFRASTRUCTURE_PAGE_SLUG);
  const cards = data.cards?.length ? data.cards : SPORTS_INFRASTRUCTURE_DEFAULTS.cards;
  const card = cards.find((item: any) => slugifySportsInfrastructureTitle(item.title) === facilitySlug);

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
        <p className="text-gray-600">That facility couldn't be found.</p>
        <Link to={`/${SPORTS_INFRASTRUCTURE_PAGE_SLUG}`} className="btn-primary">Back to Sports Infrastructure</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  return (
    <main className="min-h-screen bg-[#f5f8e8] py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${SPORTS_INFRASTRUCTURE_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-black/70 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to Sports Infrastructure
        </Link>
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
          {image && <img src={image} alt={card.title} className="h-56 w-full object-cover sm:h-72" />}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#d9f68b] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
              <Trophy className="h-3 w-3" /> {card.categories?.[0] ?? 'Facility'}
            </div>
            <h1 className="font-grotesk mb-6 text-3xl font-bold uppercase leading-[0.95] tracking-tight text-[#090909] sm:text-4xl">{card.title}</h1>
            {card.description && <p className="whitespace-pre-wrap text-lg leading-relaxed text-black/65">{card.description}</p>}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.75rem] bg-[#090909] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <p className="text-sm font-semibold text-white sm:text-base">Want {card.title.toLowerCase()} on your campus?</p>
          <Link to="/sports-infra" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#d9f68b] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-white">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default SportsInfrastructureDetail;
