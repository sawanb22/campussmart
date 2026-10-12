import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';

export interface ArticleSectionItem {
  heading: string;
  body: string;
  bullets?: string[];
  active?: boolean;
}

interface EditorialArticlePageProps {
  slug: string;
}

export default function EditorialArticlePage({ slug }: EditorialArticlePageProps) {
  const { data, loading } = usePageData(slug);

  const hideHero = Boolean((data as any)?.hideHero);
  const hideImage = Boolean((data as any)?.hideImage);
  const hideContent = Boolean((data as any)?.hideContent);
  const hideCta = Boolean((data as any)?.hideCta);

  const heroEyebrow = (data as any)?.heroEyebrow ?? '';
  const heroTitle = (data as any)?.heroTitle ?? '';
  const heroSubtitle = (data as any)?.heroSubtitle ?? '';
  const heroImage = (data as any)?.heroImage ?? '';
  const author = (data as any)?.author ?? '';
  const readTime = (data as any)?.readTime ?? '';

  const rawSections: ArticleSectionItem[] = Array.isArray((data as any)?.sections)
    ? (data as any).sections
    : [];

  const visibleSections = rawSections.filter((s) => s && s.active !== false);

  const ctaEyebrow = (data as any)?.ctaEyebrow ?? '';
  const ctaTitle = (data as any)?.ctaTitle ?? '';
  const ctaSubtitle = (data as any)?.ctaSubtitle ?? '';
  const ctaButtonLabel = (data as any)?.ctaButtonLabel ?? '';
  const ctaHref = (data as any)?.ctaHref ?? '/contact-us';

  if (loading && !heroTitle && visibleSections.length === 0) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-[#faf8f0]">
        <div className="w-8 h-8 border-4 border-[#3c2f26] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="ai-guide-article-page min-h-screen bg-[#faf8f0] py-10 sm:py-16 font-sans">
      <article className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#3d718f] hover:text-[#3c2f26] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Articles
        </Link>

        <div className="overflow-hidden rounded-xl bg-[#fffdf8] shadow-sm border border-[rgba(60,47,38,0.08)]">
          {/* Featured Article Image */}
          {!hideImage && heroImage && (
            <MediaImage
              src={heroImage}
              alt={heroTitle}
              className="h-64 w-full object-cover sm:h-[420px]"
            />
          )}

          <div className="px-6 py-8 sm:px-12 sm:py-12">
            {/* Article Header & Excerpt */}
            {!hideHero && (heroEyebrow || heroTitle || heroSubtitle || author || readTime) && (
              <header className="mb-10">
                {(heroEyebrow || author || readTime) && (
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ed9816]">
                    {heroEyebrow && <span>{heroEyebrow}</span>}
                    {heroEyebrow && (author || readTime) && (
                      <span className="text-[#89614d]/50">•</span>
                    )}
                    {readTime && (
                      <span className="inline-flex items-center gap-1 text-[#89614d] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {readTime}
                      </span>
                    )}
                    {author && (
                      <span className="inline-flex items-center gap-1 text-[#89614d] font-semibold">
                        <User className="w-3.5 h-3.5" />
                        {author}
                      </span>
                    )}
                  </div>
                )}

                {heroTitle && (
                  <h1
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    className="mb-6 text-3xl font-medium leading-tight tracking-tight text-[#3c2f26] sm:text-5xl"
                  >
                    {heroTitle}
                  </h1>
                )}

                {heroSubtitle && (
                  <p className="max-w-3xl border-l-2 border-[#ed9816] pl-5 text-base leading-8 text-[#695e56] sm:text-lg">
                    {heroSubtitle}
                  </p>
                )}
              </header>
            )}

            {/* Article Body Sections */}
            {!hideContent && visibleSections.length > 0 && (
              <div className="space-y-9 border-t border-[#3c2f26]/10 pt-8">
                {visibleSections.map((section, index) => (
                  <section key={index} className="space-y-4">
                    {section.heading && (
                      <h2
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                        className="text-2xl font-medium leading-snug text-[#3c2f26] sm:text-3xl"
                      >
                        {section.heading}
                      </h2>
                    )}
                    {section.body && (
                      <p className="whitespace-pre-line text-base leading-8 text-[#4a3e35]">
                        {section.body}
                      </p>
                    )}
                    {Array.isArray(section.bullets) && section.bullets.filter(Boolean).length > 0 && (
                      <ul className="mt-3 space-y-2.5 pl-1">
                        {section.bullets.filter(Boolean).map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="flex items-start gap-3 text-sm sm:text-base leading-7 text-[#4a3e35]"
                          >
                            <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#ed9816]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}

            {/* Article Footer Metadata Bar */}
            {(!hideHero || !hideContent) && (heroEyebrow || author || readTime) && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-[#3c2f26]/10 pt-6 text-xs uppercase tracking-[0.12em] text-[#89614d]">
                <span>{heroEyebrow}</span>
                <span>{[author, readTime].filter(Boolean).join(' · ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Editorial Call-to-Action Card */}
        {!hideCta && (ctaTitle || ctaSubtitle || ctaButtonLabel) && (
          <div className="mt-8 rounded-xl bg-[#3c2f26] p-6 sm:p-10 text-[#faf8f0] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                {ctaEyebrow && (
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ed9816]">
                    {ctaEyebrow}
                  </div>
                )}
                {ctaTitle && (
                  <h3
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    className="text-2xl sm:text-3xl font-medium text-white mb-2"
                  >
                    {ctaTitle}
                  </h3>
                )}
                {ctaSubtitle && (
                  <p className="text-sm sm:text-base text-[#e6dfd5] leading-relaxed">
                    {ctaSubtitle}
                  </p>
                )}
              </div>
              {ctaButtonLabel && (
                <Link
                  to={ctaHref || '/contact-us'}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ed9816] px-6 py-3.5 text-sm font-bold text-[#3c2f26] hover:bg-[#f5a623] transition-colors"
                >
                  <span>{ctaButtonLabel}</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}

        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3c2f26] hover:text-[#ed9816] transition-colors"
        >
          Explore more articles <ArrowRight size={15} />
        </Link>
      </article>
    </main>
  );
}
