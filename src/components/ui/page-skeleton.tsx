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

export const CampusDesignExecutionSkeleton: React.FC = () => {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      {/* Section Header Skeleton */}
      <section className="px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-4 w-28 rounded bg-slate-200 mb-3" />
          <div className="h-9 w-2/3 max-w-md rounded-lg bg-slate-200 sm:h-10" />
          <div className="mt-3 space-y-2 max-w-3xl">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-4/5 rounded bg-slate-200" />
          </div>
        </div>
      </section>

      {/* Execution Process Steps Grid Skeleton */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="h-7 w-64 rounded-lg bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-48 w-full bg-slate-200" />
                <div className="flex flex-1 flex-col p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                    <div className="h-4 w-14 rounded bg-slate-200" />
                  </div>
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-5/6 rounded bg-slate-200" />
                  </div>
                  <div className="pt-3 border-t border-gray-50">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner Skeleton */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-slate-200 px-8 py-8 sm:flex-row sm:px-12">
          <div className="space-y-2 w-full max-w-xl">
            <div className="h-7 w-2/3 rounded-lg bg-slate-300" />
            <div className="h-4 w-full rounded bg-slate-300" />
          </div>
          <div className="h-11 w-36 rounded-xl bg-slate-300 flex-shrink-0" />
        </div>
      </section>
    </main>
  );
};

export const SportsInfraSkeleton: React.FC = () => {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      {/* Blue Rounded Hero Skeleton */}
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 w-full space-y-3">
            <div className="h-8 w-2/3 rounded-lg bg-white/20" />
            <div className="h-4 w-full rounded bg-white/15" />
            <div className="h-4 w-5/6 rounded bg-white/15" />
            <div className="pt-2">
              <div className="h-10 w-32 rounded-xl bg-white/20" />
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="rounded-2xl w-full h-[260px] bg-white/15" />
          </div>
        </div>
      </section>

      {/* Facilities & Categories Layout Skeleton */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="hidden md:block h-1 w-32 bg-slate-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
            <aside className="hidden lg:block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="h-4 w-28 rounded bg-slate-200 mb-5" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 w-full rounded-2xl bg-slate-100" />
              ))}
            </aside>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-sm"
                >
                  <div className="h-[220px] sm:h-[230px] w-full bg-slate-200" />
                  <div className="flex flex-1 flex-col px-5 pb-4 pt-4 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="h-3.5 w-full rounded bg-slate-100" />
                    <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                    <div className="pt-2 flex gap-2">
                      <div className="h-5 w-16 rounded-full bg-slate-100" />
                      <div className="h-5 w-16 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export const HomeHeroSkeleton: React.FC = () => (
  <div className="relative overflow-hidden w-full bg-[#001f52] py-8 sm:py-12 md:py-14 min-h-[300px] animate-pulse">
    <div className="w-full px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl text-left space-y-4">
          <div className="h-4 w-44 rounded bg-white/20" />
          <div className="h-10 sm:h-12 w-4/5 rounded-xl bg-white/20" />
          <div className="h-10 sm:h-12 w-3/5 rounded-xl bg-white/20" />
          <div className="h-5 w-1/2 rounded bg-white/15 pt-2" />
          <div className="pt-4 flex gap-4">
            <div className="h-12 w-48 rounded-xl bg-white/25" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const HomeCategoryBarSkeleton: React.FC = () => (
  <div className="category-bar bg-white border-b border-gray-100 py-3 relative z-[60] animate-pulse">
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="h-3 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const HomeServiceCardsSkeleton: React.FC = () => (
  <section className="px-4 py-4 sm:px-6 lg:px-8 bg-white animate-pulse">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 p-5 flex flex-col justify-between" />
        ))}
      </div>
    </div>
  </section>
);

export const HomeFeatureCardsSkeleton: React.FC = () => (
  <section className="px-4 py-8 sm:px-6 lg:px-8 bg-[#f8fafc] animate-pulse">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
              <div className="h-44 w-full rounded-xl bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const HomeCollaborationsSkeleton: React.FC = () => (
  <section className="py-8 bg-gray-50 border-y border-gray-200 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
      <div className="h-4 w-60 rounded bg-slate-200" />
      <div className="flex gap-8 overflow-hidden w-full justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded bg-slate-200 shrink-0" />
        ))}
      </div>
    </div>
  </section>
);

export default PageCardGridSkeleton;

