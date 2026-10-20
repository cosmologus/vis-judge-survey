> Published with the exploration site: the fixed prompt as
> last run. Paths below refer to the private working
> repository; full texts are not published.

# Pass 2 prompt (full coding, codebook v1.6)

You code one paper for a survey of (M)LLM-based visualization assessment.
This is **pass 2**: fill the results on the pass-1 skeleton. The Arms are
frozen.

Paper: `{rid}` — {title} (text `{fulltext}`).

1. Read the codebook: `corpus/extraction/codebook.md` (frozen v1.6).
2. Read the pass-1 record: `corpus/extraction/agent/{rid}.p1.json`.
3. Read the paper's text, all of it, in chunks if needed: text `full` →
   `corpus/fulltext/txt/{rid}.txt`, plus the PDF
   `corpus/fulltext/pdf/{rid}.pdf` to check any value you reconstruct
   from a garbled table or figure; text `abstract-only` →
   `corpus/fulltext/abstract/{rid}.txt`.
4. Write `corpus/extraction/agent/{rid}.p2.json`: a copy of the pass-1
   record with `"pass": 2` and:
   - every Condition's result and verdict fields filled (`metric`,
     `metric_direction`, `value`, `value_source`, `pdf_checked`,
     `other_metrics`, `chance_baseline`, `trivial_baseline`, `vs_chance`,
     `below_trivial_other`, `fp_penalized`, `human_baseline`,
     `human_baseline_basis`, `authors_verdict`, `verdict_target`,
     `verdict_contradicted`, `verdict_quote`, `verdict_loc`,
     `verdict_inherited`, `result_loc`);
   - the paper-level `reporting_inconsistencies` (count + list) inside
     `taxonomy` (the one Taxonomy field pass 2 fills);
   - Conditions you find missing from the skeleton (a model with a
     separate result) added with `"added_in_pass2": true`; skeleton
     Conditions with no separate result kept with `metric = "NA"` and a
     note;
   - `contrasts`: list of `{contrast_group, factor_varied, model, from,
     to, direction, significance, loc}` (same Model, differing only in
     `factor_varied`);
   - Arms: you may **merge** Arms to the level at which results are
     reported (keep `merged_from`) and **add** Arms pass 1 missed that
     have a reported result (`added_in_pass2: true`), per the codebook.
     Do not otherwise edit Arms or Taxonomy; if they look wrong, add
     `arm_change_requests` / `taxonomy_change_requests`:
     `[{target, field, current, proposed, why, quote, loc}]`;
   - new ambiguities appended to `ambiguities` with `"pass": 2`;
   - keep `cut_leakage`; add `pass2_notes`.
5. Validate the JSON (`python3 -m json.tool`).

**Isolation.** Do not open any file under `corpus/extraction/` other than
the codebook, this paper's own pass-1 record and the file you write. In
particular, do not read the iteration log, the `pilot/` directory, or any
other paper's output.

Rules: follow the codebook for the primary metric, `metric_direction`,
the "Which Conditions" rule, both baselines, `vs_chance` and
`fp_penalized`. Quotes verbatim, ≤ 40 words, with location. The verdict
is the authors' own; don't infer it from numbers, but flag
`verdict_contradicted` when the numbers contradict it. Compute a derived
baseline from the design (prevalence, k-way MCQ → 1/k, constant
predictor at the human mean) and mark it `derived`; if you can't, `NA`
and `vs_chance = unknown`.

Reply with 3 lines only: Conditions filled, change requests, new
ambiguities, plus the one problem that worries you most.
