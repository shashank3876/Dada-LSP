import React from 'react';

/**
 * Authentic, full-color official brand icons for social media channels.
 * Always renders in true brand colors (not monochrome or hover-dependent).
 */

export function LinkedInBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        d="M19 19h-3.13v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V19H9.23V8.89h3V10.3h.04c.42-.79 1.44-1.63 2.96-1.63 3.17 0 3.75 2.08 3.75 4.8V19zM5.77 7.51a1.82 1.82 0 110-3.64 1.82 1.82 0 010 3.64zM7.33 19H4.2V8.89h3.13V19z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function YouTubeBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#FFFFFF" />
    </svg>
  );
}

export function InstagramBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="instaGrad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#instaGrad)" />
      <path
        d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.25A3.25 3.25 0 1112 8.75a3.25 3.25 0 010 6.5zm5.2-8.32a1.17 1.17 0 11-2.34 0 1.17 1.17 0 012.34 0z"
        fill="#FFFFFF"
      />
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function FacebookBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.12 12.38l.42-2.73h-2.62V7.88c0-.75.37-1.48 1.55-1.48h1.2V4.08c-.73-.1-1.63-.16-2.5-.16-2.55 0-4.22 1.55-4.22 4.35v2.11H6.5v2.73h2.45V20c.5.08 1.01.12 1.53.12s1.03-.04 1.53-.12v-6.74h2.11l1-2.73v-.15z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function WhatsAppBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
