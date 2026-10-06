import React from 'react';

interface PageCardGridSkeletonProps {
  cardCount?: number;
}

export const PageCardGridSkeleton: React.FC<PageCardGridSkeletonProps> = ({ cardCount = 3 }) => {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <section className="bg-amber-50/40 px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 border-b border-stone-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <div className="mb-4 h-4 w-32 rounded-full bg-stone-200" />
            <div className="h-10 w-3/4 rounded-xl bg-stone-200 sm:h-12" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-5/6 rounded bg-stone-200" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="h-11 w-40 rounded-full bg-stone-200" />
              <div className="h-11 w-44 rounded-full bg-stone-200" />
            </div>
          </div>
          <div className="hidden aspect-[4/3] w-full max-w-sm rounded-2xl bg-stone-200 lg:block shadow-sm" />
        </div>
      </section>

      {/* Grid section skeleton */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Category filter chips placeholder */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="h-8 w-20 rounded-full bg-stone-200" />
            <div className="h-8 w-28 rounded-full bg-stone-200" />
            <div className="h-8 w-24 rounded-full bg-stone-200" />
          </div>

          {/* Featured card placeholder */}
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-amber-50/50 sm:grid-cols-[1.2fr_0.8fr] border border-stone-100">
            <div className="min-h-[220px] bg-stone-200 sm:min-h-[280px]" />
            <div className="flex flex-col justify-center p-6 sm:p-8 space-y-4">
              <div className="h-4 w-28 rounded bg-stone-200" />
              <div className="h-7 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-2/3 rounded bg-stone-200" />
              <div className="h-4 w-24 rounded bg-stone-200 mt-2" />
            </div>
          </div>

          {/* Additional cards placeholder grid */}
          {cardCount > 1 && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.min(cardCount, 3) }).map((_, idx) => (
                <div key={idx} className="space-y-3 rounded-xl border border-stone-100 p-3">
                  <div className="aspect-[4/3] w-full rounded-lg bg-stone-200" />
                  <div className="h-3 w-20 rounded bg-stone-200" />
                  <div className="h-5 w-3/4 rounded bg-stone-200" />
                  <div className="h-3 w-full rounded bg-stone-200" />
                  <div className="h-8 w-28 rounded-lg bg-stone-200 mt-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default PageCardGridSkeleton;
