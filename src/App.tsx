import { useState } from 'react';
import { EU_CATEGORIES, EU_FORM_CONFIG, EU_MARKETPLACE_OPTIONS, US_CATEGORIES, US_FEE_CONFIG } from './config';
import { FeeCalculatorForm } from './components/FeeCalculatorForm';
import { RegionToggle } from './components/RegionToggle';
import { calculateEUFee } from './services/euFeeService';
import { calculateUSFee } from './services/usFeeService';
import { Region } from './types';

export default function App() {
  const [activeRegion, setActiveRegion] = useState<Region>('EU');

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-brand">
          <img className="hero-logo" src="/logo_colored.png" alt="Mavicode Solutions" />
        </div>
        <h2>Amazon FBA Fee calculator for United Kingdom, Europe and United States </h2>
        <p>
          Real-time FBA fee calculation, Size-tire determination, Category modifiers, Dangerous Goods and Hazmat adjustments,
          SIPP Discount.
        </p>
      </header>

      <RegionToggle value={activeRegion} onChange={setActiveRegion} />

      <div className="forms-grid">
        <div className={activeRegion === 'EU' ? 'visible-panel' : 'hidden-panel'}>
          <FeeCalculatorForm
            title="EU FBA Calculator"
            config={EU_FORM_CONFIG}
            categories={EU_CATEGORIES}
            marketplaceOptions={EU_MARKETPLACE_OPTIONS}
            calculate={calculateEUFee}
          />
        </div>

        <div className={activeRegion === 'US' ? 'visible-panel' : 'hidden-panel'}>
          <FeeCalculatorForm
            title="US FBA Calculator"
            config={US_FEE_CONFIG}
            categories={US_CATEGORIES}
            calculate={calculateUSFee}
          />
        </div>
      </div>
    </main>
  );
}
