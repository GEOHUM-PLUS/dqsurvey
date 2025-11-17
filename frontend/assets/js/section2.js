// ============================================
// SECTION 2: DESCRIPTIVES
// ============================================

import { DataManager, initializeHighlighting, applyConformanceVisibility, updateNavigationButtons } from './shared-utils.js';

// ---- KEYWORDS BANK ----
// Predefined keywords that users can select from or add custom ones
const KEYWORDS_BANK = [
  'Geographic Information',
  'Spatial Data',
  'Climate',
  'Land Cover',
  'Urban Areas',
  'Environmental Monitoring',
  'Remote Sensing',
  'GIS',
  'Cadastral Data',
  'Transportation',
  'Natural Resources',
  'Biodiversity',
  'Water Resources',
  'Agriculture',
  'Geology',
  'Atmosphere',
  'Hydrography',
  'Elevation',
  'Boundaries',
  'Population',
  'Infrastructure',
  'Utilities',
  'Emergency Management',
  'Precision Mapping'
];

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
    console.log('Section 2: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });
  
  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function(event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 2: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });
  
  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function(event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 2: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });
  
  // Listen for aggregation level changes from section1 - CRITICAL
  window.addEventListener('aggregationLevelChanged', function(event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 2: Aggregation level changed to:', aggregationLevel);
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
    console.log('Section 2 updating UI for data type:', dataType);
  }
  
  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 2 updating UI for processing level:', processingLevel);
  }
  
  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 2 updating UI for evaluation type:', evaluationType);
  }
  
  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 2 updating UI for aggregation level:', aggregationLevel);
  }
  
  // ---- HELPER FUNCTION: SAVE KEY FORM VALUES ----
  function saveFormValue(key, value) {
    sessionStorage.setItem(key, value);
    console.log(`Saved to session: ${key} = ${value}`);
  }
  
  // ---- KEYWORDS HANDLING ----
  const keywordInput = document.getElementById('keyword-input');
  const keywordTags = document.getElementById('keyword-tags');
  const suggestions = document.getElementById('suggestions');
  
  function addKeyword(keyword) {
    if (!keyword || !keyword.trim()) return;
    
    keyword = keyword.trim();
    
    // Check if keyword already exists
    const existingKeywords = getKeywords();
    if (existingKeywords.includes(keyword)) {
      console.log('Keyword already exists');
      return;
    }
    
    const badge = document.createElement('span');
    badge.className = 'badge bg-info me-1 mb-1';
    badge.innerHTML = `${keyword} <button type="button" class="btn-close btn-close-white ms-1" aria-label="Close" style="cursor: pointer;"></button>`;
    
    badge.querySelector('.btn-close').addEventListener('click', () => {
      badge.remove();
      saveKeywords();
    });
    
    keywordTags?.appendChild(badge);
    keywordInput.value = '';
    suggestions.style.display = 'none';
    
    // Save keywords to session storage
    saveKeywords();
  }
  
  function getKeywords() {
    return Array.from(keywordTags?.querySelectorAll('.badge') || [])
      .map(badge => badge.textContent.replace(/\s×\s/, '').trim());
  }
  
  function saveKeywords() {
    const keywords = getKeywords();
    saveFormValue('keywords', JSON.stringify(keywords));
  }
  
  function showSuggestions(input) {
    if (!input.trim()) {
      suggestions.style.display = 'none';
      return;
    }
    
    const filtered = KEYWORDS_BANK.filter(k => 
      k.toLowerCase().includes(input.toLowerCase()) && 
      !getKeywords().includes(k)
    );
    
    suggestions.innerHTML = '';
    
    if (filtered.length > 0) {
      filtered.slice(0, 5).forEach(keyword => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = keyword;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          addKeyword(keyword);
        });
        suggestions.appendChild(li);
      });
      suggestions.style.display = 'block';
    } else {
      suggestions.style.display = 'none';
    }
  }
  
  if (keywordInput) {
    keywordInput.addEventListener('input', (e) => {
      showSuggestions(e.target.value);
    });
    
    keywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addKeyword(keywordInput.value);
      }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#keyword-input') && !e.target.closest('#suggestions')) {
        suggestions.style.display = 'none';
      }
    });
  }

  // ---- LANGUAGE DROPDOWN ----
  const languageDropdown = document.getElementById('languageDropdown');
  if (languageDropdown) {
    languageDropdown.addEventListener('change', function() {
      DataManager.saveSection('section2', 'descriptives', { language: this.value });
      saveFormValue('language', this.value);
    });
  }

  // ---- METADATA FIELDS ----
  const documentationInput = document.getElementById('documentation');
  const accessibilityInput = document.getElementById('accessibility');
  const metadataStandardInput = document.getElementById('metadataStandard');
  
  if (documentationInput) {
    documentationInput.addEventListener('change', function() {
      DataManager.saveSection('section2', 'metadata', { documentation: this.value });
    });
  }
  
  if (accessibilityInput) {
    accessibilityInput.addEventListener('change', function() {
      DataManager.saveSection('section2', 'metadata', { accessibility: this.value });
    });
  }
  
  if (metadataStandardInput) {
    metadataStandardInput.addEventListener('change', function() {
      DataManager.saveSection('section2', 'metadata', { metadataStandard: this.value });
    });
  }

  // ---- SAVE FORM DATA ----
  window.addEventListener('beforeunload', () => {
    // Don't save if form has been submitted
    if (sessionStorage.getItem('formSubmitted')) {
      return;
    }
    const formData = DataManager.collectCurrentPageData();
    DataManager.saveSection('section2', 'general', formData);
  });
  
  // Restore saved data on page load
  DataManager.restorePageData();
});
