// ============================================
// SUMMARY PAGE: SUMMARY & CREDITS
// ============================================

import { DataManager, initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, getGrade, getGradeColor, clearAllSurveyData } from './shared-utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  DataManager.init();
  
  // Initialize conformance visibility
  const savedProcessingLevel = localStorage.getItem('dataProcessingLevel');
  if (savedProcessingLevel) {
    applyConformanceVisibility(savedProcessingLevel);
  }
  updateNavigationButtons();
  
  // ---- COLLECT DATA FROM ALL SECTIONS ----
  function collectDataFromAllSections() {
    const surveyData = DataManager.getData();
    
    // Get data from surveyData structure (stored by section JS files)
    const section1 = surveyData?.section1?.basic || {};
    const section2 = surveyData?.section2?.descriptives || {};
    const section3 = surveyData?.section3?.spatialResolution || {};
    const section4 = surveyData?.section4?.conformance || {};
    const section5 = surveyData?.section5?.context || {};
    
    return {
      // Section 1 - Initial Information
      datasetTitle: section1.datasetTitle || localStorage.getItem('datasetTitle') || 'Not specified',
      dataType: section1.dataType || localStorage.getItem('dataType') || 'Not specified',
      processingLevel: localStorage.getItem('dataProcessingLevel') || 'Not specified',
      evaluationType: section1.evaluationType || localStorage.getItem('evaluationType') || 'Not specified',
      evaluatorName: section1.evaluatorName || localStorage.getItem('evaluatorName') || 'Not specified',
      evaluatorOrg: section1.evaluatorOrg || localStorage.getItem('evaluatorOrg') || 'Not specified',
      
      // Section 2 - Descriptives
      language: section2.language || localStorage.getItem('languageDropdown') || 'Not specified',
      keywords: section2.keywords || [],
      documentation: section2.documentation || 'Not specified',
      accessibility: section2.accessibility || 'Not specified',
      
      // Section 3 - Design
      spatialRes: section3.type || localStorage.getItem('spatialResolution') || 'Not specified',
      spatialCoverage: surveyData?.section3?.spatialCoverage?.coverage || 'Not specified',
      collectionInterval: surveyData?.section3?.timeliness?.collectionInterval || 'Not specified',
      
      // Section 1 - Use Case (if applicable)
      useCaseDesc: section1.useCaseDescription || localStorage.getItem('useCaseDescription') || 'Not specified',
      optimumDate: section1.optimumDataCollection || localStorage.getItem('optimumDataCollection') || 'Not specified',
      areaOfInterest: section1.areaOfInterest || localStorage.getItem('areaOfInterest') || 'Not specified',
      
      // Section 4 - Conformance
      conformanceNotes: section4.notes || 'Not assessed',
      
      // Section 5 - Context
      contextNotes: section5.notes || 'Not assessed',
      
      // Scores
      scores: surveyData?.scores?.byGroup || {},
      timestamps: surveyData?.timestamps || {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }

  // ---- POPULATE SUMMARY PAGE ----
  function populateSummaryPage() {
    const data = collectDataFromAllSections();
    
    // Dataset Information
    document.getElementById('summaryTitle').textContent = data.datasetTitle;
    document.getElementById('summaryDataType').textContent = data.dataType;
    document.getElementById('summaryProcessingLevel').textContent = data.processingLevel;
    document.getElementById('summaryEvaluationType').textContent = data.evaluationType;
    document.getElementById('summaryEvaluator').textContent = data.evaluatorName;
    document.getElementById('summaryOrg').textContent = data.evaluatorOrg;
    document.getElementById('summaryLanguage').textContent = data.language;
    
    // Evaluation Date
    if (data.timestamps.created) {
      document.getElementById('summaryDate').textContent = new Date(data.timestamps.created).toLocaleString();
    } else {
      document.getElementById('summaryDate').textContent = new Date().toLocaleString();
    }
    
    // Timestamps
    if (data.timestamps.created) {
      document.getElementById('createdDate').textContent = new Date(data.timestamps.created).toLocaleString();
    }
    if (data.timestamps.lastModified) {
      document.getElementById('modifiedDate').textContent = new Date(data.timestamps.lastModified).toLocaleString();
    }

    // Use-Case Information (if available)
    const useCaseCard = document.getElementById('useCaseCard');
    if (data.useCaseDesc && data.useCaseDesc !== 'Not specified') {
      useCaseCard.style.display = 'block';
      document.getElementById('summaryUseCaseDesc').textContent = data.useCaseDesc;
      document.getElementById('summaryOptimumDate').textContent = data.optimumDate || 'N/A';
      document.getElementById('summarySpatialRes').textContent = data.spatialRes || 'N/A';
      document.getElementById('summaryAOI').textContent = data.areaOfInterest || 'N/A';
    }
    
    // Design Information
    const designInfo = `
      <ul class="list-group list-group-flush">
        <li class="list-group-item"><strong>Spatial Resolution:</strong> ${data.spatialRes}</li>
        <li class="list-group-item"><strong>Spatial Coverage:</strong> ${data.spatialCoverage}</li>
        <li class="list-group-item"><strong>Collection Interval:</strong> ${data.collectionInterval}</li>
      </ul>
    `;
    
    // Display additional design/context info
    if (data.spatialRes && data.spatialRes !== 'Not specified') {
      const designCard = document.createElement('div');
      designCard.className = 'card mb-4 shadow-sm';
      designCard.innerHTML = `
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">📐 Design Information</h5>
        </div>
        <div class="card-body">
          ${designInfo}
        </div>
      `;
      // Insert before quality scores (find quality scores card)
      const qualityCard = document.querySelector('.bg-success').closest('.card');
      if (qualityCard) {
        qualityCard.parentNode.insertBefore(designCard, qualityCard);
      }
    }

    // Quality Scores
    populateScoresTable(data.scores);
    
    // Key Findings
    populateKeyFindings(data);
    
    // Completion Status
    updateCompletionStatus();
    
    // Initialize Chart
    initializeQualityChart(data.scores);
  }

  // ---- POPULATE SCORES TABLE ----
  function populateScoresTable(scores) {
    const scoreMap = {
      overall: { id: 'scoreOverall', grade: 'gradeOverall' },
      resolution: { id: 'scoreResolution', grade: 'gradeResolution' },
      coverage: { id: 'scoreCoverage', grade: 'gradeCoverage' },
      timeliness: { id: 'scoreTimeliness', grade: 'gradeTimeliness' },
      conformance: { id: 'scoreConformance', grade: 'gradeConformance' },
      context: { id: 'scoreContext', grade: 'gradeContext' }
    };

    for (const [key, ids] of Object.entries(scoreMap)) {
      const score = scores[key];
      if (score !== undefined && score !== null) {
        document.getElementById(ids.id).textContent = score.toFixed(1);
        const grade = getGrade(score);
        const gradeEl = document.getElementById(ids.grade);
        gradeEl.textContent = grade;
        gradeEl.className = `badge bg-${getGradeColor(score)}`;
      }
    }
  }

  // ---- INITIALIZE QUALITY CHART ----
  function initializeQualityChart(scores) {
    const ctx = document.getElementById('qualityChart');
    if (!ctx) return;

    const chartData = {
      labels: ['Overall', 'Resolution', 'Coverage', 'Timeliness', 'Conformance', 'Context'],
      datasets: [{
        label: 'Quality Scores',
        data: [
          scores.overall || 0,
          scores.resolution || 0,
          scores.coverage || 0,
          scores.timeliness || 0,
          scores.conformance || 0,
          scores.context || 0
        ],
        backgroundColor: [
          getGradeColor(scores.overall),
          getGradeColor(scores.resolution),
          getGradeColor(scores.coverage),
          getGradeColor(scores.timeliness),
          getGradeColor(scores.conformance),
          getGradeColor(scores.context)
        ].map(color => `var(--bs-${color})`),
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 5
      }]
    };

    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // ---- KEY FINDINGS ----
  function populateKeyFindings(data) {
    const findingsEl = document.getElementById('keyFindings');
    let findingsHTML = '<ul class="list-group list-group-flush">';

    // Analyze scores for findings
    const scores = data.scores;
    
    if (scores.overall !== undefined) {
      if (scores.overall >= 4.5) {
        findingsHTML += '<li class="list-group-item"><strong>✅ Excellent Overall Quality:</strong> This dataset demonstrates exceptional data quality and is highly suitable for most applications.</li>';
      } else if (scores.overall >= 3.5) {
        findingsHTML += '<li class="list-group-item"><strong>✅ Good Overall Quality:</strong> The dataset meets quality standards with minor limitations for specific use cases.</li>';
      } else if (scores.overall >= 2.5) {
        findingsHTML += '<li class="list-group-item"><strong>⚠️ Acceptable Quality:</strong> The dataset is usable but has notable limitations. Consider use-case specific requirements.</li>';
      } else {
        findingsHTML += '<li class="list-group-item"><strong>⛔ Poor Quality:</strong> Significant quality issues detected. Recommend comprehensive review before use.</li>';
      }
    }

    // Resolution findings
    if (scores.resolution !== undefined && scores.resolution < 2.5) {
      findingsHTML += '<li class="list-group-item"><strong>🔍 Resolution Concern:</strong> Spatial resolution may be insufficient for some applications. Verify fitness for purpose.</li>';
    }

    // Coverage findings
    if (scores.coverage !== undefined && scores.coverage < 2.5) {
      findingsHTML += '<li class="list-group-item"><strong>🌍 Coverage Limitation:</strong> Geographic coverage is limited. Check if it meets your study area requirements.</li>';
    }

    // Timeliness findings
    if (scores.timeliness !== undefined && scores.timeliness < 2.5) {
      findingsHTML += '<li class="list-group-item"><strong>⏰ Timeliness Issue:</strong> Data currency may be outdated. Consider recent alternatives if available.</li>';
    }

    // Conformance findings
    if (scores.conformance !== undefined && scores.conformance < 2.5) {
      findingsHTML += '<li class="list-group-item"><strong>📋 Conformance Issues:</strong> Data does not fully conform to specified standards. Review documentation carefully.</li>';
    }

    // Context findings
    if (scores.context !== undefined && scores.context < 2.5) {
      findingsHTML += '<li class="list-group-item"><strong>🔗 Limited Transferability:</strong> Data may not be easily transferable to other contexts or regions.</li>';
    }

    findingsHTML += '</ul>';
    findingsEl.innerHTML = findingsHTML;
  }

  // ---- COMPLETION STATUS ----
  function updateCompletionStatus() {
    let completedSections = 0;
    const sections = ['section1', 'section2', 'section3', 'section4', 'section5'];
    
    sections.forEach(section => {
      if (localStorage.getItem(`${section}_completed`)) {
        completedSections++;
      }
    });

    document.getElementById('completedSections').textContent = `${completedSections}/5`;
    const percentage = Math.round((completedSections / 5) * 100);
    document.getElementById('completionPercentage').textContent = `${percentage}%`;
  }

  // ---- EXPORT FUNCTIONS ----
  const downloadPDFBtn = document.getElementById('downloadPDF');
  if (downloadPDFBtn) {
    downloadPDFBtn.addEventListener('click', downloadPDF);
  }

  const downloadJSONBtn = document.getElementById('downloadJSON');
  if (downloadJSONBtn) {
    downloadJSONBtn.addEventListener('click', downloadJSON);
  }

  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }

  function downloadPDF() {
    const data = generateSummaryData();
    const pdfContent = `DATA QUALITY EVALUATION REPORT
=====================================
Generated: ${new Date().toLocaleString()}

DATASET INFORMATION:
- Title: ${data.datasetTitle}
- Data Type: ${data.dataType}
- Processing Level: ${data.processingLevel}
- Evaluation Type: ${data.evaluationType}
- Language: ${data.language}
- Evaluator: ${data.evaluatorName}
- Organization: ${data.evaluatorOrg}

USE-CASE INFORMATION:
- Description: ${data.useCaseDesc}
- Optimum Collection Date: ${data.optimumDate}
- Spatial Resolution: ${data.spatialRes}
- Area of Interest: ${data.areaOfInterest}

QUALITY ASSESSMENT SCORES:
- Overall: ${(data.scores.overall || 0).toFixed(1)} (${getGrade(data.scores.overall)})
- Resolution: ${(data.scores.resolution || 0).toFixed(1)} (${getGrade(data.scores.resolution)})
- Coverage: ${(data.scores.coverage || 0).toFixed(1)} (${getGrade(data.scores.coverage)})
- Timeliness: ${(data.scores.timeliness || 0).toFixed(1)} (${getGrade(data.scores.timeliness)})
- Conformance: ${(data.scores.conformance || 0).toFixed(1)} (${getGrade(data.scores.conformance)})
- Context/Transferability: ${(data.scores.context || 0).toFixed(1)} (${getGrade(data.scores.context)})

EVALUATION METADATA:
- Created: ${new Date(data.timestamps.created).toLocaleString()}
- Last Modified: ${new Date(data.timestamps.lastModified).toLocaleString()}

=====================================
End of Report`;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const data = generateSummaryData();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- SUBMIT FORM ----
  const submitBtn = document.getElementById('submitForm');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Are you sure you want to submit the evaluation? Your data will be cleared.')) {
        // Set flag to prevent further updates from sections
        localStorage.setItem('formSubmitted', 'true');
        
        // Clear all form data - comprehensive cleanup
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Remove all survey-related keys
          if (key && (key.includes('dataset') || key.includes('data') || key.includes('evaluator') || 
                      key.includes('evaluation') || key.includes('survey') || key.includes('section') ||
                      key.includes('keyword') || key.includes('language') || key.includes('documentation') ||
                      key.includes('accessibility') || key.includes('metadata') || key.includes('optimum') ||
                      key.includes('spatial') || key.includes('aoi') || key.includes('creator') ||
                      key.includes('conformance') || key.includes('accuracy') || key.includes('quality') ||
                      key.includes('reputation') || key.includes('lineage') || key.includes('processing') ||
                      key.includes('useCase') || key.includes('org') || key.includes('completed'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        alert('Evaluation submitted successfully! All data cleared. Redirecting to home page.');
        window.location.href = '../index.html';
      }
    });
  }

  // ---- CLEAR & START NEW SURVEY ----
  const clearBtn = document.getElementById('clearAllData');
  if (clearBtn) {
    clearBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Clear all survey data and start fresh? This action cannot be undone.')) {
        clearAllSurveyData();
        localStorage.removeItem('formSubmitted');
        alert('All survey data cleared. You can now start a new evaluation.');
        window.location.href = '../index.html';
      }
    });
  }

  // Populate on page load
  populateSummaryPage();
  DataManager.restorePageData();
});
