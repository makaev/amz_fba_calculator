import { ChangeEvent, useState } from 'react';
import { buildBulkExportRows, calculateBulkRows, exportBulkResultsToCsv, parseBulkCsvFile } from '../services/bulkCalculationService';
import { createSampleBulkCsv } from '../utils/csv';
import { BulkCalculationRowResult, BulkCsvImportError, BulkCsvImportResult } from '../types';
import { BulkResultsTable } from './BulkResultsTable';
import { BulkUploadPanel } from './BulkUploadPanel';

const MAX_BULK_ROWS = 500;

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BulkCalculationPanel() {
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<BulkCsvImportResult | null>(null);
  const [results, setResults] = useState<BulkCalculationRowResult[] | null>(null);

  const rowLimitError: BulkCsvImportError | null = importResult && importResult.rows.length > MAX_BULK_ROWS
    ? { message: `The v1 bulk workflow supports up to ${MAX_BULK_ROWS} rows per file.` }
    : null;

  const importErrors = importResult
    ? rowLimitError
      ? [...importResult.errors, rowLimitError]
      : importResult.errors
    : [];

  const canCalculate = Boolean(importResult && importResult.rows.length > 0 && importErrors.length === 0);
  const canExport = Boolean(importResult && results && results.length > 0);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setFileName(file.name);
    setImportResult(parseBulkCsvFile(text));
    setResults(null);
  };

  const handleCalculate = () => {
    if (!importResult || !canCalculate) {
      return;
    }

    setResults(calculateBulkRows(importResult.rows));
  };

  const handleDownloadTemplate = () => {
    downloadTextFile('bulk-fba-template.csv', createSampleBulkCsv());
  };

  const handleExport = () => {
    if (!importResult || !results) {
      return;
    }

    const exportRows = buildBulkExportRows(importResult.rows, results);
    downloadTextFile('bulk-fba-results.csv', exportBulkResultsToCsv(exportRows));
  };

  return (
    <div className="forms-grid">
      <BulkUploadPanel
        fileName={fileName}
        rowCount={importResult?.rows.length ?? 0}
        importErrors={importErrors}
        canCalculate={canCalculate}
        canExport={canExport}
        onFileChange={handleFileChange}
        onCalculate={handleCalculate}
        onDownloadTemplate={handleDownloadTemplate}
        onExport={handleExport}
      />

      {importResult ? <BulkResultsTable rows={importResult.rows} results={results} /> : null}
    </div>
  );
}