/**
 * ExportUtils - Export expenses to various formats
 */

export const exportToCSV = (expenses) => {
  if (!expenses || expenses.length === 0) {
    throw new Error('No expenses to export');
  }

  // CSV headers
  const headers = ['Date', 'Vendor', 'Amount', 'Category', 'Description', 'OCR Confidence'];
  
  // Convert expenses to CSV rows
  const rows = expenses.map(exp => [
    exp.date ? new Date(exp.date).toLocaleDateString() : '',
    exp.vendor || '',
    exp.amount || 0,
    exp.category || '',
    exp.description || '',
    exp.ocrConfidence ? (exp.ocrConfidence * 100).toFixed(0) + '%' : ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (expenses) => {
  if (!expenses || expenses.length === 0) {
    throw new Error('No expenses to export');
  }

  const jsonContent = JSON.stringify(expenses, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSummaryReport = (expenses) => {
  if (!expenses || expenses.length === 0) {
    throw new Error('No expenses to export');
  }

  // Calculate summary statistics
  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const average = total / expenses.length;
  const highest = Math.max(...expenses.map(exp => exp.amount || 0));
  const lowest = Math.min(...expenses.map(exp => exp.amount || 0));

  // Group by category
  const byCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { count: 0, total: 0 };
    }
    acc[cat].count++;
    acc[cat].total += exp.amount || 0;
    return acc;
  }, {});

  // Create report content
  const reportContent = `
EXPENSE SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
Period: ${expenses.length} transactions
==================================================

OVERALL STATISTICS
--------------------------------------------------
Total Expenses:        Rs ${total.toFixed(2)}
Average Transaction:   Rs ${average.toFixed(2)}
Highest Transaction:   Rs ${highest.toFixed(2)}
Lowest Transaction:    Rs ${lowest.toFixed(2)}

CATEGORY BREAKDOWN
--------------------------------------------------
${Object.entries(byCategory)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([cat, data]) => `${cat.padEnd(20)} Rs ${data.total.toFixed(2).padStart(10)}  (${data.count} transactions)`)
  .join('\n')}

DETAILED TRANSACTIONS
--------------------------------------------------
${expenses.map(exp => 
  `${new Date(exp.date).toLocaleDateString().padEnd(12)} ${(exp.vendor || 'Unknown').padEnd(25)} Rs ${(exp.amount || 0).toFixed(2).padStart(10)}  ${exp.category || 'Other'}`
).join('\n')}

==================================================
End of Report
`;

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printExpenses = (expenses) => {
  if (!expenses || expenses.length === 0) {
    throw new Error('No expenses to print');
  }

  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
        }
        .meta {
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }
        th {
          background: #667eea;
          color: white;
          font-weight: 600;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .total-row {
          font-weight: bold;
          background: #d5f4e6;
          font-size: 1.1em;
        }
        .amount {
          text-align: right;
          font-weight: 600;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>📊 Expense Report</h1>
      <div class="meta">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Transactions:</strong> ${expenses.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Category</th>
            <th>Description</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(exp => `
            <tr>
              <td>${new Date(exp.date).toLocaleDateString()}</td>
              <td>${exp.vendor || 'Unknown'}</td>
              <td>${exp.category || 'Other'}</td>
              <td>${exp.description || '-'}</td>
              <td class="amount">Rs ${(exp.amount || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">TOTAL</td>
            <td class="amount">Rs ${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <br>
      <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
        🖨️ Print Report
      </button>
    </body>
    </html>
  `);
  printWindow.document.close();
};
