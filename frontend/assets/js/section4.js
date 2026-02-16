// ============================================
// SECTION 4: CONFORMANCE
// ============================================

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { DataManager } from './core/datamanager.js';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();

  // Validate presence of Section 1 and Section 2 IDs
  const section1Id = sessionStorage.getItem("section1_id");
  const section2Id = sessionStorage.getItem("section2_id");
   const section3Id = sessionStorage.getItem("section3_id");

  if (!section1Id || !section2Id || !section3Id) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

  console.log("✔ Section3 loaded with IDs:", {
    section1Id,
    section2Id,
    section3Id
  });
  // Initialize conformance visibility
  const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  if (savedProcessingLevel) {
    applyConformanceVisibility(savedProcessingLevel);
  }
  updateNavigationButtons();

  // Listen for data-type changes from section1
  window.addEventListener('dataTypeChanged', function (event) {
    const dataType = event.detail.dataType;
    console.log('Section 4: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });

  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function (event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 4: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });

  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function (event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 4: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });

  // Listen for aggregation level changes from section1 - CRITICAL for conformance decisions
  window.addEventListener('aggregationLevelChanged', function (event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 4: Aggregation level changed to:', aggregationLevel);
    handleAggregationLevelChange(aggregationLevel);
  });

  // Check current values from sessionStorage on page load
  const currentDataType = sessionStorage.getItem('dataType');
  if (currentDataType) {
    handleDataTypeChange(currentDataType);
  }

  const currentProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  if (currentProcessingLevel) {
    handleProcessingLevelChange(currentProcessingLevel);
  }

  const currentEvaluationType = sessionStorage.getItem('evaluationType');
  if (currentEvaluationType) {
    handleEvaluationTypeChange(currentEvaluationType);
  }

  const currentAggregationLevel = sessionStorage.getItem('optimumAggregationLevel');
  if (currentAggregationLevel) {
    handleAggregationLevelChange(currentAggregationLevel);
  }

  function handleDataTypeChange(dataType) {
    console.log('Section 4 updating UI for data type:', dataType);
  }

  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 4 updating UI for processing level:', processingLevel);
  }

  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 4 updating UI for evaluation type:', evaluationType);
  }

  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 4 updating UI for aggregation level:', aggregationLevel);
  }


  // ---- DYNAMIC INPUT DATA ROWS ----
  const inputDataList = document.getElementById('input-data-list');

  inputDataList.addEventListener('click', function (e) {
    // Handle Add Button
    if (e.target.classList.contains('add-input-data')) {
      const currentRow = e.target.closest('.input-data-entry');
      const newRow = currentRow.cloneNode(true);

      // Clear the values in the new row
      newRow.querySelectorAll('input').forEach(input => input.value = '');
      newRow.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
      
      // Change the button from + to -
      const btn = newRow.querySelector('.add-input-data');
      btn.classList.replace('btn-outline-success', 'btn-outline-danger');
      btn.classList.replace('add-input-data', 'remove-input-data');
      btn.textContent = '-';

      inputDataList.appendChild(newRow);
    }

    // Handle Remove Button
    if (e.target.classList.contains('remove-input-data')) {
      e.target.closest('.input-data-entry').remove();
    }
  });

  // ---- CONFORMANCE SECTION ACCESS CONTROL ----
  const sectionPageName = window.location.pathname.split('/').pop();
  const savedProcessingLevelCheck = sessionStorage.getItem('dataProcessingLevel');

  if (sectionPageName === 'section4.html') {
    if (savedProcessingLevelCheck === 'primary') {
      console.warn('Access denied to conformance section: Primary Data selected');
      setTimeout(() => {
        window.location.href = 'section5.html';
      }, 1000);
    }
  }

  // ---- ACCURACY TYPE HANDLING ----
  const accuracyTypeRadios = document.querySelectorAll('input[name="accuracyType"]');

  function handleAccuracyTypeChange() {
    const selected = document.querySelector('input[name="accuracyType"]:checked');

    // Hide all accuracy input sections
    document.getElementById('positional-accuracy')?.classList.add('d-none');
    document.getElementById('attribute-accuracy')?.classList.add('d-none');
    document.getElementById('model-performance')?.classList.add('d-none');
    document.getElementById('data-plausibility')?.classList.add('d-none');

    if (selected) {
      const value = selected.value;
      const targetIdMap = {
        'positional': 'positional-accuracy',
        'attribute': 'attribute-accuracy',
        'model': 'model-performance',
        'plausibility': 'data-plausibility'
      };

      const targetId = targetIdMap[value];
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.classList.remove('d-none');
        console.log('Showing accuracy input for:', value, '-> div ID:', targetId);
      } else {
        console.error('Target element not found for accuracy type:', value, '-> expected ID:', targetId);
      }

      // Save the selected accuracy type
      DataManager.saveSection('section4', 'conformance', { accuracyType: value });
      console.log('Accuracy type changed to:', value);
    }
  }

  accuracyTypeRadios.forEach(radio => {
    radio.addEventListener('change', handleAccuracyTypeChange);
  });



  // ---- CONFORMANCE SCORING ----
  const conformanceScores = document.querySelectorAll('input[name="conformanceScore"]');

  conformanceScores.forEach(score => {
    score.addEventListener('change', function () {
      DataManager.saveScore(this.id, this.value, 'conformance', 'section4');
      console.log('Conformance score saved:', this.id, '=', this.value);
    });
  });

 
// SUBMIT SECTION 4 TO BACKEND
const submitBtn = document.querySelector('.btn-next');

if (submitBtn) {
  submitBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const section1Id = sessionStorage.getItem("section1_id");
    const section2Id = sessionStorage.getItem("section2_id");
    const section3Id = sessionStorage.getItem("section3_id");

    if (!section1Id || !section2Id || !section3Id) {
      alert("❌ Missing section IDs.");
      return;
    }

    // -------- helper --------
    const val = (id) => {
      const el = document.getElementById(id);
      return el && el.value !== '' ? el.value : null;
    };

    const checkedValues = (selector) =>
      Array.from(document.querySelectorAll(selector))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // -------- input datasets --------
    const inputDatasets = [];
    document.querySelectorAll('.input-data-entry').forEach(row => {
      const name = row.querySelector('[name="inputName[]"]')?.value;
      const link = row.querySelector('[name="inputLink[]"]')?.value;
      const score = row.querySelector('[name="inputScore[]"]')?.value;

      if (name || link || score) {
        inputDatasets.push({
          name: name || null,
          link: link || null,
          score: score ? Number(score) : null
        });
      }
    });

    // -------- payload (MATCHES BACKEND & DB) --------
    const payload = {
      section1Id: Number(section1Id),
      section2Id: Number(section2Id),
      section3Id: Number(section3Id),

      // Completeness
      valuesCompleteness: val("valuesCompleteness"),
      attributeCompleteness: val("attributeCompleteness"),
      thematicSelectivity: val("thematicSelectivity"),
      spatialVariability: val("spatialVariability"),
      completenessScore: document.querySelector('[data-scoregroup="conformance-completeness"]')?.value || null,

      // Consistency
      topoConsistency: val("topoConsistency"),
      domainConsistency: val("domainConsistency"),
      thematicConsistency: val("thematicConsistency"),
      spatialConsistency: val("spatialConsistency"),
      inconsistencySources: checkedValues('.inconsistency-check'),
      consistencyScore: document.querySelector('[data-scoregroup="conformance-consistency"]')?.value || null,

      // Accuracy
      accuracyType: document.querySelector('input[name="accuracyType"]:checked')?.value || null,
      thematicAccuracy: val("thematicAccuracy"),
      attributeAccuracy: val("attributeAccuracy"),
      modelPerformance: val("modelPerformance"),
      dataPlausibility: val("dataPlausibility"),

      validationMethod: val("validationMethod"),
      validationData: val("validationData"),
      temporalStability: val("temporalStability"),
      thematicStability: val("thematicStability"),
      spatialStability: val("spatialStability"),
      uncertaintyAnalyses: val("uncertaintyAnalyses"),
      uncertaintySources: checkedValues('input[name="uncertaintySources"]'),
      accuracyScore: document.querySelector('[data-scoregroup="conformance-accuracy"]')?.value || null,

      // Reproducibility
      methodClarity: val("methodClarity"),
      methodDocsLink: val("methodDocsLink"),
      methodReputation: val("methodReputation"),
      methodTransferability: val("methodTransferability"),
      codeAvailability: val("codeAvailability"),
      codeRepo: val("codeRepo"),
      resourcesNeeded: val("resourcesNeeded"),
      reproducibilityScore: document.querySelector('[data-scoregroup="conformance-reproducibility"]')?.value || null,

      // Input data summary
      traceability: val("traceability"),
      inputConsistency: val("inputConsistency"),
      inputDataFit: val("inputDataFit"),
      inputScore: document.querySelector('[data-scoregroup="conformance-inputdata"]')?.value || null,

      inputDatasets
    };

    console.log("🚀 Section4 Payload:", payload);

    // -------- API call --------
    try {
      const res = await fetch('https://dqsurvey.onrender.com/section4/section4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Section4 save failed');
      }

      console.log('✅ Section4 saved:', result);

      sessionStorage.setItem('section4_id', result.section4_id);
      sessionStorage.setItem('formSubmitted', 'true');

      window.location.href = 'section5.html';

    } catch (err) {
      console.error('❌ Section4 submit error:', err);
      alert('Failed to save Section 4.');
    }
  });
}

// Handle previous button click to send step1=1
    document.getElementById('back4to3').addEventListener('click', function() {
        sessionStorage.setItem('step3', '1');
    });

});
