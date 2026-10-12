import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import { MediaImage } from '@/components/ui/media-image';
import { resolveMediaUrl } from '@/lib/media-url';
import DOMPurify from 'dompurify';

const isVideoMedia = (url?: string) => Boolean(url && /\.(mp4|webm|mov|mkv|ogg)(\?.*)?$/i.test(url));

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'case-study';

interface CaseStudy {
  title: string;
  slug?: string;
  category?: string;
  description?: string;
  body?: string;
  image?: string;
  imageUrl?: string;
  active?: boolean;
}

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const { data: cataloguesPageData, loading: pageLoading } = usePageData<any>('catalogues');
  const [apiStudy, setApiStudy] = useState<CaseStudy | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const pageMatchedStudy = useMemo<CaseStudy | null>(() => {
    if (!slug) return null;
    const list: CaseStudy[] = Array.isArray(cataloguesPageData?.caseStudies)
      ? cataloguesPageData.caseStudies
      : [];
    const target = slug.toLowerCase();
    const cleanTarget = target.replace(/-\d+$/, '');
    const found = list.find((item) => {
      if (!item || item.active === false) return false;
      const itemSlug = (item.slug || slugify(item.title || '')).toLowerCase();
      return itemSlug === target || itemSlug === cleanTarget || slugify(item.title || '') === target;
    });
    return found || null;
  }, [cataloguesPageData, slug]);

  useEffect(() => {
    if (!slug || pageLoading || pageMatchedStudy) return;
    setApiLoading(true);
    api
      .get(`/case-studies/${slug}`)
      .then(({ data }) => setApiStudy(data))
      .catch(() => setApiStudy(null))
      .finally(() => setApiLoading(false));
  }, [slug, pageLoading, pageMatchedStudy]);

  const study = pageMatchedStudy || apiStudy;
  const loading = pageLoading || apiLoading;

  useEffect(() => {
    if (!study) return;
    const articleVideos = document.querySelectorAll('article video');
    articleVideos.forEach((v) => {
      if (!v.hasAttribute('controls')) {
        v.setAttribute('controls', 'true');
      }
    });
  }, [study]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!study) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600">Case study not found.</p>
        <Link to="/catalogues" className="btn-primary">
          Back to Catalogues
        </Link>
      </main>
    );
  }

  const mediaUrl = study.image || study.imageUrl || '';
  const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(study.body || '');

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/catalogues" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Catalogues
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {mediaUrl &&
            (isVideoMedia(mediaUrl) ? (
              <div className="w-full bg-black aspect-video max-h-[500px] overflow-hidden flex items-center justify-center">
                <video
                  src={resolveMediaUrl(mediaUrl)}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <MediaImage src={mediaUrl} alt={study.title} className="w-full max-h-[420px] object-cover" />
            ))}
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-cm-blue px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide mb-5">
              <BookOpen className="w-3 h-3" /> {study.category || 'Case Study'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-cm-blue-dark leading-tight mb-5">{study.title}</h1>
            {study.description && (
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-cm-blue pl-5 mb-8">
                {study.description}
              </p>
            )}
            {study.body &&
              (bodyIsHtml ? (
                <div
                  className="prose prose-slate max-w-none [&_video]:w-full [&_video]:rounded-xl [&_video]:aspect-video [&_video]:bg-black"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(study.body) }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{study.body}</div>
              ))}
          </div>
        </div>
      </article>
    </main>
  );
};

export default CaseStudyDetail;
