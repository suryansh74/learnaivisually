"use client";

import { useState } from "react";

function softmax(scores: number[]) {
  const shifted = scores.map((score) => score - Math.max(...scores));
  const exps = shifted.map((score) => Math.exp(score));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
}

const classes = ["setosa", "versicolor", "virginica"];

export function CategoricalLesson() {
  const [scores, setScores] = useState([1.2, 0.3, -0.4]);
  const [truth, setTruth] = useState(0);
  const probs = softmax(scores);
  const loss = -Math.log(Math.max(probs[truth], 1e-8));

  return (
    <section className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">One example, three classes</p>
      <div className="mt-4 space-y-3">
        {classes.map((name, index) => (
          <label key={name} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 font-mono text-sm">
            <span className={truth === index ? "text-accent" : "text-muted"}>{name}</span>
            <input type="range" min={-2} max={3} step={0.05} value={scores[index]} onChange={(event) => setScores((current) => current.map((score, i) => (i === index ? Number(event.target.value) : score)))} />
            <span className="text-highlight">{probs[index].toFixed(2)}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {classes.map((name, index) => (
          <button key={name} type="button" onClick={() => setTruth(index)} className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${truth === index ? "bg-ink text-paper" : "border border-line text-muted"}`}>
            true {name}
          </button>
        ))}
      </div>
      <p className="mt-4 text-ink-soft">Softmax turns the three scores into probabilities that add to 1. Categorical cross-entropy only looks at the true class: −log(p_true) = {loss.toFixed(3)}.</p>
    </section>
  );
}
