import { Plus, Trash2, Eye, EyeOff, FileText, ChevronUp, ChevronDown, Image as ImageIcon, MessageSquare } from 'lucide-react';
import type { ArticleSectionItem } from '@/components/cms/EditorialArticlePage';
import MediaImageField from './MediaImageField';
import type { PageData } from './UnifiedPageEditor';

interface ArticleEditorSectionProps {
  slug: string;
  data: PageData;
  set: (key: string, value: any) => void;
}

export default function ArticleEditorSection({ slug, data, set }: ArticleEditorSectionProps) {
  const sections: ArticleSectionItem[] = Array.isArray((data as any).sections)
    ? (data as any).sections
    : [];

  const updateSections = (nextSections: ArticleSectionItem[]) => {
    set('sections', nextSections);
  };

  const addArticleSection = () => {
    const nextIndex = sections.length;
    updateSections([
      ...sections,
      {
        heading: `${nextIndex + 1}. New Article Section`,
        body: '',
        bullets: [],
        active: true,
      },
    ]);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`article-editor-section-${nextIndex}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = el.querySelector<HTMLInputElement>('input[type="text"]');
          if (input) {
            input.focus();
            input.select();
          }
        }
      }, 80);
    });
  };

  const updateSectionField = (idx: number, field: keyof ArticleSectionItem, value: any) => {
    const next = [...sections];
    next[idx] = { ...next[idx], [field]: value };
    updateSections(next);
  };

  const removeArticleSection = (idx: number) => {
    updateSections(sections.filter((_, i) => i !== idx));
  };

  const moveArticleSection = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    updateSections(next);
  };

  const addBullet = (sectionIdx: number) => {
    const currentBullets = Array.isArray(sections[sectionIdx]?.bullets)
      ? [...(sections[sectionIdx].bullets || [])]
      : [];
    updateSectionField(sectionIdx, 'bullets', [...currentBullets, 'New key takeaway']);
  };

  const updateBullet = (sectionIdx: number, bulletIdx: number, value: string) => {
    const currentBullets = [...(sections[sectionIdx]?.bullets || [])];
    currentBullets[bulletIdx] = value;
    updateSectionField(sectionIdx, 'bullets', currentBullets);
  };

  const removeBullet = (sectionIdx: number, bulletIdx: number) => {
    const currentBullets = (sections[sectionIdx]?.bullets || []).filter((_, i) => i !== bulletIdx);
    updateSectionField(sectionIdx, 'bullets', currentBullets);
  };

  return (
    <div className="space-y-12">
      {/* 1. Article Header & Excerpt Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
              Article Header &amp; Lead Excerpt
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Category badge, author metadata, headline, and highlighted lead paragraph on /{slug}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('hideHero', !data.hideHero)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              data.hideHero
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Category / Eyebrow Tag</label>
            <input
              type="text"
              value={(data as any).heroEyebrow ?? ''}
              onChange={(e) => set('heroEyebrow', e.target.value)}
              placeholder="e.g. Platform Guide · CampusMart"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Author / Byline</label>
            <input
              type="text"
              value={(data as any).author ?? ''}
              onChange={(e) => set('author', e.target.value)}
              placeholder="e.g. CampusMart Editorial Team"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Read Time</label>
            <input
              type="text"
              value={(data as any).readTime ?? ''}
              onChange={(e) => set('readTime', e.target.value)}
              placeholder="e.g. 5 min read"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Article Headline *</label>
            <input
              type="text"
              value={data.heroTitle ?? ''}
              onChange={(e) => set('heroTitle', e.target.value)}
              placeholder="Article headline..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">Lead Excerpt / Summary</label>
            <textarea
              rows={3}
              value={data.heroSubtitle ?? ''}
              onChange={(e) => set('heroSubtitle', e.target.value)}
              placeholder="Highlighted lead paragraph shown below the headline..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
          </div>
        </div>
      </section>

      {/* 2. Featured Article Image Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Featured Article Image
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Hero banner image displayed at the top of the article card
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('hideImage', !(data as any).hideImage)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              (data as any).hideImage
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {(data as any).hideImage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {(data as any).hideImage ? 'Hidden / Draft' : 'Live on Page'}
          </button>
        </div>

        <MediaImageField
          label="Featured Banner Image"
          value={data.heroImage ?? ''}
          onChange={(v) => set('heroImage', v)}
          previewClassName="h-48 rounded-2xl"
        />
      </section>

      {/* 3. Article Body Sections */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Article Body Sections ({sections.length})
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Add, edit, reorder, or toggle visibility of individual article sections on /{slug}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => set('hideContent', !(data as any).hideContent)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                (data as any).hideContent
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {(data as any).hideContent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {(data as any).hideContent ? 'Hidden / Draft' : 'Live on Page'}
            </button>
            <button
              type="button"
              onClick={addArticleSection}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
              <p className="font-semibold text-gray-600 mb-1">No article sections in database</p>
              <p className="text-xs mb-4">
                Click &ldquo;+ Add Section&rdquo; above to add a new article section.
              </p>
            </div>
          ) : (
            sections.map((section, i) => {
              const isActive = section.active !== false;
              const bullets = Array.isArray(section.bullets) ? section.bullets : [];
              return (
                <div
                  key={i}
                  id={`article-editor-section-${i}`}
                  className={`border rounded-2xl p-4 sm:p-5 transition-colors ${
                    isActive
                      ? 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                      : 'border-amber-200/80 bg-amber-50/20 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-gray-200/60 pb-2.5">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-mono font-bold">
                        {i + 1}
                      </span>
                      <span>Article Section #{i + 1}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateSectionField(i, 'active', !isActive)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Toggle section visibility on live article page"
                      >
                        {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {isActive ? 'Live' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveArticleSection(i, 'up')}
                        disabled={i === 0}
                        title="Move Up"
                        className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveArticleSection(i, 'down')}
                        disabled={i === sections.length - 1}
                        title="Move Down"
                        className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArticleSection(i)}
                        title="Remove Section"
                        className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Section Heading</label>
                      <input
                        type="text"
                        value={section.heading ?? ''}
                        onChange={(e) => updateSectionField(i, 'heading', e.target.value)}
                        placeholder="e.g. 1. Discovery & Institutional Needs Assessment"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">Section Paragraph / Body</label>
                      <textarea
                        rows={4}
                        value={section.body ?? ''}
                        onChange={(e) => updateSectionField(i, 'body', e.target.value)}
                        placeholder="Write the article paragraph content for this section..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                      />
                    </div>

                    {/* Section Bullet Points */}
                    <div className="space-y-2.5 pt-2 border-t border-gray-200/60">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          Key Bullet Points ({bullets.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => addBullet(i)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Bullet
                        </button>
                      </div>
                      {bullets.length > 0 && (
                        <div className="space-y-2">
                          {bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 ml-1" />
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(i, bIdx, e.target.value)}
                                placeholder="Key takeaway or bullet point..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeBullet(i, bIdx)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove bullet"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Bottom Call-to-Action Card Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Bottom Call-to-Action Banner
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Editorial callout banner displayed at the bottom of /{slug}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('hideCta', !data.hideCta)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              data.hideCta
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {data.hideCta ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {data.hideCta ? 'Hidden / Draft' : 'Live on Page'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">CTA Eyebrow Label</label>
            <input
              type="text"
              value={(data as any).ctaEyebrow ?? ''}
              onChange={(e) => set('ctaEyebrow', e.target.value)}
              placeholder="e.g. Start Your Campus Journey"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">CTA Heading</label>
            <input
              type="text"
              value={data.ctaTitle ?? ''}
              onChange={(e) => set('ctaTitle', e.target.value)}
              placeholder="e.g. Ready to plan or upgrade your campus?"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">CTA Description</label>
            <textarea
              rows={2}
              value={data.ctaSubtitle ?? ''}
              onChange={(e) => set('ctaSubtitle', e.target.value)}
              placeholder="CTA supporting description..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">CTA Button Label</label>
            <input
              type="text"
              value={data.ctaButtonLabel ?? ''}
              onChange={(e) => set('ctaButtonLabel', e.target.value)}
              placeholder="e.g. Request a Quote"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">CTA Button Link</label>
            <input
              type="text"
              value={data.ctaHref ?? ''}
              onChange={(e) => set('ctaHref', e.target.value)}
              placeholder="/request-quote"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
