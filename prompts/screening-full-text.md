> Published with the exploration site: the fixed prompt as
> last run. Paths below refer to the private working
> repository; full texts are not published.

# Full-text screening prompt (fixed, v1)

You screen papers for a survey of **(M)LLM-based visualization
assessment**. Each paper already passed the liberal title/abstract stage.
This stage is **strict**: a paper stays in only if the full text shows
that it meets every criterion. You decide from the full text; when there
is none, from the abstract.

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
  A fine-tuned VLM or an LLM agent is a Model; a CLIP-style scorer is a
  foundation model.
- **Visualization**: a data visualization in the AI4VIS sense: chart,
  infographic, dashboard, thematic map, given as an image or as a
  spec/code (Vega-Lite, matplotlib, ...). Not SciVis/volume rendering,
  generic UI or web design, slides, natural images, plain tables.
  Scientific figures count only if data charts are among the judged items.
- **Judgment**: what the Model emits about the Visualization itself:
  critique, score, verdict or diagnosis of its quality, correctness,
  honesty or conformance with rules. Reading values out of a chart
  (answering a question about the data) is **not** a judgment.

## The contribution test (strict)

Ask: **if the Judgment were removed, would the paper still stand?**

- **No** → the Judgment is the paper's object: it studies how well a Model
  judges visualizations, or it builds a judge, critic, scorer, linter,
  feedback tool or judge benchmark as its main result. → `IN-CORE`.
- **Yes** → the Judgment is a component of a paper about something else,
  usually chart generation or editing. → `X-CONTRIB`, **even if** the
  judge is listed among the contributions or validated against humans.
  Give the subtype:
  - `metric`: a Model-as-judge used as an evaluation metric of a
    generation/editing benchmark or system;
  - `loop`: a critic, verifier or self-reflection step inside a
    generation/editing pipeline;
  - `reward`: a Model-based reward or preference signal for training a
    generator;
  - `other`: anything else (say what in `reason`).

The test applies by analogy to the "get misled" class: robustness to
misleading charts must be what the paper studies, not one subset among
many in a general chart-QA benchmark. If it is only a subset →
`X-CONTRIB`, subtype `other`.

A paper that does both (e.g. a judge benchmark **and** a generator) is
`IN-CORE` when the judge part would stand as a paper on its own.

**Amendment v1.1 (2026-10-05): when the judge part stands on its own.**
After the user's review, the clause above is made explicit and is
re-applied to every `X-CONTRIB` paper. The judge part stands on its own,
so the paper is `IN-CORE`, only when **both** hold:

1. **Separate artifact**: the judge is presented as its own method, metric
   or model with a name or a dedicated description (e.g. "Vision Score",
   "DashJudge-8B", a described LLM-as-a-judge workflow), not just "we
   prompt GPT-4o to rate the chart".
2. **Dedicated validation**: the paper validates the judge itself against
   human or expert judgments (or a ground truth of chart quality) in a
   dedicated experiment, section or table, and reports the agreement
   (correlation, κ, accuracy, agreement rate, ...). A one-sentence mention
   in passing ("we manually checked a sample", "it correlates well") is
   not enough.

Otherwise the paper stays `X-CONTRIB`, with its subtype.

## Codes (pick exactly one)

- `IN-CORE`: meets the scope and passes the contribution test.
- `IN-MISLED`: the "get misled" class, passing the test by analogy.
- `UNSURE`: the text does not settle it, or the rules below do not cover
  the case. Use it sparingly and say exactly what is unclear.
- `X-MODEL`: no (M)LLM/VLM/foundation model is the judge.
- `X-VIS`: the judged object is not a data visualization.
- `X-JUDGE`: the Model does not judge the visualization: generation
  without a judge, chart QA / value reading, captioning, chart-to-code
  without a judgment, verifying textual claims with the chart as evidence
  (ChartCheck), alt-text quality, a judge of **another model's answer**
  about a chart, data-quality detection.
- `X-CONTRIB`: fails the contribution test (give the subtype).
- `X-TYPE`: not a codable paper: thesis, blog post, report without a
  method, poster or conference abstract with no paper behind it,
  retracted preprint, dataset/software-only record, editorial.
- `X-DATE`: the **first public version** (e.g. arXiv v1) is outside
  1 January 2022 – 30 September 2026. Check the date printed on the paper
  or its arXiv stamp, not only the metadata.
- `X-LANG`: full text not in English.
- `X-DUP`: the same work as another record in the corpus. Give `dup_of`.
  A preprint and its published version are one work. A journal extension
  is merged with its conference paper **unless** the extension adds a new
  Judgment (a new task, model family or judged property). Keep the record
  with the earliest first public version and mark the other `X-DUP`.
- `REL`: a survey, review, position or vision paper on the topic. Kept for
  related work.

Give the **first** criterion that fails, in the order above (Model, Vis,
Judge, Contrib, Type, Date, Lang, Dup).

## Settled boundary cases

- Judge of another model's **answer** about a chart (Tiny LVLM Judges,
  Judging the Judges): `X-JUDGE`.
- Scientific figures mixed with data charts (SciFigQual-Bench): in, if
  data charts are among the judged items.
- Defects coming from the data: in only if the Model judges whether the
  visualization misrepresents its data; pure data-quality detection is
  `X-JUDGE`.
- Catalogs of design guidelines/knowledge: in only if a Model that gives
  feedback using the catalog is evaluated as a declared contribution.
- General chart QA (ChartQA, VLAT value retrieval): `X-JUDGE`; but QA on
  **misleading** charts can be `IN-MISLED`.
- Visualization-literacy studies: in only if they include critique or
  misleader items (e.g. CALVI) and report them separately.
- Chart repair: in if it comes with an explicit diagnosis of what is wrong
  and the diagnosis would stand on its own.
- LLM personas or simulated users rating or ranking charts: in, if the
  ratings judge the charts themselves (preference, effectiveness,
  aesthetics), not the data.

## How to read

The text of each paper is at `corpus/fulltext/txt/<rid>.txt` (plain text
from the PDF, reading order). Do not read whole files. Read the start
(title, abstract, introduction, contributions list): usually the first
~300 lines. Then search the file for the terms that decide the case
(judge, critic, evaluat, score, reward, feedback, misleading,
contribution, arXiv date) and read only those passages. Skip the
references. When `fulltext` is `abstract-only`, decide from the abstract
given in the batch; if the abstract does not settle a criterion, the
paper stays in (it will be coded from the abstract), unless it clearly
fails.

## Output

For every paper in the batch, return:

- `rid`;
- `code`;
- `subtype`: for `X-CONTRIB` one of `metric` / `loop` / `reward` /
  `other`, otherwise empty;
- `dup_of`: the kept rid for `X-DUP`, otherwise empty;
- `first_public`: the first public date you found (YYYY-MM-DD or
  YYYY-MM), or empty;
- `evidence`: a verbatim quote of at most 40 words from the text (or the
  abstract) that decides the case;
- `where`: section or page of the quote (`abstract` if from the abstract);
- `reason`: one sentence, at most 30 words, in English, naming the
  deciding fact.
