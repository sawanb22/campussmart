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
  const [hasError, setHasError] = useState(false);
  const [attemptedFallbackSrc, setAttemptedFallbackSrc] = useState(false);

  // Reset error state when the source prop changes
  useEffect(() => {
    setHasError(false);
    setAttemptedFallbackSrc(false);
  }, [src, fallbackSrc]);

  const resolvedUrl = src ? resolveMediaUrl(src) : '';

  if (!resolvedUrl || hasError) {
    if (fallbackSrc && !attemptedFallbackSrc) {
      const resolvedFallback = resolveMediaUrl(fallbackSrc);
      return (
        <img
          src={resolvedFallback}
          alt={alt}
          loading={loading}
          className={className}
          onError={(e) => {
            setAttemptedFallbackSrc(true);
            setHasError(true);
            onError?.(e);
          }}
          {...rest}
        />
      );
    }

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
      src={resolvedUrl}
      alt={alt}
      loading={loading}
      className={className}
      onError={(e) => {
        if (fallbackSrc && !attemptedFallbackSrc) {
          setAttemptedFallbackSrc(true);
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
