# Bulk Calculation Implementation Plan

## Goal

Add a bulk-calculation workflow that lets the user upload a CSV file, calculate FBA fees for each row using the existing EU and US calculators, review the results in a table, and export the enriched data.

This document captures the current agreed direction so implementation can resume later without losing context.

## Agreed Product Shape

### User flow

1. User uploads a CSV file.
2. System validates the file headers and parses each row.
3. System shows a preview table built from the uploaded data.
4. System calculates fees for each row.
5. System adds a comprehensive fee breakdown to each product row.
6. User exports the final table with results.

### CSV input schema

Current preferred input columns:

- `asin`
- `market`
- `dimension_unit`
- `weight_unit`
- `length`
- `width`
- `height`
- `weight`
- `price`
- `category`
- `sipp`
- `dangerous`

### Why separate unit columns

The current app already treats dimensions and weight separately, so a single `units` field would create unnecessary ambiguity.

- `dimension_unit` should support `cm` or `in`
- `weight_unit` should support `kg` or `lb`

If the product decision later forces a single unit column, the fallback contract should be:

- `units`: `metric` or `imperial`

with these meanings:

- `metric` => `cm` + `kg`
- `imperial` => `in` + `lb`

## Business Rules To Preserve

### Calculator routing

- `market` must route each row to the correct calculator.
- Supported values should align with the current calculator scope:
  - `US`
  - `UK`
  - `DE`
  - `ES`
  - `IT`
  - `FR`

### Surcharge handling

- Transport surcharge should be applied automatically in bulk mode.
- The current code already applies surcharge automatically for US.
- EU currently has an optional surcharge toggle in the single-item flow, so bulk mode will need a deliberate business rule override or a shared rule update.

### Optional flags

- `sipp` should be row-level and optional.
- `dangerous` should be row-level and optional.
- Missing values should default to `false`.

### ASIN behavior

- `asin` is a passthrough identifier for the row.
- It does not change calculation logic.

## Validation Rules

### Required columns

The importer should reject the file if any required header is missing:

- `asin`
- `market`
- `dimension_unit`
- `weight_unit`
- `length`
- `width`
- `height`
- `weight`
- `price`
- `category`

Optional columns:

- `sipp`
- `dangerous`

### Row validation

Per-row validation should enforce:

- `asin`: non-empty string
- `market`: supported enum value
- `dimension_unit`: `cm` or `in`
- `weight_unit`: `kg` or `lb`
- `length`, `width`, `height`, `weight`, `price`: numeric and greater than `0`
- `category`: non-empty string
- `sipp`, `dangerous`: accept common boolean formats such as `true/false`, `yes/no`, `1/0`

Unknown extra columns should be preserved if possible, but ignored by the calculation engine.

## Output Table Design

The exported table should include the original input columns plus calculation outputs.

### Minimum output columns

- `asin`
- `market`
- `dimension_unit`
- `weight_unit`
- `length`
- `width`
- `height`
- `weight`
- `price`
- `category`
- `sipp`
- `dangerous`
- `calculation_status`
- `error_message`
- `currency_symbol`
- `marketplace_code`
- `fulfillment_tier`
- `size_tier`
- `pricing_program`
- `base_fee`
- `category_adjustment`
- `dangerous_goods_adjustment`
- `lithium_batteries_adjustment`
- `transport_surcharge`
- `sipp_discount`
- `final_fee`

### Export behavior

- Preserve row order from the uploaded file.
- Include invalid rows in the export with `calculation_status=error` and an `error_message`.
- Export should remain possible even when some rows fail validation.

## Recommended Technical Design

### New types

Add bulk-specific types near the existing shared models in `src/types.ts`.

Suggested additions:

- `BulkCsvRowRaw`
- `BulkCsvRowParsed`
- `BulkCalculationRowResult`
- `BulkCalculationOptions`
- `BulkExportRow`

### New services

Add a bulk service layer that wraps the existing fee calculators instead of duplicating pricing logic.

Suggested responsibilities:

- parse CSV row values into typed fields
- normalize booleans and enum values
- map each row into `CalculatorInput`
- choose EU or US calculator from `market`
- convert the calculator result into a table/export row
- preserve row-level error state

Suggested files:

- `src/services/bulkCalculationService.ts`
- `src/utils/csv.ts`

### New UI surface

Do not force bulk import into the single-item calculator form.

Recommended approach:

- add a dedicated bulk-calculation section, tab, or mode switch
- keep single-item calculation and bulk calculation as separate workflows

Suggested components:

- `src/components/BulkUploadPanel.tsx`
- `src/components/BulkResultsTable.tsx`
- `src/components/BulkActions.tsx`

## File-Level Implementation Plan

### Phase 1: data contracts

Files:

- `src/types.ts`

Tasks:

- add bulk CSV row and export row interfaces
- add narrow enums or string unions for bulk unit and market fields
- define a normalized result type for row-level success/error handling

### Phase 2: parsing and normalization

Files:

- `src/utils/csv.ts`
- `src/utils/validators.ts`

Tasks:

- parse CSV text into row objects
- validate required headers
- normalize booleans, numbers, units, and market values
- extend validation helpers only where shared logic is genuinely reusable

### Phase 3: calculation adapter

Files:

- `src/services/bulkCalculationService.ts`
- `src/services/euFeeService.ts`
- `src/services/usFeeService.ts`

Tasks:

- build a row-to-calculator adapter using existing calculation entry points
- enforce automatic transport surcharge for bulk mode
- map `sipp` and `dangerous` CSV values into `CalculatorInput`
- standardize row-level result formatting for UI and export

### Phase 4: UI workflow

Files:

- `src/App.tsx`
- `src/components/BulkUploadPanel.tsx`
- `src/components/BulkResultsTable.tsx`
- `src/styles.css`

Tasks:

- add a bulk mode entry point to the app
- add file upload and header/error feedback
- render imported rows and calculated outputs in a table
- support empty, loading, success, and partial-error states

### Phase 5: export

Files:

- `src/utils/csv.ts`
- `src/components/BulkActions.tsx`

Tasks:

- convert calculated rows back into CSV
- export enriched rows with consistent column order
- keep error rows exportable

## Suggested Delivery Order

1. Finalize the CSV contract.
2. Build parsing and row validation.
3. Build the bulk calculation adapter on top of existing calculators.
4. Add a simple preview table.
5. Add export.
6. Polish error messaging and large-file behavior.

## Open Questions

These should be confirmed before implementation starts:

1. Is `market` limited to `US`, `UK`, `DE`, `ES`, `IT`, `FR`?
2. Should category values be strict enums, free text, or normalized aliases?
3. Should `dangerous` also imply lithium-battery handling anywhere, or remain separate from lithium-specific logic?
4. Should bulk mode support extra user-defined columns and preserve them in the export?
5. What is the expected maximum CSV size for the first release?

## Risks

- ambiguous category names could reduce calculation accuracy
- inconsistent market strings could route rows incorrectly
- large tables may need pagination or virtualization later
- EU surcharge behavior differs from the current single-item UX and must be handled intentionally

## Estimate

### MVP

- 2 to 4 working days

### Safer production-ready version

- 4 to 6 working days

The longer estimate assumes stronger validation, better table UX, partial-failure handling, and export polish.

## Resume Point

When implementation starts, begin with:

1. confirming the final CSV header contract
2. deciding whether bulk mode should force the EU surcharge rule directly in the service layer
3. adding bulk-specific types in `src/types.ts`