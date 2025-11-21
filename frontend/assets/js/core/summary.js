// core/summary.js
export function generateSummaryHTML(surveyData) {
  const basic = surveyData.section1?.basic || {};
  const scores = surveyData.scores.bySectionAverage || {};

  return `
  <h5>Dataset Summary</h5>
  <table class="table table-bordered">
    <tr><th>Title</th><td>${basic.datasetTitle || 'N/A'}</td></tr>
    <tr><th>Evaluator</th><td>${basic.evaluatorName || 'N/A'}</td></tr>
    <tr><th>Data Type</th><td>${basic.dataType || 'N/A'}</td></tr>
  </table>

  <h5>Scores by Section</h5>
  <table class="table table-striped">
    ${Object.entries(scores).map(([k, v]) => `<tr><td>${k}</td><td>${v?.toFixed(2) || 'N/A'}</td></tr>`).join('')}
  </table>

  <p><strong>Overall Score:</strong> ${surveyData.scores.overall?.toFixed(2) || 'N/A'}</p>
  `;
}
