import { BulkCalculationRowResult, BulkCsvRowRaw } from '../types';

interface BulkResultsTableProps {
  rows: BulkCsvRowRaw[];
  results: BulkCalculationRowResult[] | null;
}

function formatFlag(value: string | undefined): string {
  return value?.trim() ? value : 'false';
}

function formatAmount(value: number, currencySymbol: string): string {
  return `${currencySymbol} ${value.toFixed(2)}`;
}

export function BulkResultsTable({ rows, results }: BulkResultsTableProps) {
  if (rows.length === 0) {
    return null;
  }

  const successCount = results?.filter((row) => row.valid).length ?? 0;
  const errorCount = results ? results.length - successCount : 0;

  return (
    <section className="calculator-card bulk-results-card">
      <div className="panel-heading">
        <div>
          <h2>{results ? 'Bulk Results' : 'Bulk Preview'}</h2>
          <p className="muted">
            {results
              ? `${successCount} rows calculated successfully, ${errorCount} rows with errors.`
              : 'Review the uploaded rows before running the calculation.'}
          </p>
        </div>
      </div>

      <div className="bulk-table-wrap">
        <table className="bulk-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>ASIN</th>
              <th>Market</th>
              <th>Category</th>
              <th>Dim unit</th>
              <th>Weight unit</th>
              <th>Length</th>
              <th>Width</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Price</th>
              <th>SIPP</th>
              <th>Dangerous</th>
              <th>Lithium</th>
              <th>Status</th>
              <th>Error</th>
              <th>Tier</th>
              <th>Size tier</th>
              <th>Program</th>
              <th>Base fee</th>
              <th>Category adj.</th>
              <th>Dangerous adj.</th>
              <th>Lithium adj.</th>
              <th>Surcharge</th>
              <th>SIPP discount</th>
              <th>Final fee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const result = results?.[index];
              const breakdown = result?.valid ? result.result.breakdown : undefined;

              return (
                <tr key={`${row.asin || 'row'}-${index}`}>
                  <td>{index + 2}</td>
                  <td>{row.asin}</td>
                  <td>{row.market}</td>
                  <td>{row.category}</td>
                  <td>{row.dimension_unit}</td>
                  <td>{row.weight_unit}</td>
                  <td>{row.length}</td>
                  <td>{row.width}</td>
                  <td>{row.height}</td>
                  <td>{row.weight}</td>
                  <td>{row.price}</td>
                  <td>{formatFlag(row.sipp)}</td>
                  <td>{formatFlag(row.dangerous)}</td>
                  <td>{formatFlag(row.lithium_battery)}</td>
                  <td>
                    <span className={result ? (result.valid ? 'status-pill success' : 'status-pill error') : 'status-pill pending'}>
                      {result ? (result.valid ? 'Success' : 'Error') : 'Pending'}
                    </span>
                  </td>
                  <td>{result?.valid ? '' : result?.errorMessage ?? ''}</td>
                  <td>{breakdown?.fulfillmentTier ?? ''}</td>
                  <td>{breakdown?.sizeTier ?? ''}</td>
                  <td>{breakdown ? (breakdown.isLowPrice ? 'Low-price FBA' : 'Standard FBA') : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.baseFee, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.categoryAdjustment, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.dangerousGoodsAdjustment, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.lithiumBatteriesAdjustment, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.fuelLogisticsSurcharge, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.sippDiscount, breakdown.currencySymbol) : ''}</td>
                  <td>{breakdown ? formatAmount(breakdown.finalFee, breakdown.currencySymbol) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}