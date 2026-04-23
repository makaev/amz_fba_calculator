interface BulkActionsProps {
  canCalculate: boolean;
  canExport: boolean;
  onCalculate: () => void;
  onDownloadTemplate: () => void;
  onExport: () => void;
}

export function BulkActions({ canCalculate, canExport, onCalculate, onDownloadTemplate, onExport }: BulkActionsProps) {
  return (
    <div className="bulk-actions">
      <button type="button" className="secondary-button" onClick={onDownloadTemplate}>
        Download sample CSV
      </button>
      <button type="button" className="primary-button" onClick={onCalculate} disabled={!canCalculate}>
        Calculate bulk fees
      </button>
      <button type="button" className="secondary-button" onClick={onExport} disabled={!canExport}>
        Export results CSV
      </button>
    </div>
  );
}