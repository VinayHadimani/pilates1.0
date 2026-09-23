import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/site";

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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const paragraphs = (post.content || "")
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

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
          <Link
            href="/blog"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted-foreground transition-colors hover:bg-lime/40 hover:text-teal"
          >
            ← Back to blog
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-[760px] flex-1 px-4 py-12 md:px-8 md:py-20">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal sm:text-xs">
            {formatDate(post.publishedAt ?? post.createdAt)}
          </p>
          <h1 className="mt-3 text-4xl leading-tight text-ink md:text-5xl">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-4 text-sm text-muted-foreground">
              By <span className="font-medium text-teal">{post.author}</span>
            </p>
          )}
          {post.excerpt && (
            <p className="mt-6 border-l-2 border-teal pl-4 text-lg italic leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="space-y-5 text-base leading-relaxed text-ink">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))
          ) : (
            <p className="text-muted-foreground">No content yet.</p>
          )}
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <Link
            href="/blog"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-teal px-5 text-sm font-medium text-white transition-colors hover:bg-teal/90"
          >
            ← Back to blog
          </Link>
        </div>
      </article>
    </main>
  );
}
