# Learn AI Visually

Visual essays on machine learning. One shared theme, so a new post looks like the next page of the same notebook.

Home is the page list. The working page is `/linear-regression`: play the fit, edit the variable table, random-fill it, and switch the loss between MSE, MAE, and Huber.

## Run it

```bash
git clone https://github.com/suryansh74/learnaivisually.git
cd learnaivisually
npm install
npm run dev
```

Open http://localhost:3000

## Theme

Colors, fonts, and essay rules live in `lib/theme.ts` and `app/globals.css`. Tailwind classes (`bg-paper`, `text-ink`, `text-highlight`, `text-residual`, `font-display`) read those tokens. The `/theme` page is the human-readable version.

Do not give a new essay its own palette. Amber is the thing being learned. Terracotta is error. Ink is the reference. Accent is navigation and labels.

## Add an essay

1. Add metadata in `lib/posts.ts`.
2. Create `app/blog/<slug>/page.tsx`.
3. Wrap the page in `PostLayout` and use `Equation` / `Callout`.
4. Keep interactive pieces as client components. Leave the page as a server component.
