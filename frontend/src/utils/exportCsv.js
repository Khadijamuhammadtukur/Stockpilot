/**
 * Exports JSON array data to a downloadable CSV file.
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{label: string, key: string}>} columns - List of column headers and object keys
 * @param {string} filename - Output CSV filename (without extension)
 */
export function exportToCSV(data, columns, filename = 'report') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Generate header row
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Generate data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let val = item[col.key];
      
      // Support nested key paths e.g. "product.name"
      if (col.key.includes('.')) {
        val = col.key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : '', item);
      }

      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }

      // Escape quotes
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
