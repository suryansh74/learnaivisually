# Theme: Ink & Paper

This file is the contract for every future essay.

## Tokens

Defined once in `app/globals.css` and mirrored in `lib/theme.ts`. Tailwind maps them in `tailwind.config.js`.

| Token | Hex | Use |
| --- | --- | --- |
| paper | #f3eee4 | page background |
| paper-raised | #fffdf8 | cards, equations |
| ink | #1c1915 | titles, reference line |
| ink-soft | #3d3832 | body copy |
| muted | #6e675e | meta, axes |
| line | #e3dacb | borders, grid |
| accent | #1e4d6b | labels, links, data points |
| accent-soft | #e6f0f4 | callouts |
| highlight | #c9842a | the thing being learned |
| residual | #b55248 | error, loss |
| good | #2d6a4f | converged or correct |

## Type

- Display: Fraunces (`font-display`)
- Body: Source Serif 4 (`font-body`)
- Mono: IBM Plex Mono (`font-mono`)

Loaded in `app/layout.tsx` through `next/font`. Do not add another Google font for a single post.

## Adding a blog

A new essay is a new route plus a registry entry. It is not a new layout.

```tsx
<PostLayout post={post}>
  <Equation>ŷ = w x + b</Equation>
  <Callout label="Look here">...</Callout>
</PostLayout>
```
