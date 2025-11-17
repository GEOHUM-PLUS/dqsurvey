// ============================================
// SECTION 5: CONTEXT
// ============================================

import { DataManager, initializeHighlighting, applyConformanceVisibility, updateNavigationButtons } from './shared-utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
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
    console.log('Section 5: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });
  
  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function(event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 5: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });
  
  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function(event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 5: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });
  
  // Listen for aggregation level changes from section1 - CRITICAL for context recommendations
  window.addEventListener('aggregationLevelChanged', function(event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 5: Aggregation level changed to:', aggregationLevel);
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
    console.log('Section 5 updating UI for data type:', dataType);
  }
  
  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 5 updating UI for processing level:', processingLevel);
  }
  
  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 5 updating UI for evaluation type:', evaluationType);
  }
  
  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 5 updating UI for aggregation level:', aggregationLevel);
  }
  
  // ---- CONTEXT INFORMATION HANDLING ----
  const contextTypeSelect = document.getElementById('contextType');
  if (contextTypeSelect) {
    contextTypeSelect.addEventListener('change', function() {
      DataManager.saveSection('section5', 'context', { contextType: this.value });
    });
  }

  // ---- INTENDED USE CASES ----
  const useCaseCheckboxes = document.querySelectorAll('input[name="intendedUseCase"]');
  
  useCaseCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const selectedUseCases = Array.from(useCaseCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      DataManager.saveSection('section5', 'context', { intendedUseCases: selectedUseCases });
      console.log('Selected use cases:', selectedUseCases);
    });
  });

  // ---- LIMITATIONS AND CONSTRAINTS ----
  const limitationsInput = document.getElementById('limitations');
  if (limitationsInput) {
    limitationsInput.addEventListener('change', function() {
      DataManager.saveSection('section5', 'context', { limitations: this.value });
    });
  }

  // ---- RECOMMENDATIONS ----
  const recommendationsInput = document.getElementById('recommendations');
  if (recommendationsInput) {
    recommendationsInput.addEventListener('change', function() {
      DataManager.saveSection('section5', 'context', { recommendations: this.value });
    });
  }

  // ---- QUALITY ASSESSMENT SCORING ----
  const qualityScores = document.querySelectorAll('input[type="number"][name*="qualityScore"]');
  
  qualityScores.forEach(scoreInput => {
    scoreInput.addEventListener('change', function() {
      const scoreGroup = this.getAttribute('data-group') || 'context';
      DataManager.saveScore(this.id, this.value, scoreGroup, 'section5');
      console.log('Quality score saved:', this.id, '=', this.value, 'in group:', scoreGroup);
    });
  });

  // ---- SAVE FORM DATA ----
  window.addEventListener('beforeunload', () => {
    // Don't save if form has been submitted
    if (sessionStorage.getItem('formSubmitted')) {
      return;
    }
    const formData = DataManager.collectCurrentPageData();
    DataManager.saveSection('section5', 'general', formData);
  });

  // ---- AUTO-SAVE FORM FIELDS IN REAL-TIME ----
  function setupAutoSave() {
    // Save all text inputs and selects on change/blur
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea, select').forEach(field => {
      if (!field.id) return; // Skip fields without ID
      
      field.addEventListener('change', function() {
        if (sessionStorage.getItem('formSubmitted')) return;
        
        // Save this specific field
        const dataToSave = {};
        dataToSave[this.id] = this.value;
        DataManager.saveSection('section5', 'context', dataToSave);
        console.log('Auto-saved field:', this.id, '=', this.value);
      });
      
      field.addEventListener('blur', function() {
        if (sessionStorage.getItem('formSubmitted')) return;
        
        // Save on blur too
        const dataToSave = {};
        dataToSave[this.id] = this.value;
        DataManager.saveSection('section5', 'context', dataToSave);
      });
    });
  }
  
  setupAutoSave();
  
  // Restore saved data on page load
  DataManager.restorePageData();
});
