# Lesson map

Read this before adding a page or a paragraph. The home list comes from `lib/pages.ts`. The same rules are in `lib/lesson-map.ts`.

A topic is its own page. Do not attach a different topic to an existing page.

| Section | Where it goes | Rule |
| --- | --- | --- |
| Theory | Page file, above the bench | Highlight keywords with `Term`. Explain loss and cost on the page that uses them. |
| Graph | Bench, first panel | 2D and 3D when there are one or two inputs. Axis numbers and hover values. |
| Orbit | 3D controls | Drag to orbit. X, Y, Z arrows nudge a few degrees. Reset view restores the original angle. |
| Parameters | Beside the graph | Typing a value moves the line, plane, or curve at once. |
| Train | Same panel | Train, one step, reset parameters, learning rate. |
| Loss | Under the graph | Formula, current number, trail with values, step history. |
| Table | Beside the loss | Add, remove, random fill. Predicted column follows the fit. |
| Predict | Beside parameters | Inputs in, output out. Same parameters, not a new fit. |
| Calculation | Below the bench | Open button. At most 30 rows, then … |
| Next | Bottom of the page | Only the next dedicated topic. |

New loss: theory block, loss panel, detailed calculation. New keyword: `Term` in the theory. New topic: `lib/pages.ts`, `app/<slug>/page.tsx`, a bench, and a next link from the previous page.
