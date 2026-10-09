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
    summary: "Animated fit, an editable variable table with random fill, and a choice of loss.",
  },
];
