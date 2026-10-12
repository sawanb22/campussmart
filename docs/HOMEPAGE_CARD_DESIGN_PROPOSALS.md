# Homepage Feature Cards — Design Proposals & Reference Guide

> **Document Status**: Reference & Proposal Guide  
> **Created**: October 2026  
> **Target Component**: [`src/components/sections/feature-cards.tsx`](../src/components/sections/feature-cards.tsx)  
> **Admin Management**: Admin Panel → **"Homepage & Cards"** (`/admin/homepage-editor`)

---

## 1. Background & Client Feedback

In the client review spreadsheet, the following feedback was noted:
> *"All cards in home page | Remove gradient effect . where do change the image and text??"*

### The Design Challenge
The homepage feature cards originally used a dark gradient overlay across the entire image to guarantee white text readability. 
- Naively removing the gradient and replacing it with a flat dark bar created a harsh horizontal cut that sliced images in half.
- Leaving images completely raw with white text caused severe legibility issues on bright/white backgrounds.
- Therefore, three high-end design solutions were drafted, each solving legibility without obscuring the photography.

This document serves as the permanent reference guide containing the visual specifications, ready-to-use JSX code snippets, and pros/cons for each proposal.

---

## 2. Design Proposal 1: Clean Editorial White Card

### Visual Concept & Anatomy
```text
┌──────────────────────────────────────────────┐
│  [ Tag Badge ]             [ Optional Arrow ]│
│                                              │
│         100% Raw, Natural Photo              │
│       (Zero dark tint, zero overlay)         │
│                                              │
├──────────────────────────────────────────────┤
│  Card Title (Bold Slate-900)                 │
│  Two-line description text (Slate-600)       │
│                                              │
│  Explore ↗ (Accent Color)                    │
└──────────────────────────────────────────────┘
```

### Key Characteristics
1. **Zero Dark Overlays**: The photography is 100% natural and bright in the top half of the card.
2. **Standard Editorial Layout**: Similar to *Stripe*, *Architectural Record*, and *Airbnb Experiences*.
3. **Maximum Contrast**: Dark text on a crisp white card body guarantees 100% WCAG AAA contrast regardless of the photo's colors.

### Ready-to-Use JSX Snippet
```tsx
const cardHeight = window.innerWidth < 640 ? 250 : Math.max(h || 240, 260);

return (
  <Link
    key={title}
    to={href}
    className="fc-card group flex w-full flex-col overflow-hidden rounded-2xl relative bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300"
    style={{ height: cardHeight }}
  >
    {/* Natural Photo (Top section, zero dark tint or overlay) */}
    <div className="relative w-full h-[52%] overflow-hidden bg-slate-100 flex-shrink-0">
      <img
        src={resolveMediaUrl(image) || ''}
        alt={title}
        onError={(e) => {
          const fallback = defaultFeatures.find((f) => f.title === title)?.image || '';
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />
      {/* Category badge */}
      <div
        className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow z-10"
        style={{ background: color + 'EE' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0" />
        {tag}
      </div>
    </div>

    {/* Clean White Body */}
    <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between bg-white">
      <div>
        <h3 className="text-slate-900 font-extrabold text-[13px] sm:text-[15px] leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed line-clamp-2 mt-1">
          {description}
        </p>
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform"
          style={{ color }}
        >
          Explore <MoveUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </div>

    {/* Hover border ring */}
    <div
      className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2"
      style={{ '--tw-ring-color': color } as React.CSSProperties}
    />
  </Link>
);
```

---

## 3. Design Proposal 2: Floating Frosted Glass Pill (Apple / Luxury Glassmorphic)

### Visual Concept & Anatomy
```text
┌──────────────────────────────────────────────┐
│  [ Tag Badge ]                               │
│                                              │
│          Full-Bleed Edge-to-Edge             │
│            Natural Background Photo          │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Floating Frosted Glass Pill (Backdrop) │  │
│  │ Card Title                             │  │
│  │ Description & Explore ↗                │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Key Characteristics
1. **Full-Bleed Image Presentation**: The photo fills the entire card from edge to edge.
2. **No Harsh Dividing Line**: The frosted glass pill floats above the bottom with a 10px margin on all sides (`bottom-2.5 left-2.5 right-2.5`). The photo wraps cleanly around the card.
3. **Glassmorphism**: Uses `backdrop-blur-md` with `bg-slate-950/60` and `border border-white/20`, giving an Apple iOS widget aesthetic.

### Ready-to-Use JSX Snippet
```tsx
const cardHeight = window.innerWidth < 640 ? Math.min(h || 220, 220) : (window.innerWidth < 1024 ? Math.min(h || 240, 240) : (h || 240));

return (
  <Link
    key={title}
    to={href}
    className="fc-card group flex w-full flex-col overflow-hidden rounded-2xl relative shadow-lg"
    style={{ height: cardHeight }}
  >
    {/* Full-bleed background image visible all around */}
    <img
      src={resolveMediaUrl(image) || ''}
      alt={title}
      onError={(e) => {
        const fallback = defaultFeatures.find((f) => f.title === title)?.image || '';
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />

    {/* Category badge */}
    <div
      className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow z-10"
      style={{ background: color + 'EE' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0" />
      {tag}
    </div>

    {/* Floating Glass Pill */}
    <div className="absolute bottom-2.5 left-2.5 right-2.5 p-3 sm:p-3.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-2xl z-10">
      <h3 className="text-white font-extrabold text-[12px] sm:text-[14px] leading-snug line-clamp-1 drop-shadow">
        {title}
      </h3>
      <p className="text-white/85 text-[10px] sm:text-[11px] leading-snug line-clamp-2 mt-1">
        {description}
      </p>
      <div className="mt-2 flex items-center">
        <span
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform"
          style={{ color }}
        >
          Explore <MoveUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </div>

    {/* Hover border ring */}
    <div
      className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2"
      style={{ '--tw-ring-color': color } as React.CSSProperties}
    />
  </Link>
);
```

---

## 4. Design Proposal 3: Seamless Soft Photographic Fade (Architectural Digest / Subtle Vignette)

### Visual Concept & Anatomy
```text
┌──────────────────────────────────────────────┐
│  [ Tag Badge ]                               │
│                                              │
│          Top 60% Untouched Photo             │
│        (0% Overlay, 100% Brightness)         │
│                                              │
│  . . . . . . . . . . . . . . . . . . . . . . │ (Silky smooth transparent transition)
│  Card Title (Crisp Drop Shadow)              │
│  Description & Explore ↗                     │
└──────────────────────────────────────────────┘
```

### Key Characteristics
1. **No Hard Edges**: Zero sharp dividing boxes.
2. **Upper 60% Raw**: The upper photo has zero tint, so buildings, campus grounds, and student activities look vibrant and bright.
3. **Gentle Bottom Fade**: Only in the lower 40% directly behind the text, a gentle gradient (`bg-gradient-to-t from-slate-950/95 via-slate-950/50 via-55% to-transparent`) dissolves up for effortless legibility.

### Ready-to-Use JSX Snippet
```tsx
const cardHeight = window.innerWidth < 640 ? Math.min(h || 220, 220) : (window.innerWidth < 1024 ? Math.min(h || 240, 240) : (h || 240));

return (
  <Link
    key={title}
    to={href}
    className="fc-card group flex w-full flex-col overflow-hidden rounded-2xl relative shadow-lg"
    style={{ height: cardHeight }}
  >
    {/* Full-bleed background image */}
    <img
      src={resolveMediaUrl(image) || ''}
      alt={title}
      onError={(e) => {
        const fallback = defaultFeatures.find((f) => f.title === title)?.image || '';
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />

    {/* Category badge */}
    <div
      className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow z-10"
      style={{ background: color + 'EE' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0" />
      {tag}
    </div>

    {/* Smooth gradient fade ONLY behind the text */}
    <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 sm:pb-4 sm:px-4 bg-gradient-to-t from-slate-950/95 via-slate-950/50 via-55% to-transparent z-10 flex flex-col justify-end">
      <h3 className="text-white font-extrabold text-[12px] sm:text-[14px] md:text-base leading-snug drop-shadow-md line-clamp-1">
        {title}
      </h3>
      <p className="text-white/85 text-[10px] sm:text-[11px] md:text-xs leading-relaxed line-clamp-2 mt-1 drop-shadow">
        {description}
      </p>
      <div className="mt-2 flex items-center">
        <span
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform"
          style={{ color }}
        >
          Explore <MoveUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </div>

    {/* Hover border ring */}
    <div
      className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2"
      style={{ '--tw-ring-color': color } as React.CSSProperties}
    />
  </Link>
);
```

---

## 5. Summary Comparison Matrix

| Feature | Design 1 (White Card) | Design 2 (Glass Pill) | Design 3 (Soft Fade) |
| :--- | :--- | :--- | :--- |
| **Photo Visibility** | 100% natural, top 52% | 100% natural, full bleed (visible on all 4 sides) | 100% natural top 60%, gentle fade at bottom |
| **Text Background** | Solid White (`bg-white`) | Frosted Glass (`bg-slate-950/60 backdrop-blur`) | Silky Gradient Vignette (`from-slate-950/95 to-transparent`) |
| **Dividing Line** | Clear separation | Floating island (no cut across card) | Seamless gradual transition |
| **Best Suited For** | Clean, corporate, high-readability catalog feel | Sleek, modern tech / Apple product look | Editorial, architectural, photographic magazine style |

---

## 6. How to Change Image and Text in Admin Panel

Regardless of which visual style is active, the images and text for all 12 cards are managed via:

1. Log into the Admin Panel at `/admin`.
2. Click **"Homepage & Cards"** in the sidebar navigation (URL: `/admin/homepage-editor`).
3. Scroll to the section: **"🪟 Homepage Feature Cards (12) — Change Image & Text"**.
4. Each card card features:
   - **Title**: Card heading
   - **Description**: Card summary copy
   - **Category Tag**: Pill badge text (e.g., `Digital`, `AI & Tech`, `Furniture`)
   - **Badge / Accent Color**: Hex color code picker
   - **Image Upload / URL**: Direct image upload or image URL
   - **Destination Link (href)**: Page route the card navigates to
5. Click **"Save Changes"** at the top right to instantly update the live site via PostgreSQL.
