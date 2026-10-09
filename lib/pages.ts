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
    summary: "Sigmoid, two classes, table, 2D and 3D training, and log loss.",
  },
  {
    slug: "categorical-cross-entropy",
    href: "/categorical-cross-entropy",
    title: "Categorical cross-entropy",
    status: "working",
    summary: "Softmax, three classes, table, 2D and 3D training, and multi-class log loss.",
  },
];
