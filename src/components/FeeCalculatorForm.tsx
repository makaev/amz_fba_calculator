import { ChangeEvent, useMemo, useState } from 'react';
import { CalculationResult, CalculatorInput, EuMarketplace } from '../types';
import { DimensionUnit, WeightUnit } from '../utils/units';
import { FeeResult } from './FeeResult';

interface FeeCalculatorFormProps {
  title: string;
  config: {
    symbol: string;
    dimensionUnit: DimensionUnit;
    weightUnit: WeightUnit;
  };
  categories: readonly string[];
  marketplaceOptions?: ReadonlyArray<{
    code: EuMarketplace;
    label: string;
    symbol: string;
  }>;
  calculate: (
    input: CalculatorInput,
    dimensionUnit: DimensionUnit,
    weightUnit: WeightUnit
  ) => CalculationResult;
}

const defaultInput: CalculatorInput = {
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  price: 0,
  marketplace: 'UK',
  selectedCategory: 'General',
  customCategory: '',
  dangerousGoods: false,
  lithiumBatteries: false,
  applyFuelLogisticsSurcharge: false,
  applySipp: false
};

function parseNumber(value: string): number {
  if (value.trim() === '') {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function FeeCalculatorForm({ title, config, categories, marketplaceOptions, calculate }: FeeCalculatorFormProps) {
  const [input, setInput] = useState<CalculatorInput>({
    ...defaultInput,
    marketplace: marketplaceOptions?.[0]?.code ?? defaultInput.marketplace,
    selectedCategory: categories.includes('General') ? 'General' : categories[0] ?? 'General'
  });

  const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>(config.dimensionUnit);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(config.weightUnit);

  const result = useMemo(
    () => calculate(input, dimensionUnit, weightUnit),
    [calculate, dimensionUnit, input, weightUnit]
  );

  const onNumberChange =
    (field: 'length' | 'width' | 'height' | 'weight' | 'price') => (event: ChangeEvent<HTMLInputElement>) => {
      setInput((prev) => ({ ...prev, [field]: parseNumber(event.target.value) }));
    };

  const onTextChange =
    (field: 'selectedCategory' | 'customCategory') => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInput((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const onMarketplaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setInput((prev) => ({ ...prev, marketplace: event.target.value as EuMarketplace }));
  };

  const onToggleChange =
    (field: 'dangerousGoods' | 'lithiumBatteries' | 'applyFuelLogisticsSurcharge' | 'applySipp') => (event: ChangeEvent<HTMLInputElement>) => {
      setInput((prev) => ({ ...prev, [field]: event.target.checked }));
    };

  const activeCurrencySymbol = marketplaceOptions?.find((option) => option.code === input.marketplace)?.symbol ?? config.symbol;

  return (
    <section className="calculator-card">
      <h2>{title}</h2>
      <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
        {marketplaceOptions ? (
          <div className="row">
            <label>
              Marketplace
              <select value={input.marketplace} onChange={onMarketplaceChange}>
                {marketplaceOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
              {result.errors.marketplace && <span className="error-text">{result.errors.marketplace}</span>}
            </label>
          </div>
        ) : null}

        <div className="row two">
          <label>
            Length ({dimensionUnit})
            <input type="number" min="0" step="0.01" value={Number.isNaN(input.length) ? '' : input.length} onChange={onNumberChange('length')} />
            {result.errors.length && <span className="error-text">{result.errors.length}</span>}
          </label>
          <label>
            Width ({dimensionUnit})
            <input type="number" min="0" step="0.01" value={Number.isNaN(input.width) ? '' : input.width} onChange={onNumberChange('width')} />
            {result.errors.width && <span className="error-text">{result.errors.width}</span>}
          </label>
        </div>

        <div className="row two">
          <label>
            Height ({dimensionUnit})
            <input type="number" min="0" step="0.01" value={Number.isNaN(input.height) ? '' : input.height} onChange={onNumberChange('height')} />
            {result.errors.height && <span className="error-text">{result.errors.height}</span>}
          </label>
          <label>
            Weight ({weightUnit})
            <input type="number" min="0" step="0.01" value={Number.isNaN(input.weight) ? '' : input.weight} onChange={onNumberChange('weight')} />
            {result.errors.weight && <span className="error-text">{result.errors.weight}</span>}
          </label>
        </div>

        <div className="row">
          <label>
            Product Price ({activeCurrencySymbol})
            <input type="number" min="0" step="0.01" value={Number.isNaN(input.price) ? '' : input.price} onChange={onNumberChange('price')} />
            {result.errors.price && <span className="error-text">{result.errors.price}</span>}
          </label>
        </div>

        <div className="row two">
          <label>
            Dimension unit
            <select value={dimensionUnit} onChange={(event) => setDimensionUnit(event.target.value as DimensionUnit)}>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </label>
          <label>
            Weight unit
            <select value={weightUnit} onChange={(event) => setWeightUnit(event.target.value as WeightUnit)}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
        </div>

        <div className="row">
          <label>
            Category
            <select value={input.selectedCategory} onChange={onTextChange('selectedCategory')}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="row">
          <label>
            Custom category (optional)
            <input
              type="text"
              placeholder="Type category override if not in the list"
              value={input.customCategory}
              onChange={onTextChange('customCategory')}
            />
            {result.errors.category && <span className="error-text">{result.errors.category}</span>}
          </label>
        </div>

        <div className="row checkboxes">
          <label className="checkbox-line">
            <input type="checkbox" checked={input.dangerousGoods} onChange={onToggleChange('dangerousGoods')} />
            Dangerous goods
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={input.lithiumBatteries} onChange={onToggleChange('lithiumBatteries')} />
            Lithium batteries
          </label>
          {marketplaceOptions ? (
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={input.applyFuelLogisticsSurcharge}
                onChange={onToggleChange('applyFuelLogisticsSurcharge')}
              />
              Fuel and logistics-related surcharge (1.5%)
            </label>
          ) : null}
          <label className="checkbox-line">
            <input type="checkbox" checked={input.applySipp} onChange={onToggleChange('applySipp')} />
            Apply SIPP discount
          </label>
        </div>
      </form>

      <FeeResult regionLabel={title} currencySymbol={activeCurrencySymbol} result={result} />
    </section>
  );
}
