import React, { useState, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';

export interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackNode?: React.ReactNode;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt = '',
  className,
  fallbackSrc,
  fallbackNode,
  onError,
  loading = 'lazy',
  ...rest
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state when source props change
  useEffect(() => {
    setUseFallback(false);
    setHasError(false);
  }, [src, fallbackSrc]);

  const initialUrl = src ? resolveMediaUrl(src) : '';
  const fallbackUrl = fallbackSrc ? resolveMediaUrl(fallbackSrc) : '';

  // Determine which URL should be actively attempted
  const effectiveUrl = !initialUrl || useFallback ? fallbackUrl : initialUrl;

  if (!effectiveUrl || hasError) {
    if (fallbackNode) {
      return <>{fallbackNode}</>;
    }

    // Default branded SVG fallback placeholder
    return (
      <div
        role="img"
        aria-label={alt || 'Image placeholder'}
        className={cn(
          'relative flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 select-none overflow-hidden',
          className
        )}
      >
        <svg
          className="w-10 h-10 opacity-40 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={effectiveUrl}
      alt={alt}
      loading={loading}
      className={className}
      onError={(e) => {
        if (!useFallback && fallbackUrl && fallbackUrl !== effectiveUrl) {
          setUseFallback(true);
        } else {
          setHasError(true);
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
};

export default MediaImage;
