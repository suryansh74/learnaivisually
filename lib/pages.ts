export type PageMeta = {
  slug: string;
  href: string;
  title: string;
  status: "working" | "planned";
  summary: string;
};

export const pages: PageMeta[] = [
  {
    slug: "linear-regression",
    href: "/linear-regression",
    title: "Linear regression",
    status: "working",
    summary: "Theory first, then a line or a plane you can train, edit, and calculate step by step.",
  },
  {
    slug: "binary-cross-entropy",
    href: "/binary-cross-entropy",
    title: "Binary cross-entropy",
    status: "working",
    summary: "Sigmoid, two-class labels, and logistic regression. The next page after the line.",
  },
  {
    slug: "categorical-cross-entropy",
    href: "/categorical-cross-entropy",
    title: "Categorical cross-entropy",
    status: "working",
    summary: "Softmax and multi-class labels. The next page after binary cross-entropy.",
  },
  {
    slug: "pca",
    href: "/pca",
    title: "PCA, a side demo",
    status: "working",
    summary: "Not regression. A small view of squeezing many axes into the directions that vary most.",
  },
];
