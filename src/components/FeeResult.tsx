import { CalculationResult } from '../types';

interface FeeResultProps {
  regionLabel: string;
  currencySymbol: string;
  result: CalculationResult;
}

function formatAmount(value: number, currencySymbol: string): string {
  return `${currencySymbol} ${value.toFixed(2)}`;
}

export function FeeResult({ regionLabel, currencySymbol, result }: FeeResultProps) {
  if (!result.valid || !result.breakdown) {
    return (
      <section className="result-card" aria-live="polite">
        <h3>{regionLabel} Result</h3>
        <p className="muted">Enter valid values to see fee breakdown.</p>
      </section>
    );
  }

  const breakdown = result.breakdown;

  return (
    <section className="result-card" aria-live="polite">
      <h3>{regionLabel} Result</h3>
      <p className="final-fee">Estimated FBA Fee: {formatAmount(breakdown.finalFee, breakdown.currencySymbol || currencySymbol)}</p>
      <ul className="breakdown-list">
        <li>Marketplace: {breakdown.marketplaceCode ?? regionLabel}</li>
        <li>Fulfillment tier: {breakdown.fulfillmentTier}</li>
        <li>Size tier: {breakdown.sizeTier}</li>
        <li>Pricing program: {breakdown.isLowPrice ? 'Low-price FBA' : 'Standard FBA'}</li>
        <li>Base fee: {formatAmount(breakdown.baseFee, breakdown.currencySymbol || currencySymbol)}</li>
        <li>Category adjustment: {formatAmount(breakdown.categoryAdjustment, breakdown.currencySymbol || currencySymbol)}</li>
        <li>Dangerous goods adjustment: {formatAmount(breakdown.dangerousGoodsAdjustment, breakdown.currencySymbol || currencySymbol)}</li>
        <li>Lithium batteries adjustment: {formatAmount(breakdown.lithiumBatteriesAdjustment, breakdown.currencySymbol || currencySymbol)}</li>
        <li>SIPP discount: -{formatAmount(breakdown.sippDiscount, breakdown.currencySymbol || currencySymbol)}</li>
        <li>Fuel and logistics surcharge: {formatAmount(breakdown.fuelLogisticsSurcharge, breakdown.currencySymbol || currencySymbol)}</li>
        <li>
          Normalized dimensions: {breakdown.normalizedDimensions[0]} x {breakdown.normalizedDimensions[1]} x {breakdown.normalizedDimensions[2]}
        </li>
      </ul>
    </section>
  );
}
