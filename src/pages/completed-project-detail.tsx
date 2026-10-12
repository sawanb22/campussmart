import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import MediaImage from '@/components/ui/media-image';

export const slugifyCompletedProject = (text: string): string =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';

const CompletedProjectDetail = () => {
  const { projectSlug } = useParams();
  const { content, loading } = useSiteContent();
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveSlide(0);
    setLightboxOpen(false);
  }, [projectSlug]);

  const rawSidebar =
    typeof content.home_sidebar === 'object' && content.home_sidebar !== null
      ? content.home_sidebar
      : {};

  const projects: any[] = Array.isArray(rawSidebar.completedProjects)
    ? rawSidebar.completedProjects
    : [];

  const project = projects.find((item: any) => {
    if (!item || item.active === false) return false;
    const itemName = item.label || item.title || '';
    const itemSlug = item.slug
      ? slugifyCompletedProject(item.slug)
      : slugifyCompletedProject(itemName);
    return itemSlug === projectSlug;
  });

  if (loading && projects.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" />
      </main>
    );
  }

  if (!project || rawSidebar.hideCompletedProjects) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 bg-gray-50/50">
        <p className="text-gray-600 font-medium">Completed project not found.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </main>
    );
  }

  const title = project.label || project.title || '';
  const category = project.category || '';
  const description = project.description || '';

  const images: string[] = Array.isArray(project.images)
    ? project.images.filter((u: any) => typeof u === 'string' && u.trim() !== '')
    : project.image && typeof project.image === 'string' && project.image.trim() !== ''
      ? [project.image.trim()]
      : [];

  const safeSlideIndex = images.length > 0 ? Math.min(activeSlide, images.length - 1) : 0;
  const currentImage = images[safeSlideIndex] || '';

  const prevSlide = () => {
    if (images.length <= 1) return;
    setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    if (images.length <= 1) return;
    setActiveSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue hover:text-cm-blue-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Interactive Multi-Image Portfolio Carousel */}
          {images.length > 0 && (
            <div className="border-b border-gray-100 bg-slate-900/5">
              <div className="relative bg-slate-900 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block w-full text-left focus:outline-none cursor-zoom-in"
                  title="Click to view full size"
                >
                  <MediaImage
                    src={currentImage}
                    alt={title || `Project Image ${safeSlideIndex + 1}`}
                    className="h-64 w-full object-cover sm:h-[440px] transition-all duration-300"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-900/75 hover:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-all shadow-sm"
                  title="Expand image"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Expand</span>
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900 transition-all shadow-md"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900 transition-all shadow-md"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3.5 right-3.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold tracking-wider text-white backdrop-blur-xs">
                      {safeSlideIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip when multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto bg-slate-50 px-4 py-3 sm:px-6 border-t border-gray-100">
                  {images.map((imgUrl, idx) => {
                    const isSelected = idx === safeSlideIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        className={`relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-cm-blue ring-2 ring-cm-blue/25 opacity-100 scale-[1.02]'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <MediaImage
                          src={imgUrl}
                          alt={`${title} thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Project Details */}
          <div className="p-6 sm:p-10">
            {category && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cm-blue">
                <Building2 className="h-3.5 w-3.5" /> {category}
              </div>
            )}

            {title && (
              <h1 className="mb-6 text-3xl font-bold leading-tight text-cm-blue-dark sm:text-4xl">
                {title}
              </h1>
            )}

            {description && (
              <div className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-gray-700">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Bar matching CampusMart detail pages */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-cm-blue-dark to-cm-blue p-6 text-center sm:flex-row sm:p-8 sm:text-left shadow-sm">
          <p className="text-sm font-semibold text-white sm:text-base">
            Planning {title ? title.toLowerCase() : 'a similar project'} for your campus?
          </p>
          <Link
            to="/request-quote"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-cm-yellow px-6 py-3 text-sm font-bold text-cm-blue-dark transition-colors hover:bg-amber-400"
          >
            Get a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close full screen view"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="max-h-[88vh] max-w-5xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaImage
              src={currentImage}
              alt={title || `Slide ${safeSlideIndex + 1}`}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-lg mx-auto"
            />
            {images.length > 1 && (
              <div className="mt-3 text-center text-xs font-bold tracking-widest text-white/80">
                IMAGE {safeSlideIndex + 1} OF {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default CompletedProjectDetail;
