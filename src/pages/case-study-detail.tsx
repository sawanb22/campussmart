import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '@/api/client';
import { MediaImage } from '@/components/ui/media-image';

interface CaseStudy {
  title: string;
  description?: string;
  body?: string;
  imageUrl?: string;
}

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.get(`/case-studies/${slug}`)
      .then(({ data }) => setStudy(data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Case study not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" /></main>;
  if (error || !study) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"><p className="text-gray-600">{error || 'Case study not found.'}</p><Link to="/catalogues" className="btn-primary">Back to Catalogues</Link></main>;

  const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(study.body || '');

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/catalogues" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-8"><ArrowLeft className="w-4 h-4" /> Back to Catalogues</Link>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {study.imageUrl && <MediaImage src={study.imageUrl} alt={study.title} className="w-full max-h-[420px] object-cover" />}
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-cm-blue px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide mb-5">
              <BookOpen className="w-3 h-3" /> Case Study
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-cm-blue-dark leading-tight mb-5">{study.title}</h1>
            {study.description && <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-cm-blue pl-5 mb-8">{study.description}</p>}
            {study.body && (
              bodyIsHtml ? (
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: study.body }} />
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
