/**
 * Where new material goes. Read this before adding a topic or a paragraph.
 * A topic gets its own page. Do not hang a different topic off an existing one.
 */
export const lessonSections = [
  { id: "theory", place: "Page file, above the bench", rule: "Keywords use Term. Loss vs cost is explained on the page that uses that loss." },
  { id: "graph", place: "Bench, first panel", rule: "2D and 3D when the model has one or two inputs. Axis numbers and hover values." },
  { id: "orbit", place: "3D graph controls", rule: "Drag to orbit. X, Y, Z arrows nudge a few degrees. Reset view returns the original angle." },
  { id: "parameters", place: "Bench, beside the graph", rule: "Editable fields. The line, plane, or curve moves immediately." },
  { id: "train", place: "Same panel as parameters", rule: "Train animation, one step, reset parameters. Learning rate is a field." },
  { id: "loss", place: "Bench, under the graph", rule: "Named loss, formula, current number, trail with axis values, step history." },
  { id: "table", place: "Bench, beside the loss", rule: "Add row, remove row, random fill. Predicted column updates with the fit." },
  { id: "predict", place: "Bench, beside parameters", rule: "Input fields and an output. Uses the current parameters, not a new fit." },
  { id: "calculation", place: "Below the bench", rule: "Button opens row-by-row arithmetic. Show at most 30 rows, then …" },
  { id: "next", place: "Bottom of the page", rule: "Next button only to the next dedicated topic page." },
] as const;

export const placement = {
  newTopic: "Add lib/pages.ts, app/<slug>/page.tsx, and a bench component. Link it with NextPage from the previous topic.",
  newLoss: "Theory block on that topic page, formula in the loss panel, arithmetic in the detailed calculation.",
  newKeyword: "Wrap with Term in the theory section. Do not invent a second color.",
  notHere: "Do not add a side topic, such as PCA, inside another page. It waits for its own page.",
} as const;
