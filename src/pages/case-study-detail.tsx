import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '@/api/client';
import { MediaImage } from '@/components/ui/media-image';
import { resolveMediaUrl } from '@/lib/media-url';

const isVideoMedia = (url?: string) => Boolean(url && /\.(mp4|webm|mov|mkv|ogg)(\?.*)?$/i.test(url));

interface CaseStudy {
  title: string;
  description?: string;
  body?: string;
  imageUrl?: string;
}

const STATIC_CASE_STUDIES: Record<string, CaseStudy> = {
  'campus-master-planning': {
    title: 'Campus Master Planning',
    description: 'Complete campus transformation for a leading university in Bangalore.',
    body: 'CampusMart delivered a comprehensive campus master planning and infrastructure overhaul, optimizing learning spaces, faculty areas, and technology-enabled learning centers across 45 acres.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  '20-stunning-college-buildings': {
    title: '20 Stunning College Buildings',
    description: 'Showcase of our most innovative campus architecture projects.',
    body: 'A portfolio of 20 architectural landmarks engineered to harmonize aesthetic excellence, sustainable materials, and contemporary pedagogical requirements.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  'stem-lab-implementation': {
    title: 'STEM Lab Implementation',
    description: 'State-of-the-art STEM lab setup for a prestigious school chain.',
    body: 'Complete turnkey rollout of advanced robotics, sensor stations, and modular maker tables for 12 campus locations across India.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
};

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.get(`/case-studies/${slug}`)
      .then(({ data }) => setStudy(data))
      .catch((requestError) => {
        const cleanSlug = slug.toLowerCase().replace(/-\d+$/, '');
        const fallback = STATIC_CASE_STUDIES[slug] || STATIC_CASE_STUDIES[cleanSlug];
        if (fallback) {
          setStudy(fallback);
          setError('');
        } else {
          setError(requestError.response?.data?.error || 'Case study not found.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" /></main>;
  if (error || !study) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"><p className="text-gray-600">{error || 'Case study not found.'}</p><Link to="/catalogues" className="btn-primary">Back to Catalogues</Link></main>;

  useEffect(() => {
    // Ensure all embedded video elements inside case study body have controls enabled
    const articleVideos = document.querySelectorAll('article video');
    articleVideos.forEach((v) => {
      if (!v.hasAttribute('controls')) {
        v.setAttribute('controls', 'true');
      }
    });
  }, [study]);

  const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(study.body || '');

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/catalogues" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-8"><ArrowLeft className="w-4 h-4" /> Back to Catalogues</Link>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {study.imageUrl && (
            isVideoMedia(study.imageUrl) ? (
              <div className="w-full bg-black aspect-video max-h-[500px] overflow-hidden flex items-center justify-center">
                <video
                  src={resolveMediaUrl(study.imageUrl)}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <MediaImage src={study.imageUrl} alt={study.title} className="w-full max-h-[420px] object-cover" />
            )
          )}
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-cm-blue px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide mb-5">
              <BookOpen className="w-3 h-3" /> Case Study
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-cm-blue-dark leading-tight mb-5">{study.title}</h1>
            {study.description && <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-cm-blue pl-5 mb-8">{study.description}</p>}
            {study.body && (
              bodyIsHtml ? (
                <div className="prose prose-slate max-w-none [&_video]:w-full [&_video]:rounded-xl [&_video]:aspect-video [&_video]:bg-black" dangerouslySetInnerHTML={{ __html: study.body }} />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{study.body}</div>
              )
            )}
          </div>
        </div>
      </article>
    </main>
  );
};

export default CaseStudyDetail;
