# snk-wakatime

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/sandeepyadav1478/snk-wakatime/main.yml?label=CI&style=flat-square)](https://github.com/sandeepyadav1478/snk-wakatime/actions/workflows/main.yml)
[![GitHub release](https://img.shields.io/github/release/sandeepyadav1478/snk-wakatime.svg?style=flat-square)](https://github.com/sandeepyadav1478/snk-wakatime/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-wakatime--snake--animation-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/wakatime-snake-animation)
![type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)
![code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)

Generates a snake game animation from **WakaTime coding activity** or GitHub contributions. The snake eats contribution cells in an optimal path, producing animated SVG or GIF files for your GitHub profile README.

> Fork of [Platane/snk](https://github.com/Platane/snk) with WakaTime integration.

## Usage with WakaTime

### Prerequisites

1. A [WakaTime](https://wakatime.com) account with coding activity tracked
2. A **public** JSON share URL — create one at [WakaTime Shares](https://wakatime.com/settings/shares)

### GitHub Action

1. Add your WakaTime JSON share URL as a repository secret named `WAKATIME_JSON_URL` (Settings > Secrets and variables > Actions).
2. Create `.github/workflows/wakatime-snake.yml` in your profile repo:

```yaml
name: WakaTime Snake

on:
  schedule:
    - cron: "0 0 * * *" # Runs daily at midnight UTC
  workflow_dispatch: # Allows manual trigger
  push:
    branches:
      - main

permissions:
  contents: write # Needed to push to output branch

jobs:
  generate:
    runs-on: ubuntu-latest

    steps:
      - name: Generate WakaTime Snake
        uses: sandeepyadav1478/snk-wakatime@main
        with:
          wakatime_json_url: ${{ secrets.WAKATIME_JSON_URL }}
          outputs: |
            dist/wakatime-snake.svg
            dist/wakatime-snake-dark.svg?palette=github-dark

      - name: Deploy to GitHub Pages
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Display in your README

```html
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="
      https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/wakatime-snake-dark.svg
    "
  />
  <source
    media="(prefers-color-scheme: light)"
    srcset="
      https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/wakatime-snake.svg
    "
  />
  <img
    alt="wakatime snake"
    src="https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/wakatime-snake.svg"
  />
</picture>
```

Replace `YOUR_USER` with your GitHub username.

## Usage with GitHub Contributions

If no `wakatime_json_url` is provided, the action falls back to GitHub contribution data (same as the original [Platane/snk](https://github.com/Platane/snk)):

```yaml
- uses: sandeepyadav1478/snk-wakatime@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    outputs: |
      dist/github-snake.svg
      dist/github-snake-dark.svg?palette=github-dark
      dist/ocean.gif?color_snake=orange&color_dots=#bfd6f6,#8dbdff,#64a1f4,#4b91f1,#3c7dd9
```

## SVG-only variant

For a faster, lighter action that only generates SVGs (no GIF support, no Docker):

```yaml
- uses: sandeepyadav1478/snk-wakatime/svg-only@v1
  with:
    wakatime_json_url: "https://wakatime.com/share/@username/uuid.json"
    outputs: |
      dist/wakatime-snake.svg
      dist/wakatime-snake-dark.svg?palette=github-dark
```

## Inputs

| Input               | Description                                               | Required | Default               |
| ------------------- | --------------------------------------------------------- | -------- | --------------------- |
| `wakatime_json_url` | Public WakaTime JSON share URL                            | No       | —                     |
| `github_user_name`  | GitHub username for contribution graph (fallback)         | No       | —                     |
| `github_token`      | GitHub token for API access                               | No       | `${{ github.token }}` |
| `outputs`           | List of files to generate, one per line with query params | **Yes**  | —                     |

## Output Customization

Each output file can be customized with query string parameters:

| Option             | Description                             | Example                                 |
| ------------------ | --------------------------------------- | --------------------------------------- |
| `palette`          | Color preset                            | `github`, `github-dark`, `github-light` |
| `color_snake`      | Snake color                             | `blue`, `#7845ab`                       |
| `color_dots`       | 5 comma-separated colors for levels 0-4 | `#eee,#aaa,#888,#666,#444`              |
| `color_background` | Background color (GIF only)             | `#f7f8fa`                               |

Example:

```
dist/snake.svg?palette=github-dark&color_snake=blue
dist/ocean.gif?color_snake=orange&color_dots=#bfd6f6,#8dbdff,#64a1f4,#4b91f1,#3c7dd9&color_background=#aaaaaa
```

## WakaTime Hours-to-Level Mapping

WakaTime coding hours are mapped to contribution levels:

| Hours Coded | Level | Intensity |
| ----------- | ----- | --------- |
| 0           | 0     | Empty     |
| > 0         | 1     | Low       |
| >= 1        | 2     | Medium    |
| >= 3        | 3     | High      |
| >= 5        | 4     | Very High |

## Dark Mode

For dark mode support on GitHub, use the `<picture>` element syntax shown above. Generate both a light and dark variant using the `palette=github-dark` query parameter.

## Implementation

- [Solver algorithm](./packages/solver/README.md)
- WakaTime integration in [generateContributionSnake.ts](./packages/action/generateContributionSnake.ts)

## Local Development

```sh
bun install --frozen-lockfile
npm run type          # type checking
npm run lint          # prettier check
bun test              # run tests
npm run build:action  # build the action
```

## Credits

This project is a fork of [Platane/snk](https://github.com/Platane/snk) — the original snake game contribution grid generator. All core snake algorithm, solver, SVG/GIF rendering, and grid logic were built by [Platane](https://github.com/Platane). This fork adds WakaTime coding activity as an alternative data source.

- **Original project:** [Platane/snk](https://github.com/Platane/snk) by [Platane](https://github.com/Platane)
- **WakaTime integration:** [sandeepyadav1478](https://github.com/sandeepyadav1478)

## License

[MIT](./LICENSE) — Original work by [platane](https://github.com/Platane), WakaTime modifications by [sandeepyadav1478](https://github.com/sandeepyadav1478).
