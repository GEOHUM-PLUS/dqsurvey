// ============================================
// SECTION 4: CONFORMANCE
// ============================================

import { DataManager, initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();
  
  // Initialize conformance visibility
  const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  if (savedProcessingLevel) {
    applyConformanceVisibility(savedProcessingLevel);
  }
  updateNavigationButtons();
  
  // Listen for data-type changes from section1
  window.addEventListener('dataTypeChanged', function(event) {
    const dataType = event.detail.dataType;
    console.log('Section 4: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });
  
  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function(event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 4: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });
  
  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function(event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 4: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });
  
  // Listen for aggregation level changes from section1 - CRITICAL for conformance decisions
  window.addEventListener('aggregationLevelChanged', function(event) {
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
  
  // Restore selected accuracy type on page load
  setTimeout(() => {
    const savedData = DataManager.getSection('section4', 'conformance');
    if (savedData && savedData.accuracyType) {
      const radioToCheck = document.querySelector(`input[name="accuracyType"][value="${savedData.accuracyType}"]`);
      if (radioToCheck) {
        radioToCheck.checked = true;
        handleAccuracyTypeChange();
      }
    }
  }, 100);

  // ---- CONFORMANCE SCORING ----
  const conformanceScores = document.querySelectorAll('input[name="conformanceScore"]');
  
  conformanceScores.forEach(score => {
    score.addEventListener('change', function() {
      DataManager.saveScore(this.id, this.value, 'conformance', 'section4');
      console.log('Conformance score saved:', this.id, '=', this.value);
    });
  });

  // ---- SAVE FORM DATA ----
  window.addEventListener('beforeunload', () => {
    // Don't save if form has been submitted
    if (sessionStorage.getItem('formSubmitted')) {
      return;
    }
    const formData = DataManager.collectCurrentPageData();
    DataManager.saveSection('section4', 'general', formData);
  });
  
  // Restore saved data on page load
  DataManager.restorePageData();
});
