import { Region } from '../types';

interface RegionToggleProps {
  value: Region;
  onChange: (region: Region) => void;
}

export function RegionToggle({ value, onChange }: RegionToggleProps) {
  return (
    <div className="region-toggle" role="tablist" aria-label="Region calculator toggle">
      <button
        type="button"
        className={value === 'EU' ? 'active' : ''}
        onClick={() => onChange('EU')}
        role="tab"
        aria-selected={value === 'EU'}
      >
        EU Calculator
      </button>
      <button
        type="button"
        className={value === 'US' ? 'active' : ''}
        onClick={() => onChange('US')}
        role="tab"
        aria-selected={value === 'US'}
      >
        US Calculator
      </button>
    </div>
  );
}
