// ============================================
// SECTION 3: DESIGN
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
    console.log('Section 3: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });
  
  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function(event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 3: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });
  
  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function(event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 3: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });
  
  // Listen for aggregation level changes from section1 - CRITICAL for design decisions
  window.addEventListener('aggregationLevelChanged', function(event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 3: Aggregation level changed to:', aggregationLevel);
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
  
  // Also get from state module getters
  const stateDataType = getDataType();
  if (stateDataType && !currentDataType) {
    handleDataTypeChange(stateDataType);
  }
  
  const stateEvaluationType = getEvaluationType();
  console.log('State evaluation type:', stateEvaluationType);
  
  function handleDataTypeChange(dataType) {
    console.log('Section 3 updating UI for data type:', dataType);
    updateSpatialResolutionOptions(dataType);
  }
  
  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 3 updating UI for processing level:', processingLevel);
  }
  
  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 3 updating UI for evaluation type:', evaluationType);
  }
  
  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 3 updating UI for aggregation level:', aggregationLevel);
  }

  // ---- SPATIAL RESOLUTION HANDLING ----
  function updateSpatialResolutionOptions(dataType) {
    const pixelResolution = document.getElementById('pixel-resolution');
    const gridResolution = document.getElementById('grid-resolution');
    const aggregationResolution = document.getElementById('aggregation-resolution');
    const manualSelection = document.getElementById('manual-resolution-selection');
    
    // Hide all first
    [pixelResolution, gridResolution, aggregationResolution, manualSelection].forEach(el => {
      if (el) el.style.display = 'none';
    });
    
    // Show appropriate option based on data type
    switch(dataType) {
      case 'remote-sensing':
        if (pixelResolution) pixelResolution.style.display = 'block';
        console.log('Showing pixel resolution input for Remote Sensing');
        break;
      case 'gis':
        if (gridResolution) gridResolution.style.display = 'block';
        console.log('Showing grid resolution input for GIS');
        break;
      case 'model-ml':
        if (gridResolution) gridResolution.style.display = 'block';
        console.log('Showing grid resolution input for Model/ML');
        break;
      case 'prediction':
        if (gridResolution) gridResolution.style.display = 'block';
        console.log('Showing grid resolution input for Prediction');
        break;
      case 'survey':
        if (aggregationResolution) aggregationResolution.style.display = 'block';
        console.log('Showing aggregation level input for Survey');
        break;
      default:
        if (manualSelection) manualSelection.style.display = 'block';
        console.log('Showing manual selection for data type:', dataType);
    }
  }
  
  // Handle manual resolution type selection (if visible)
  const resolutionTypeRadios = document.querySelectorAll('input[name="resolutionType"]');
  resolutionTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const pixelResolution = document.getElementById('pixel-resolution');
      const gridResolution = document.getElementById('grid-resolution');
      const aggregationResolution = document.getElementById('aggregation-resolution');
      
      // Hide all first
      [pixelResolution, gridResolution, aggregationResolution].forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      // Show selected type
      if (this.value === 'pixel' && pixelResolution) {
        pixelResolution.style.display = 'block';
      } else if (this.value === 'grid' && gridResolution) {
        gridResolution.style.display = 'block';
      } else if (this.value === 'aggregation' && aggregationResolution) {
        aggregationResolution.style.display = 'block';
      }
    });
  });
  
  // Save spatial resolution inputs
  const pixelResolutionValue = document.getElementById('pixelResolutionValue');
  if (pixelResolutionValue) {
    pixelResolutionValue.addEventListener('change', function() {
      sessionStorage.setItem('spatialResolutionPixels', this.value);
    });
  }
  
  const gridResolutionValue = document.getElementById('gridResolutionValue');
  if (gridResolutionValue) {
    gridResolutionValue.addEventListener('change', function() {
      sessionStorage.setItem('spatialResolutionGrid', this.value);
    });
  }
  
  const aggregationLevel = document.getElementById('aggregationResolutionLevel');
  if (aggregationLevel) {
    aggregationLevel.addEventListener('change', function() {
      sessionStorage.setItem('spatialResolutionAggregation', this.value);
    });
  }

  // ---- SPATIAL COVERAGE HANDLING ----
  const coverageTypeSelect = document.getElementById('coverageType');
  if (coverageTypeSelect) {
    coverageTypeSelect.addEventListener('change', function() {
      DataManager.saveSection('section3', 'spatialCoverage', { coverageType: this.value });
    });
  }
  // ---- DYNAMIC NEXT BUTTON RESOLUTION ----
(function(){
    const nextBtn = document.getElementById('Design');
    function resolveNext(){
        const keys = ['dataProcessingLevel','processingLevel','processing-level','processing_level'];
        let val = null;
        // try sessionStorage first
        for(const k of keys){
            try{ val = sessionStorage.getItem(k); if(val) break; }catch(e){}
        }
        // fallback to localStorage
        if(!val){
            for(const k of keys){
                try{ val = localStorage.getItem(k); if(val) break; }catch(e){}
            }
        }
        // fallback to a DOM input on the page (if present)
        if(!val){
            const el = document.querySelector('[name="processingLevel"], [name="processing-level"], [name="processing_level"]');
            if(el) val = el.value || el.getAttribute('value') || null;
        }
        // decide next target: if value is 'primary' -> skip conformance -> go to context (section5)
        if(val && val.toString().toLowerCase().includes('primary')){
            nextBtn.href = 'section5.html';
            nextBtn.textContent = 'Context Section';
        } else {
            nextBtn.href = 'section4.html';
            nextBtn.textContent = 'Conformance Section';
        }
    }
    resolveNext();
    window.addEventListener('storage', resolveNext);
})();

  // ---- TIMELINESS INPUTS ----
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const temporalResolutionInput = document.getElementById('temporalResolution');
  
  if (startDateInput) {
    startDateInput.addEventListener('change', function() {
      DataManager.saveSection('section3', 'timeliness', { startDate: this.value });
    });
  }
  
  if (endDateInput) {
    endDateInput.addEventListener('change', function() {
      DataManager.saveSection('section3', 'timeliness', { endDate: this.value });
    });
  }
  
  if (temporalResolutionInput) {
    temporalResolutionInput.addEventListener('change', function() {
      DataManager.saveSection('section3', 'timeliness', { temporalResolution: this.value });
    });
  }

  // ---- AUTO-FILL OPTIMUM DATE FROM SECTION 1 ----
  const optimumDateAuto = document.getElementById('optimumCollectionAuto');
  if (optimumDateAuto) {
    const savedOptimumDate = sessionStorage.getItem('optimumDataCollection') || DataManager.getSection('section1', 'useCase')?.optimumDataCollection;
    if (savedOptimumDate) {
      optimumDateAuto.value = savedOptimumDate;
    }
  }

  // ---- SAVE FORM DATA ----
  window.addEventListener('beforeunload', () => {
    // Don't save if form has been submitted
    if (sessionStorage.getItem('formSubmitted')) {
      return;
    }
    const formData = DataManager.collectCurrentPageData();
    DataManager.saveSection('section3', 'general', formData);
  });
  
  // Restore saved data on page load
  DataManager.restorePageData();
});
