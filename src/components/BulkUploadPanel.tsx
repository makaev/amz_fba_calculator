import { ChangeEvent } from 'react';
import { BulkCsvImportError } from '../types';
import { BulkActions } from './BulkActions';

interface BulkUploadPanelProps {
  fileName: string;
  rowCount: number;
  importErrors: BulkCsvImportError[];
  canCalculate: boolean;
  canExport: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  onDownloadTemplate: () => void;
  onExport: () => void;
}

export function BulkUploadPanel({
  fileName,
  rowCount,
  importErrors,
  canCalculate,
  canExport,
  onFileChange,
  onCalculate,
  onDownloadTemplate,
  onExport
}: BulkUploadPanelProps) {
  return (
    <section className="calculator-card bulk-panel">
      <div className="panel-heading">
        <div>
          <h2>Bulk FBA Analysis</h2>
          <p className="muted">Upload a CSV, preview the rows, run the calculation, and export the enriched result set.</p>
        </div>
        <div className="bulk-stats">
          <span className="stat-pill">Target limit: 500 rows</span>
          <span className="stat-pill">Loaded: {rowCount}</span>
        </div>
      </div>

      <label className="bulk-file-input">
        CSV file
        <input type="file" accept=".csv,text/csv" onChange={onFileChange} />
      </label>

      <p className="muted bulk-file-name">{fileName || 'No CSV file selected yet.'}</p>

      {importErrors.length > 0 ? (
        <section className="bulk-error-card">
          <h3>Import issues</h3>
          <ul className="bulk-error-list">
            {importErrors.map((error, index) => (
              <li key={`${error.rowIndex ?? 'file'}-${index}`}>
                {error.rowIndex ? `Row ${error.rowIndex}: ` : ''}
                {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <BulkActions
        canCalculate={canCalculate}
        canExport={canExport}
        onCalculate={onCalculate}
        onDownloadTemplate={onDownloadTemplate}
        onExport={onExport}
      />
    </section>
  );
}