export function exportToCSV(data, columns, filename = 'report') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  const rows = data.map(item => {
    return columns.map(col => {
      let val = item[col.key];
      
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
