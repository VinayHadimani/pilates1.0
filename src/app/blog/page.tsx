import Link from "next/link";
import { getBlogPosts } from "@/lib/site";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string | null): string {
  try {
    const date = d ? new Date(d) : new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-line bg-paper/80 backdrop-blur safe-pt">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 py-3 md:px-8 md:py-4">
          <a
            href="/"
            className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-teal"
          >
            <img
              src="/images/arcwave-01.png"
              alt="Arcwave Pilates"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden sm:inline">Arcwave Pilates</span>
          </a>
          <a
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted-foreground transition-colors hover:bg-lime/40 hover:text-teal"
          >
            ← Back to site
          </a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-8 md:py-20">
        {/* Section heading */}
        <div className="mb-10 md:mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal sm:text-xs">
            Notes from the studio
          </p>
          <h1 className="mt-2 text-5xl text-ink md:text-6xl">Blog</h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Thoughts on mindful movement, the practice of Pilates, and the
            rhythms of the studio.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white2 p-10 text-center md:p-16">
            <p className="font-serif text-3xl italic text-teal md:text-4xl">
              No posts yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              We&apos;re still writing our first notes from the studio. Please
              check back soon for stories, guides and thoughts on Pilates.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-teal px-5 text-sm font-medium text-white transition-colors hover:bg-teal/90"
            >
              Back to home
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white2 p-6 transition-all hover:border-teal/40 hover:shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal">
                  {formatDate(p.publishedAt ?? p.createdAt)}
                </p>
                <h2 className="mt-3 text-2xl leading-tight text-ink transition-colors group-hover:text-teal md:text-3xl">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {p.excerpt}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                    Read more
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
