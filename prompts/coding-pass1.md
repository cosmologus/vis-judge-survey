> Published with the exploration site: the fixed prompt as
> last run. Paths below refer to the private working
> repository; full texts are not published.

# Pass 1 prompt (full coding, codebook v1.6)

You code one paper for a survey of (M)LLM-based visualization assessment.
This is **pass 1**: Taxonomy + Arms + the Condition skeleton, from the
method only. Results come in a separate pass 2; do not fill them.

Paper: `{rid}` — {title} (class `{cls}`, text `{fulltext}`).

1. Read the codebook: `corpus/extraction/codebook.md` (frozen v1.6).
   Follow it exactly.
2. Read the paper's text, all of it, in chunks if needed:
   - text `full`: `corpus/fulltext/txt/{rid}.txt`. Code from the
     **method** (and the appendix with prompts/setup). The text also
     contains results: do not use them (numbers, verdicts) for any coding
     choice. If a prompt or table is garbled, check the PDF
     `corpus/fulltext/pdf/{rid}.pdf`.
   - text `abstract-only`: `corpus/fulltext/abstract/{rid}.txt` (title +
     abstract). Set `"from_abstract": "y"` and follow the codebook's
     abstract-only rules (`NA` where the abstract does not inform a field;
     RQ3 statuses `abstract-only`).
   Do not open other papers, the web, or any other coding output.
3. Write **one JSON file**, `corpus/extraction/agent/{rid}.p1.json`:

```json
{
  "rid": "{rid}", "pass": 1, "codebook": "v1.6", "from_abstract": "n",
  "taxonomy": {
    "cue_cells": [], "task_form": [], "model_families": [],
    "model_years": {"min": null, "max": null, "reasoning_models": "n"},
    "chart_source": [], "ground_truth": [], "input_modality": [],
    "vis_type": [], "judgment_role": [],
    "judgment_evaluation": "",
    "context": {"model_adaptation": [], "judgment_object": [],
                "contribution_type": [], "independence_risk": [],
                "application_domain": ""},
    "dimension_candidates": [{"name": "", "value": "", "why": ""}],
    "evidence": {"<field>": "short quote or section"}
  },
  "no_arms_reason": null,
  "arms": [{"arm_id": "A1", "label": "", "...": "all v1.6 Arm fields"}],
  "conditions": [{"cond_id": "A1.M1", "arm_id": "A1",
                  "...": "all v1.6 skeleton + reference fields"}],
  "ambiguities": [{"field": "", "where": "", "issue": "", "options": [],
                   "chosen": "", "quote": "", "loc": "", "pass": 1}],
  "cut_leakage": "none | which results influenced which choice",
  "notes": ""
}
```

**Isolation.** Do not open any file under `corpus/extraction/` other than
the codebook and the file you write. In particular, do not read the
iteration log, the `pilot/` directory, or any other paper's output.

Rules:

- Field names and values exactly as in codebook v1.6. Unknown → `NA` (not
  reported) or `?` (you cannot tell); log every `?` as an ambiguity.
- Quotes verbatim and short (≤ 40 words), with section or page.
- Conditions follow the "Which Conditions" rule. If the method does not
  say which models get separate results, create them for every model
  listed and log it.
- Log real hesitations only, but log all of them.
- Validate the JSON (`python3 -m json.tool`) before finishing.

Reply with 3 lines only: number of Arms, number of Conditions, number of
ambiguities, plus the one ambiguity that worries you most.
