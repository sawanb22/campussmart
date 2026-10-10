import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Armchair } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { FURNITURE_DESIGN_PAGE_SLUG, FURNITURE_DESIGN_DEFAULTS, slugifyFurnitureDesignTitle } from './campus-furniture-design.data';

const CampusFurnitureDesignDetail = () => {
  const { rangeSlug } = useParams();
  const { data, loading } = usePageData(FURNITURE_DESIGN_PAGE_SLUG);
  const cards = Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : FURNITURE_DESIGN_DEFAULTS.cards;
  const normalizedSlug = (rangeSlug || '').toLowerCase().trim();
  const card = cards.find((item: any) =>
    (item.slug && item.slug.toLowerCase() === normalizedSlug) ||
    slugifyFurnitureDesignTitle(item.title) === normalizedSlug ||
    slugifyFurnitureDesignTitle(item.title).replace(/-/g, '') === normalizedSlug.replace(/-/g, '')
  );

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
        <p className="text-gray-600">That furniture range couldn't be found.</p>
        <Link to={`/${FURNITURE_DESIGN_PAGE_SLUG}`} className="btn-primary">Back to Furniture Design</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  return (
    <main className="min-h-screen bg-stone-50 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${FURNITURE_DESIGN_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Furniture Design
        </Link>
        <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
          {image && <img src={image} alt={card.title} className="h-56 w-full object-cover sm:h-72" />}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
              <Armchair className="h-3 w-3" /> {card.categories?.[0] ?? 'Furniture'}
            </div>
            <h1 className="font-playfair mb-6 text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">{card.title}</h1>
            {card.description && <p className="whitespace-pre-wrap text-lg leading-relaxed text-stone-600">{card.description}</p>}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-stone-900 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <p className="text-sm font-semibold text-white sm:text-base">Want {card.title.toLowerCase()} on your campus?</p>
          <Link to="/request-quote" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
};

export default CampusFurnitureDesignDetail;
