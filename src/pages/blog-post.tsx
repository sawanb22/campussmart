import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '@/api/client';
import MediaImage from '@/components/ui/media-image';
import DOMPurify from 'dompurify';

interface Category { id: number; name: string; slug: string; }
interface Post { title: string; body: string; excerpt: string; imageUrl?: string; category?: Category; blogcategory?: Category; }

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.get(`/blog/${slug}`)
      .then(({ data }) => setPost({ ...data, category: data.category ?? data.blogcategory }))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Article not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="min-h-[60vh] flex items-center justify-center bg-[#faf8f0]"><div className="w-8 h-8 border-4 border-[#3c2f26] border-t-transparent rounded-full animate-spin" /></main>;
  if (error || !post) return <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 bg-[#faf8f0]"><p className="text-gray-600">{error || 'Article not found.'}</p><Link to="/blog" className="btn-primary">Back to Blog</Link></main>;

  const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(post.body || '');

  return (
    <main className="ai-guide-article-page min-h-screen bg-[#faf8f0] py-10 sm:py-16 font-sans">
      <article className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#3d718f] hover:text-[#3c2f26]">
          <ArrowLeft size={16} /> Back to Articles
        </Link>
        <div className="overflow-hidden rounded-xl bg-[#fffdf8] shadow-sm border border-[rgba(60,47,38,0.08)]">
          {post.imageUrl && (
            <MediaImage src={post.imageUrl} alt={post.title} className="h-64 w-full object-cover sm:h-[440px]" />
          )}
          <div className="px-6 py-8 sm:px-12 sm:py-12">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ed9816]">
              {post.category?.name || 'General'}
            </div>
            <h1
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              className="mb-6 text-4xl font-medium leading-tight tracking-tight text-[#3c2f26] sm:text-6xl"
            >
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="max-w-2xl border-l-2 border-[#ed9816] pl-5 text-base leading-8 text-[#695e56] sm:text-lg mb-8">
                {post.excerpt}
              </p>
            )}
            {bodyIsHtml ? (
              <div className="prose prose-slate max-w-none text-[#3c2f26]" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }} />
            ) : (
              <div className="whitespace-pre-wrap text-[#3c2f26] leading-relaxed text-base">{post.body}</div>
            )}
          </div>
        </div>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3c2f26]">
          Explore more articles <ArrowRight size={15} />
        </Link>
      </article>
    </main>
  );
};

export default BlogPost;
