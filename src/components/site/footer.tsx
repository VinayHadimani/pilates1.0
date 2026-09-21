import { Instagram, MapPin } from "lucide-react";

export function Footer({
  studioName,
  tagline,
  subTagline,
  location,
  instagramUrl,
  instagramHandle,
}: {
  studioName: string;
  tagline: string;
  subTagline: string;
  location: string;
  instagramUrl: string;
  instagramHandle: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-black px-4 pb-8 pt-12 md:px-6 md:pb-10 md:pt-16 safe-pb">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Wordmark */}
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DEDBC8]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path
                    d="M2 14c3-6 6-6 9 0s6 6 11 0"
                    stroke="#0a0a0a"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div className="leading-none">
                <p className="text-xl font-bold uppercase tracking-[0.15em] text-[#E1E0CC]">
                  Arcwave
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-primary/60">
                  Pilates
                </p>
              </div>
            </div>
            <p className="mt-4 font-serif text-lg italic text-[#DEDBC8]">
              {subTagline}
            </p>
            <p className="mt-2 max-w-xs text-xs text-primary/50">{tagline}</p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm text-primary/70 transition-colors hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
              {instagramHandle}
            </a>
            <p className="inline-flex min-h-[44px] items-center gap-2 text-sm text-primary/70">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
            <a
              href="#faq"
              className="inline-flex min-h-[44px] items-center text-sm text-primary/70 transition-colors hover:text-primary"
            >
              FAQs
            </a>
            <a
              href="#booking"
              className="inline-flex min-h-[44px] items-center text-sm text-primary/70 transition-colors hover:text-primary"
            >
              Book a session
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-primary/40 sm:flex-row">
          <p>
            © {year} {studioName}. All rights reserved.
          </p>
          <p className="flex items-center gap-3">
            <a href="/admin" className="transition-colors hover:text-primary/70">
              Admin
            </a>
            <span>·</span>
            <span>Mindful movement, since 2026.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
