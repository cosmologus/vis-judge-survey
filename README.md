# Models judging visualizations: survey corpus

Exploration site and coded data for a survey of studies in which a
(multimodal) large language model judges a data visualization: its
quality, correctness, honesty or rule conformance. The survey is part of
an MSc dissertation (in preparation) at the National University of
Science and Technology POLITEHNICA Bucharest.

**Site:** https://cosmologus.github.io/vis-judge-survey/

- **Findings**: the corpus by year, the Prompt cue × task cross on Arms,
  the H1 funnel and the reporting items (RQ3). Every mark lists the papers
  behind it.
- **Corpus**: a matrix of the 70 papers × the values of the seven
  Taxonomy dimensions, with filters, and a sheet for each paper.

## Data

| File | One row per |
|---|---|
| `data/papers.csv` | paper (Taxonomy D1–D7 and paper-level fields) |
| `data/arms.csv` | Arm: Prompt cue × task × visualization set |
| `data/conditions.csv` | Condition: Arm × Model, with the result |
| `data/contrasts.csv` | within-study contrast between two Conditions |
| `data/h1_contrasts.csv` | contrast that varies the cue, with its H1 status |

Multi-valued cells are separated by `; `. `codebook.md` (frozen v1.7)
defines every field and value. Corpus window 2022-01 to 2026-09, search
snapshot 2026-10-04.

## Search and prompts

| File | Content |
|---|---|
| `search/openalex.filter.txt` | OpenAlex `filter` of the frozen query (run with `corpus=all`) |
| `search/arxiv.search_query.txt` | arXiv API `search_query` of the frozen query |
| `search/meta.json` | the three term blocks, the arXiv drops and the title post-filter |
| `prompts/screening-title-abstract.md` | fixed prompt of title and abstract screening |
| `prompts/screening-full-text.md` | fixed prompt of full text screening |
| `prompts/coding-pass1.md`, `prompts/coding-pass2.md` | fixed prompts of the two coding passes |

Paths inside the prompts refer to the private working repository; the
full texts of the papers are not published.

Quoted prompts (`cue_quote`) and verdicts (`verdict_quote`) are short
excerpts from the papers, reproduced for analysis with their source and
location; copyright in them stays with their authors.

## Run locally

The site is static (HTML, JavaScript and d3 from a CDN), with no build
step:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## License

- Data (`data/`), codebook, query (`search/`) and prompts (`prompts/`):
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  The quoted excerpts in `cue_quote` and `verdict_quote` are not covered;
  they belong to the authors of the papers.
- Site code (`index.html`, `app.js`, `style.css`): MIT, see `LICENSE`.
