# FBA Calculator UI (EU + US)

React + TypeScript UI module for Amazon FBA fee estimation.

## Features

- Separate EU and US calculators (with quick toggle)
- Real-time fee updates on every input change
- Input validation with clear field-level errors
- Category dropdown plus manual category override
- Dangerous goods and SIPP switches
- Breakdown output:
  - Base fee
  - Category adjustment
  - Dangerous goods adjustment
  - SIPP discount
  - Final fee
- Unit conversion support (cm/in and kg/lb)
- Config-driven fee tables for easy future updates

## Structure

- `src/components`: UI forms, toggle, and breakdown result rendering
- `src/services`: Pure fee calculation logic and region services
- `src/config`: Region-specific fee table constants
- `src/utils`: Normalization, unit conversion, and validators

## Getting Started

```bash
cd /Users/user/Documents/fba_calc_ui
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- Fee tables are examples aligned to current project logic patterns and can be updated in:
  - `src/config/euFeeTables.ts`
  - `src/config/usFeeTables.ts`
- To add new regions, create a new config object and service wrapper using `calculateFeeFromConfig`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for the full text.
