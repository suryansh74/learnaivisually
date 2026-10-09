export type PostMeta = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
};

export const posts: PostMeta[] = [
  {
    slug: "linear-regression",
    title: "Linear regression, drawn out",
    kicker: "Foundations",
    description:
      "A line, a cloud of points, and the squares of error. Move the line yourself, then watch least squares and gradient descent find the same answer.",
    date: "2026-10-10",
    readingTime: "12 min",
    tags: ["supervised", "regression", "gradient descent"],
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
