import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tags } from 'lucide-react';
import api from '@/api/client';

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

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" /></main>;
  if (error || !post) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"><p className="text-gray-600">{error || 'Article not found.'}</p><Link to="/blog" className="btn-primary">Back to Blog</Link></main>;

  const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(post.body || '');

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-8"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full max-h-[420px] object-cover" />}
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-cm-blue px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide mb-5">
              <Tags className="w-3 h-3" /> {post.category?.name || 'General'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-cm-blue-dark leading-tight mb-5">{post.title}</h1>
            {post.excerpt && <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-cm-blue pl-5 mb-8">{post.excerpt}</p>}
            {bodyIsHtml ? (
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.body }} />
            ) : (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.body}</div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
};

export default BlogPost;
