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
    <footer className="mt-auto w-full border-t border-line bg-paper px-4 pb-8 pt-12 md:px-6 md:pb-10 md:pt-16 safe-pb">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Wordmark */}
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path
                    d="M2 14c3-6 6-6 9 0s6 6 11 0"
                    stroke="#152f3e"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div className="leading-none">
                <p className="text-xl font-bold uppercase tracking-[0.15em] text-ink">
                  Arcwave
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                  Pilates
                </p>
              </div>
            </div>
            <p className="mt-4 font-serif text-lg italic text-teal">
              {subTagline}
            </p>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground/80">{tagline}</p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal"
            >
              <Instagram className="h-4 w-4" />
              {instagramHandle}
            </a>
            <p className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
            <a
              href="#faq"
              className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground transition-colors hover:text-teal"
            >
              FAQs
            </a>
            <a
              href="#booking"
              className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground transition-colors hover:text-teal"
            >
              Book a session
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-[11px] text-muted-foreground/70 sm:flex-row">
          <p>
            © {year} {studioName}. All rights reserved.
          </p>
          <p className="flex items-center gap-3">
            <a href="/admin" className="transition-colors hover:text-muted-foreground">
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
