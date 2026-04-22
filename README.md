# FBA Calculator UI (EU + US)

[![Deploy to GitHub Pages](https://github.com/makaev/amz_fba_calculator/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/makaev/amz_fba_calculator/actions/workflows/deploy-pages.yml)

React + TypeScript UI for Amazon FBA fee estimation.

## Features

- Separate EU and US calculators with a quick region toggle
- Real-time fee updates on every input change
- Field-level validation feedback
- Category dropdown plus manual category override
- Dangerous goods and SIPP switches
- Fee breakdown output for base fee and adjustments
- Unit conversion support for cm/in and kg/lb
- Config-driven fee tables for future updates

## Project Structure

- `src/components`: UI forms, toggle, and result rendering
- `src/services`: Fee calculation logic and region-specific services
- `src/config`: Region-specific fee table constants
- `src/utils`: Normalization, unit conversion, and validation helpers

## Local Development

```bash
cd /Users/user/Documents/FBA_CALC/amz_fba_calculator
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## GitHub Pages Deployment

This repository is configured to deploy the Vite build output to GitHub Pages using GitHub Actions.

Expected site URL after the first successful deployment:

- https://makaev.github.io/amz_fba_calculator/

### One-time GitHub setup

1. Push this repository to GitHub.
2. Make sure the default branch is `main`.
3. In GitHub, open `Settings > Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.

### How deployment works

- The workflow in `.github/workflows/deploy-pages.yml` runs on every push to `main`.
- It installs dependencies with `npm ci`, builds the app, and publishes the `dist/` directory.
- The Vite base path is set to `/amz_fba_calculator/`, which matches the current repository name.

If the repository name changes, update the `base` value in `vite.config.ts` so the built asset paths still match the GitHub Pages URL.

## Notes

- Fee tables can be updated in `src/config/euFeeTables.ts` and `src/config/usFeeTables.ts`.
- To add a new region, create a new config object and service wrapper around the shared calculator flow.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
