import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function PostLayout({
  post,
  children,
}: {
  post: PostMeta;
  children: React.ReactNode;
}) {
  return (
    <article>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{post.kicker}</p>
      <h1 className="mt-3 max-w-prose font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
        {post.title}
      </h1>
      <p className="mt-5 max-w-prose text-lg leading-8 text-ink-soft">{post.description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <span>{post.date}</span>
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-line bg-paper-raised px-2.5 py-1 text-ink-soft">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-10 space-y-8">{children}</div>
      <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <Link href="/theme" className="text-accent hover:text-ink">
          Theme rules
        </Link>{" "}
        apply to the next essay too.
      </p>
    </article>
  );
}
