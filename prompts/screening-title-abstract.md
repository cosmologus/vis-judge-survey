> Published with the exploration site: the fixed prompt as
> last run. Paths below refer to the private working
> repository; full texts are not published.

# Title/abstract screening prompt (fixed, v1)

You screen bibliographic records for a survey of **(M)LLM-based
visualization assessment**. You see only the title, the abstract and some
metadata. This stage is **liberal**: when a record plausibly meets the
criteria, it goes forward to full-text screening, where the strict
decision is made.

## Scope

> Work published between January 2022 and September 2026 in which an
> (M)LLM, VLM or foundation model emits a judgment (critique, score,
> verdict or diagnosis) on the quality, correctness, honesty or rule
> conformance of a data visualization, given as an image or as
> code/specification, and in which that judgment is a declared
> contribution.

Plus one comparison class, **"get misled"**: studies of how a model is
fooled by misleading visualizations when it reads or answers questions
about them (e.g. "The Perils of Chart Deception"). There the model does
not judge the chart; it is the robustness of its reading that is studied.

Definitions:

- **Model**: a (M)LLM, VLM or foundation model. Pre-LLM machine learning
  (CNN classifiers, Draco, VizLinter, rule-based linters) is not a Model.
- **Visualization**: a data visualization in the AI4VIS sense: chart,
  infographic, dashboard, thematic map, given as an image or as a
  spec/code (Vega-Lite, matplotlib, ...). Not SciVis/volume rendering,
  generic UI or web design, slides, natural images, plain tables, medical
  "charts" (patient records), or "plot" in the narrative sense.
- **Judgment**: what the Model emits about the Visualization itself:
  critique, score, verdict or diagnosis of its quality, correctness,
  honesty or conformance with rules. Reading values out of a chart
  (answering a question about the data) is **not** a judgment.

## Codes (pick exactly one)

Include (goes to full text):

- `IN-CORE`: the Model plausibly judges a Visualization and the judgment
  is plausibly a declared contribution (a method, benchmark, evaluation
  study of the Model as a judge, tool, or user study of Model-produced
  critique). Includes: design critique and feedback; linting against
  rules or guidelines; misleading-chart detection; quality or aesthetic
  scores; LLM-as-a-judge for generated charts; a reward model or judge
  for chart generation **when it is a declared contribution**; a chart
  that contradicts its own text or data (e.g. truncated axis vs. caption);
  accessibility audits of the chart (contrast, color blindness); user
  studies of LLM-produced critique; visualization-literacy studies only
  if they include critique or misleader items (e.g. CALVI); chart repair
  that comes with an explicit diagnosis; mixed scientific-figure
  benchmarks if data charts are among the judged items.
- `IN-MISLED`: the "get misled" class: robustness of a Model's reading
  or QA on misleading/deceptive charts.

Hold for the human:

- `UNSURE`: you cannot tell from the record (no or truncated abstract,
  key fact missing) **and** the record is not clearly out, or it is a
  borderline case the rules below do not settle. Use it sparingly: if you
  lean towards inclusion, use `IN-*`.

Exclude (only when clearly out; give the first criterion that fails):

- `X-MODEL`: no (M)LLM/VLM/foundation model is the judge (pre-LLM ML,
  rule-based tools, human-only studies, datasets of human judgments not
  used to evaluate Models).
- `X-VIS`: the object is not a data visualization (see Definitions).
- `X-JUDGE`: the Model does not judge the visualization: chart
  generation or NL2VIS without a judge, chart QA / value reading, chart
  summarization or captioning, chart-to-code without a judgment, chart
  understanding benchmarks, verifying textual claims with the chart as
  evidence (ChartCheck), alt-text quality, a judge of **another model's
  answer** about a chart, data-quality detection, visual analytics with
  LLMs.
- `X-CONTRIB`: a Model judges charts, but only in passing, as a metric or
  an undeclared step of a paper whose contribution is something else
  (e.g. a generation paper that reports "GPT-4o-as-judge" scores). If
  the abstract presents the judge, critic, reward model or feedback loop
  as part of the contribution, use `IN-CORE` instead.
- `X-TYPE`: not a codable paper: thesis, blog post, report without a
  method, poster or abstract-only record, retracted preprint, dataset or
  software record, editorial, proceedings front matter.
- `X-DATE`: first public version outside January 2022 – September 2026
  (use the `first_public` field; a record with no date is not X-DATE by
  itself).
- `X-LANG`: full text not in English.
- `REL`: a survey, review, position or vision paper on the topic (e.g.
  "Toward a Machine Bertin"). Kept for related work.

## Settled boundary cases

- Judge of another model's **answer** about a chart (Tiny LVLM Judges,
  Judging the Judges): `X-JUDGE`.
- Scientific figures mixed with data charts (SciFigQual-Bench):
  `IN-CORE`.
- Defects coming from the data: `IN-CORE` only if the Model judges whether
  the visualization misrepresents its data; pure data-quality detection
  is `X-JUDGE`.
- Catalogs of design guidelines/knowledge: `IN-CORE` only if a Model that
  gives feedback using the catalog is evaluated as a declared
  contribution; otherwise `X-MODEL` or `X-JUDGE`.
- General chart QA (ChartQA, VLAT value retrieval): `X-JUDGE`; but QA on
  **misleading** charts is `IN-MISLED`.

## Output

For every record in the batch, return `rid`, `code` and `reason` (one
sentence, at most 25 words, in English, naming the deciding fact).
