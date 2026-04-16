# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a curated, community-sourced library of high-performing **Seedance 2.0** (ByteDance) video generation prompts. It is a pure content/documentation repository — there are no build steps, tests, or scripts. Every file is Markdown.

## Repository Structure

```
README.md                  ← Main index: Best Prompts section + all 13 category sections
prompts/
  NN-category-name/
    README.md              ← Category index listing all prompts in that category
    prompt-slug.md         ← One file per prompt
```

The 13 categories are numbered `01` through `13` (e.g., `01-cinematic-vfx`, `04-action-fight`).

## Prompt File Format

Every individual prompt file follows this exact structure:

```markdown
# [Prompt Title]

*[Tagline — comma-separated style tags, 6–10 words]*

https://github.com/user-attachments/assets/[video-id]

**Source:** [Creator Name](https://x.com/handle) - [Post](https://x.com/handle/status/ID) · _Created: [Month Day]_

**Prompt:**

```text
[exact prompt text, preserving original language and formatting]
```

← [Back to category index](README.md)
← [Back to main index](../../README.md)
```

## Category README Format

Each `prompts/NN-category/README.md` uses this structure:

```markdown
# [N]. [Category Name]

← [Back to main index](../../README.md)

Browse all prompts in this category:

- **[N].[index] [Prompt Name]** ⭐ → [filename.md](filename.md)
  - _[tagline]_
```

## Main README Conventions

- The **Best Prompts** section at the top contains hand-picked entries with the video embed and full prompt text inlined.
- Each numbered category section in the main README shows a subset of prompts (typically 1–3 featured ones) with the same video + source + prompt block format, then ends with a `→ [View all prompts in this category](prompts/NN-category/)` link.
- The Table of Contents links use `#N-category--subcategory` anchors (GitHub auto-generated from headings).

## Adding a New Prompt

When a prompt is approved (via GitHub Issue with the `approved` label), three files need updating:

1. **Create** `prompts/NN-category/prompt-slug.md` — use the prompt file format above.
2. **Update** `prompts/NN-category/README.md` — append a new `- **N.index [Title]** ⭐ → ...` entry.
3. **Update** `README.md` — add the prompt to the appropriate category section (with video + source + prompt block). If it's exceptional, also add it to the **Best Prompts** section.

**Slug naming:** lowercase kebab-case derived from the title, e.g., `bamboo-run-duel-at-dusk.md`.

**Numbering:** Prompt indices within a category are sequential (e.g., if a category has 4 entries numbered `4.1`–`4.4`, the next is `4.5`).

## Contribution Policy

- New prompts are submitted **only via GitHub Issues** — not via pull requests.
- PRs are accepted for maintenance tasks: fixing broken links, correcting formatting, updating the README structure, etc.
- Every prompt must include attribution: creator name, X/Twitter profile link, and original post link.
- Prompts in any language are accepted; the original text is preserved verbatim inside the ```` ```text ```` block.

## License

Content is dual-licensed: code/structure is MIT; prompts and community content are under CC BY 4.0.
