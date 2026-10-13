> Published with the exploration site. Paths below (`pilot/`,
> `iterations.md`, `corpus/fulltext/`) refer to the private
> working repository; the coded data are in `data/`.

# Codebook (frozen v1.7, 2026-10-07)

Taxonomy (layer 1) and per-Condition extraction form (layer 2) for the
survey of (M)LLM-based visualization assessment. Frozen after the pilot
(ticket 09): four iterations on 14 papers, logged in `iterations.md`; the
pilot records are in `pilot/`. A change forced after the freeze opens a new
iteration and recodes the field it touches. v1.3 = v1.2 plus the Condition
fields `fp_penalized` and `metric_direction` (items 26–27 in
`iterations.md`), added before the full coding for the H1 test. v1.4 =
v1.3 plus three rules from the probe lot of the full coding (items 28–30):
a reported test counts as a CI for `vs_chance`, ratings with no overall
score, and comparative vs absolute verdicts. v1.5 = v1.4 plus three rules
from the blind-coding agreement (items 31–33): `vs_chance = n/a` on `fix`
Arms, `cue_channel = NA` when there is no cue, and `verdict_target` by the
subject of the verdict. v1.6 adds which sentence is a Condition's verdict
and two `metric_direction` rules (items 34–35). v1.7 adds one scope rule
from the reconciliation (item 36): agreement among Models is not a
reference.
When a paper does not fit, code your best guess **and** log an ambiguity.
Never silently force a fit.

## Terms

- **Model**: an (M)LLM, VLM or foundation model. Pre-LLM ML and rule-based
  linters are not Models.
- **Visualization**: data visualization (chart, infographic, dashboard,
  thematic map), as image or as spec/code.
- **Judgment**: what a Model emits about the Visualization itself:
  critique, score, verdict or diagnosis of its quality, correctness,
  honesty or rule conformance. Reading values (answering a data question)
  is not a Judgment.
- **Prompt cue**: how much the **Model's input** tells it that the
  Visualization has a problem. The input is the prompt text **and**
  anything attached (checker outputs, execution reports, extracted data,
  captions) **and** the requested output schema. Two facets:
  - `cue_assertion`: `none` (no problem mentioned) / `possible` (a problem
    is presented as possible: "may or may not be misleading", "check
    whether it has these issues", a rubric whose anchors name defects) /
    `asserted` (the input states there is a problem).
  - `cue_specificity`: `none` (nothing about the problem type) /
    `generic list` (the same checklist of problem types for every item,
    flawed or control; a single named type counts, with
    `n_list_items = 1`) / `actual` (information that depends on this
    item's real error, so it differs between flawed and control items).
  - A rubric of **quality criteria** (aesthetics, readability, similarity
    aspects) is not a checklist of problems: specificity `none`, and
    record `n_criteria`. Assertion is `possible` only if the rubric names
    defects; otherwise `none`.
  - A question that names a location but no problem type ("is the title
    appropriate?") is `possible × none`.
  - **Not cue vs cue** (Q18). The test is the component, not the Model
    that runs it. Steps **inside the system whose final output this Arm
    scores** are not cue (e.g. an extractor agent's notes passed to the
    solver of the same pipeline; a checklist filtered from the Model's own
    earlier answers in the same dialogue): code them under `pipeline` and
    set `self_generated_cue = y`. Outputs of a **separate component** that
    the paper presents as its own checker or evaluator, fed into the
    evaluated call, **are** cue, channel `input`, whether that component
    is rule-based or run by the same Model. Example: VisEval's readability
    evaluator receives "reviews" from a rule-based layout checker and from
    a GPT-4V scale & ticks checker; both are cue.
  - **Not cue** (Q19): per-item auxiliary data that does not state a
    problem (a gold reference image or code, values extracted from the
    vis, a data table from DePlot). Record it in `aux_input`; specificity
    stays what the prompt says.
  - True (VIS) Lies A/B/C = possible×none, asserted×none, asserted×actual.
- **Arm** = Prompt cue × task × set of visualizations, plus the other
  prompt variables, applied to one or more Models. Described once, from
  the method.
- **Condition** = Arm × Model, for which the paper reports a separate
  result.

## Procedure: two passes

- **Pass 1** reads the full text and codes, **from the method only**, the
  Taxonomy, the Arms and the Condition skeleton. Do not use any result
  (numbers, verdicts) even though the text contains them; if a result
  shaped a coding choice, say so in `cut_leakage`.
- **Pass 2** reads the full text plus the pass-1 record and fills
  results, verdicts and contrasts. It may (Q20): (i) **merge** Arms to the
  level at which the **authors' own metric** is reported (e.g. a
  factorial design reported only on marginals), keeping the pass-1 ids in
  `merged_from`;
  (ii) **add** Arms that pass 1 missed and that have a reported result,
  marked `added_in_pass2`. Any other change to an existing Arm or to the
  Taxonomy is a change request; a reconciliation step applies them, and
  requests that touch cue fields go to the user.

## Layer 1: Taxonomy (one record per paper)

MECE per dimension by default. Multi-label only where the paper really
does several things; then list all values. Every paper gets every
dimension, including papers with `arms = []`: code D2–D7 from the system
or study the paper describes (D1 = `n/a`). In abstract-only papers, a
field the abstract does not inform is `NA`; `?` is only for real doubt.

| Dim | Field | Values |
|---|---|---|
| D1 | `cue_cells` (multi) | cells `assertion×specificity` over all Arms, e.g. `possible×none`; `n/a` if `arms = []` |
| D2 | `task_form` (multi) | `verdict`, `diagnose`, `explain`, `score`, `compare`, `advise`, `fix`, `get-misled` |
| D3 | `model_families` (multi) | `openai-gpt`, `google-gemini`, `anthropic-claude`, `meta-llama`, `qwen`, `internvl`, `llava`, `deepseek`, `mistral`, `other-open`, `other-closed`, `own-finetuned` |
| D3 | `model_years` | min and max vendor release year of the Models in Conditions; `reasoning_models` y/n |
| D4 | `chart_source` (multi) | `real-world` (web, social, news) / `curated-gallery` / `existing-dataset` / `synthetic` (programmatic) / `model-generated` / `human-made-for-study` |
| D4 | `ground_truth` (multi) | `dataset-labels` / `own-annotation` / `experts` / `crowd` / `rule-engine` / `reference-artifact` (gold vis/code) / `model-labels` / `none` |
| D5 | `input_modality` (multi) | `image` / `declarative-spec` / `imperative-code` / `text-description` |
| D6 | `vis_type` (multi) | `chart` / `infographic` / `dashboard` / `multi-view` / `map` / `scientific-figure (mixed)` |
| D7 | `judgment_role` (multi) | `object` (the Model's ability to judge is what is measured) / `instrument` (a validated judge used as a metric for generated vis) / `component` (the Judgment sits inside a system or tool and is not evaluated on its own) |

**D2 `task_form`** (one value per Arm; the paper takes the union):

- `verdict`: binary or ordinal decision that a flaw / misleadingness is
  present (incl. a Likert of how misleading).
- `diagnose`: names the flaw, violated rule, misleader type or rhetoric
  technique.
- `explain`: free-text account of why the vis is flawed.
- `score`: numeric or Likert rating of quality on criteria.
- `compare`: preference or ranking between visualizations.
- `advise`: design feedback or recommendations for a designer.
- `fix`: produces a corrected vis / spec / code.
- `get-misled`: answers data questions on misleading vis (no Judgment).

**Paper-level fields:**

- `judgment_evaluation`: `vs-reference` (the Judgment is compared with a
  reference) / `indirect-outcome` (only downstream outcomes are measured,
  e.g. design improvement) / `none` / `unknown` (abstract-only, unclear).
- `reporting_inconsistencies`: count + list (text vs table mismatches,
  impossible values, model lists that differ between sections) — pass 2.

**Context labels** (no κ, no stopping rules; still code them):

- `model_adaptation` (multi): `zero-shot`, `few-shot`, `fine-tuned`,
  `rl`, `agentic-pipeline`, `persona`.
- `judgment_object` (multi): `misleadingness`, `design-quality`,
  `aesthetics`, `readability`, `rule-compliance`, `fidelity-to-reference`,
  `fidelity-to-intent`, `interaction`, `other`.
- `contribution_type` (multi): `empirical-study`, `benchmark`, `system`,
  `judge-or-metric`, `dataset`, `method`.
- `independence_risk` (multi): `judge-is-generator`,
  `judge-trained-on-reference`, `stimuli-possibly-in-training`,
  `none-noted`.
- `application_domain`: free text or `general`.

**Dimension candidates.** Keep logging properties that separate papers
in the meta-characteristic's sense and are not captured by D1–D7 or the
context labels (`dimension_candidates`: name, value, why). Iteration 2
checks whether any of them forces an 8th dimension.

## Layer 2: Extraction form

**Scope.** Arms exist only where the paper reports a result
(quantitative or qualitative) of a Judgment against a reference, or a
get-misled result. Data-reading tasks are Arms **only on misleading
visualizations** (get-misled); reading tasks on ordinary charts (VLAT,
ChartQA) are not coded. Agreement among several Models with none
designated as the reference (e.g. Cronbach's α across judges) is
reliability, not a Judgment against a reference: not an Arm; note it
(item 36). One Model's outputs designated as the reference stay
`model-labels`. Papers without such a result: `arms = []`, with
`no_arms_reason` and `judgment_evaluation`. An abstract-only paper whose
abstract does not show a Judgment against a reference: `arms = []`,
`judgment_evaluation = unknown`.

**Arm granularity.**

- Different prompts (or different inputs, e.g. image vs image + text)
  applied as separate conditions = different Arms.
- Different Models, including fine-tuned or otherwise adapted variants of
  a base Model, are Conditions of the same Arm, never separate Arms
  (`factor_varied = model`).
- One task (D2 value) per Arm. A prompt whose outputs are scored as
  different D2 values (e.g. verdict + diagnosis) gives one Arm per value,
  same cue.
- Sub-scores of one rating (e.g. six criteria + overall) stay in one Arm:
  the primary metric is the overall score; sub-scores go to
  `other_metrics`. **No overall score** (item 29): `metric` names the
  per-criterion metric, `value` is a map `{criterion: value}`,
  `vs_chance` is the majority over criteria (tie → `unknown`), with the
  per-criterion values in `vs_chance_by_criterion`; a contrast's
  `direction` is the majority over criteria (tie → `=`), with the
  per-criterion values in `direction_by_criterion`.
- The same prompt on two vis sets the paper treats separately = two Arms.
- Breakdowns (per misleader type, per chart type) are not Arms unless the
  paper treats them as separate experiments.

### Arm fields (pass 1)

- `arm_id` (`A1`, …), `label` (paper's name).
- Cue: `cue_assertion`, `cue_specificity`, `cue_channel` (multi:
  `prompt` / `input` / `output-schema`), `cue_varies_by_item` y/n (if y,
  code the cell for flawed items and explain in a note),
  `cue_on_control` (`same` / `none` / `different` / `not reported`),
  `n_list_items` (checklist length, else NA), `list_closed` y/n/NA (the
  checklist is exactly the label space of the set), `n_criteria` (rubric
  length, else NA), `cue_quote` (verbatim text that sets the cue, or
  `not available`), `prompt_source` (`verbatim-in-paper` /
  `repo-or-supplementary` / `described-only` / `missing`).
- `cue_channel` is `NA` when the cell is `none×none` (no cue, no
  channel; item 32).
- `self_generated_cue` y/n (Q18). `aux_input` (multi, Q19): `none` /
  `reference-artifact` / `extracted-data` / `caption-or-post` /
  `checker-output` / `execution-evidence`. `checker-output` and
  `execution-evidence` usually carry cue (channel `input`); the others do
  not.
- `task_form` (D2 value).
- Other prompt variables: `cot` (`none` / `free-form` /
  `structured-or-multi-turn`), `few_shot` (k), `definitions` y/n/NA,
  `pipeline` (`single` / `multi-turn` / `multi-agent` / `tool`).
- Set: `vis_set` (name), `input_modality`, `n_flawed`, `n_control`,
  `result_on_control` y/n; no control → `flag_possible_eq_asserted = y`.
  For `score` / `compare` / `advise` Arms these four fields are `NA`.
  In multi-label checklist detection, negatives at the scored level (a
  chart without a given rule violation) count as controls; set the flag
  to `y` only if the primary metric cannot penalize false positives.
- Contrasts: `contrast_group` (list of ids; NA if none), `factor_varied`
  (`cue`, `cot`, `few-shot`, `definitions`, `model`, `vis-set`,
  `persona`, `modality`, `pipeline`, `other:<x>`).
- RQ3 reporting, each `explicit` / `inferred` / `missing` /
  `abstract-only`: `rq3_cue`, `rq3_task`, `rq3_model_version`,
  `rq3_vis_set`, `rq3_ground_truth`, `rq3_metric_def`,
  `rq3_uncertainty`. Plus `prompt_public` y/n, `data_public` y/n.
  Abstract-only papers: all RQ3 statuses `abstract-only` (they leave the
  RQ3 denominators).

### Condition fields

**Which Conditions.** A Condition = a Model presented as such in a
results table for that Arm, in the main text or in the appendix. Training
checkpoints and training-ablation end-points of the same Model go to
`other_metrics`, not new Conditions. (Ablations of the prompt or input
are Arms, see Arm granularity.) An aggregate-over-models row is a Condition
(`aggregated = y`) only when there are no per-model results.

- Skeleton (pass 1): `cond_id` (`A1.M1`), `arm_id`, `model_string`
  (exact), `model_family` (D3), `release_date` (vendor release, from your
  knowledge, marked `unverified`), `release_year`, `reasoning` y/n,
  `open_closed`, `aggregated` y/n.
- Reference: `ref_type` (D4 `ground_truth` values), `n_annotators`,
  `annotator_agreement` (as reported, else NA). When the same humans are
  both the reference and the human baseline, `ref_type` is that group and
  `human_baseline` is their own score, with
  `human_baseline_basis = inter-annotator`.
- Result (pass 2):
  - `metric`: the **primary** metric = the one the authors use for their
    main claim (abstract, conclusions); on a tie, the chance-corrected one
    (MCC, κ, AUC, r) over raw ones (accuracy, F1, MAE); among several
    chance-corrected ones, the first the authors list in the central
    table. A metric derived by the coder is never the primary metric; if
    no metric of the authors exists for the Arm, `metric = NA` and log it.
    Others → `other_metrics`. When the paper gives counts
    (confusion tables), also derive MCC into `other_metrics`, marked
    `derived` (Q22). Qualitative-only results: `metric = qualitative`,
    `vs_chance = unknown`.
  - `metric_direction` of the primary metric: `higher-better` (F1, MCC,
    accuracy, AUC, r) / `lower-better` (MAE, MSE, error rate) /
    `target-value` (the ideal is a reference level, e.g. a sensitivity
    score whose ideal is the human value) / `none` (no quality direction,
    or `qualitative`). In contrasts, `↑` / `↓` keep the numeric sense;
    whether a change is an improvement follows from `metric_direction`.
    `metric = NA` → `metric_direction = NA`; ordered agreement categories
    (Y / P / N, good / fair / poor) → `higher-better` (item 35).
  - `value`, `value_source` (`table` / `text` / `figure` /
    `reconstructed`). **Any `reconstructed` value must be checked on the
    PDF page** (`corpus/fulltext/pdf/<rid>.pdf`); record `pdf_checked`
    y/n.
  - Baselines: `chance_baseline` (random answering at the set's
    prevalence) and `trivial_baseline` (the **best constant predictor for
    that metric**: majority class for accuracy, always-positive /
    flag-all for F1 or recall on the positive class, a constant at the
    human mean for MAE / MSE), each reported or `derived`.
    Chance-corrected metrics (MCC, κ, AUC, r) use their built-in 0 / 0.5.
  - `vs_chance` (`above` / `at` / `below` / `unknown` / `n/a`), against
    the **stricter** of the two baselines. `at` = the baseline lies inside
    the reported CI, or a test the paper reports against that same
    baseline is not significant (p ≥ 0.05; item 28); with neither a CI
    nor such a test, |value − baseline| ≤ 2% of the metric's range (0.02
    on a 0–1 scale, 0.08 for MAE on a 1–5 scale). A test between two
    Conditions is not a test against the baseline.
    `below_trivial_other` y/n: some metric in
    `other_metrics` is at or below its own trivial baseline (Q22).
  - `fix` Arms: `vs_chance = n/a` (item 31). A fix is generation, not a
    Judgment; a no-op baseline (input left unchanged) measures whether the
    edit helps, not whether the Model judges above chance.
  - If the primary metric cannot penalize false positives (e.g. a
    Relevance score = share of target issues named; recall on a set with
    only flawed items), `vs_chance = n/a` and
    `flag_possible_eq_asserted = y` (Q24).
  - `fp_penalized` y/n: on the set it is computed on, the primary metric
    goes down when the Model flags a problem that is not there (negatives
    exist at the scored level: clean charts, or absent rules / labels in
    multi-label tasks). A verdict on a set with no clean items is `n`.
    Unlike `flag_possible_eq_asserted`, it does not turn `y` just because
    the Arm has no control charts. `NA` for `score` / `compare` /
    `advise` / `get-misled` Arms and for qualitative results. Paired difference scores on
    get-misled (e.g. Deception Score), where chance equals the ideal
    value: `n/a`.
  - `human_baseline` (value + who), `human_baseline_basis`
    (`single-human` / `mean-of-humans` / `inter-annotator` /
    `published-norm`), separate from the reference.
- Verdict (pass 2): `authors_verdict` (`strong` / `weak` / `mixed` /
  `comparative-only` / `not stated`). Anchors (Q21): `strong` = the
  authors call the ability good, reliable, effective, high ("can",
  "aligns well"); `weak` = poor, limited, fails, struggles, near chance;
  `mixed` = two-sided wording ("moderate", "promising but", good on X but
  poor on Y); `comparative-only` = only relative to another condition or
  model. **Which sentence** (item 34): the most specific one first, i.e.
  a sentence about this Model on this Arm > a sentence about this Arm
  (prompt, setting) > the paper's general verdict on the ability
  (abstract, conclusions), inherited with `verdict_inherited = y`.
  When a passage has a comparative and an absolute part ("the best,
  but still limited"), the absolute part decides; `comparative-only` only
  when there is no absolute claim about the ability (item 30). A verdict
  on a group ("proprietary models", "most open-source models") passes to
  its members with `verdict_inherited = y`; a verdict that names the Model
  overrides it. `verdict_target` follows the **subject of the verdict**
  (item 33): the Models ("GPT-4o aligns well", "MLLMs struggle") →
  `model`; the authors' approach (a prompt, judge, metric, pipeline or
  training: "our judge", "gaze supervision", "structured prompting") →
  `method`; a tool with an interface → `system`. Also `verdict_target` (`model` / `method` / `system`; only
  `model` counts for RQ2),
  `verdict_contradicted` y/n (+ note: the paper's own numbers contradict
  it), `verdict_quote`, `verdict_loc`, `verdict_inherited` y/n (a verdict
  given at Arm level, inherited). `result_loc`.

### Within-study contrasts (pass 2)

For each `contrast_group`: pairs of Conditions with the same Model that
differ only by `factor_varied`: `from`, `to`, `direction` (↑ / ↓ / =, on
the primary metric), `significance` (as reported, else `not tested`),
`loc`. Arms with `cue_on_control = not reported` do not enter cue
contrasts on control items.

## Ambiguity log (both passes)

One entry per issue: `{field, where (paper / arm_id / cond_id), issue,
options, chosen, quote, loc, pass}`. Log only real hesitations; for
iteration 2, also say when a v1 rule settled what was an ambiguity in v0.

## Reliability (for the full coding)

- κ ≥ 0.70 on categorical fields: Taxonomy D1–D7; Arm: `cue_assertion`,
  `cue_specificity`, `cue_channel`, `self_generated_cue`, `aux_input`,
  `task_form`, `cot`, `pipeline`,
  `prompt_source`, `list_closed`, `result_on_control`, RQ3 statuses,
  `factor_varied`; Condition: `authors_verdict`, `verdict_target`,
  `vs_chance`, `fp_penalized`, `metric_direction`, `ref_type`. Numeric
  and text fields:
  exact-match rate.
- Blind sample: 20% of papers, stratified (detection / scoring / judge
  v1.1 / get misled), same for Taxonomy and form. The user codes all Arms
  and at most 20 Conditions per paper, random and stratified over Arms.
- Procedure (ticket 16). The pool excludes papers whose codes the user has
  seen (pilot, probe lot); strata are set after pass 1. Step 1: the user
  lists the Arms of each paper blind (label, location, what makes it an
  Arm); agreement on units is reported. Step 2: the user gets the agent's
  skeleton (Arm labels, model strings, no codes) and codes the κ fields
  above plus `metric` and `value` (exact match); quotes, notes and counts
  are not coded blind. κ compares the user with the agent's **unreconciled**
  pass-2 record; reconciliation of sample papers waits until the user's
  coding is in. Disagreements are arbitrated by the user.
