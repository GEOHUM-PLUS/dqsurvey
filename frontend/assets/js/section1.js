function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ============================================
// SECTION 1: INITIAL INFORMATION 
// ============================================

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons } from './shared-utils.js';
import { setDataType, setEvaluationType, setProcessingLevel, getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';

// Database API configuration
// const API_BASE_URL = 'http://localhost:3000/api'; // Update with your backend URL

// Save data to backend database
async function saveToDatabase(key, value) {
  try {
    await fetch(`${API_BASE_URL}/survey/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, timestamp: new Date().toISOString() })
    });
  } catch (error) {
    console.warn(`Database save error: ${error.message}`);
  }
}

// Save key values for inter-section communication
function saveFormValue(key, value) {
  sessionStorage.setItem(key, value);
  saveToDatabase(key, value);
  console.log(`Saved: ${key} = ${value}`);
}

document.addEventListener('DOMContentLoaded', function () {
  initializeHighlighting();



  // ---- DATA PROCESSING LEVEL (Primary vs Products) - CRITICAL ----
  const dataProcessingLevel = document.getElementById('dataprocessinglevel');
  if (dataProcessingLevel) {
    dataProcessingLevel.addEventListener('change', function() {
      saveFormValue('dataProcessingLevel', this.value);
      applyConformanceVisibility(this.value);
      updateNavigationButtons();
      // Broadcast processing level change to all sections via custom event
      window.dispatchEvent(new CustomEvent('processingLevelChanged', { detail: { processingLevel: this.value } }));
    });
    dataProcessingLevel.dispatchEvent(new Event('change'));
  }

  // ---- EVALUATION TYPE (Use-case vs General) - CRITICAL ----
  const evaluationType = document.getElementById('evaluationType');
  const useCaseSection = document.getElementById('use-case-section');
  
  if (evaluationType) {
    evaluationType.addEventListener('change', function() {
      saveFormValue('evaluationType', this.value);
      
      const isUseCase = this.value === 'use-case-adequacy';
      if (useCaseSection) useCaseSection.style.display = isUseCase ? 'block' : 'none';
      
      document.querySelectorAll('.use-case-only').forEach(el => {
        el.style.display = isUseCase ? 'block' : 'none';
      });
      
      document.querySelectorAll('.general-design-only').forEach(el => {
        el.style.display = isUseCase ? 'none' : 'block';
      });
      
      // Auto-fill optimum date into design section
      const optimumDateInput = document.getElementById('optimumDataCollection');
      const autoFillField = document.getElementById('optimumCollectionAuto');
      if (optimumDateInput && autoFillField) {
        autoFillField.value = optimumDateInput.value || '';
        optimumDateInput.addEventListener('change', () => {
          autoFillField.value = optimumDateInput.value;
        });
      }
      
      // Broadcast evaluation type change to all sections via custom event
      window.dispatchEvent(new CustomEvent('evaluationTypeChanged', { detail: { evaluationType: this.value } }));
    });
    evaluationType.dispatchEvent(new Event('change'));
  }

  // ---- DATA TYPE (crucial for other sections) ----
  const dataTypeSelect = document.getElementById('dataType');
  const dataTypeOtherContainer = document.getElementById('datatype-other-container');
  const spatialResolutionContainer = document.getElementById('spatial-resolution-container').parentElement; // Parent div with label
  
  // Resolution containers for each data type
  const rsPixelResolution = document.getElementById('rs-pixel-resolution');
  const gisGridResolution = document.getElementById('gis-grid-resolution');
  const mlResolution = document.getElementById('ml-resolution');
  const predictionResolution = document.getElementById('prediction-resolution');
  const surveyAggregation = document.getElementById('survey-aggregation');
  const otherResolution = document.getElementById('other-resolution');
  if (dataTypeSelect) {
    
    dataTypeSelect.addEventListener('change', function() {
      setDataType(this.value);
      if (dataTypeOtherContainer) {
        dataTypeOtherContainer.style.display = this.value === 'other' ? 'block' : 'none';
      }
      
      // Show/hide entire spatial resolution section based on data type selection
      if (spatialResolutionContainer) {
        spatialResolutionContainer.style.display = this.value ? 'block' : 'none';
      }
      
      // Hide all resolution inputs first
      [rsPixelResolution, gisGridResolution, mlResolution, predictionResolution, surveyAggregation, otherResolution].forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      // Show appropriate resolution input based on data type
      switch(this.value) {
        case 'remote-sensing':
          if (rsPixelResolution) rsPixelResolution.style.display = 'block';
          console.log('Showing Remote Sensing pixel resolution input');
          break;
        case 'gis':
          if (gisGridResolution) gisGridResolution.style.display = 'block';
          console.log('Showing GIS grid resolution input');
          break;
        case 'model-ml':
          if (mlResolution) mlResolution.style.display = 'block';
          console.log('Showing Model/ML resolution input');
          break;
        case 'prediction':
          if (predictionResolution) predictionResolution.style.display = 'block';
          console.log('Showing Prediction resolution input');
          break;
        case 'survey':
          if (surveyAggregation) surveyAggregation.style.display = 'block';
          console.log('Showing Survey aggregation level input');
          break;
        case 'other':
          if (otherResolution) otherResolution.style.display = 'block';
          console.log('Showing free-form resolution description input');
          break;
      }
      
      // Broadcast data-type change to all sections via custom event
      window.dispatchEvent(new CustomEvent('dataTypeChanged', { detail: { dataType: this.value } }));
    });
    if (dataTypeSelect.value) dataTypeSelect.dispatchEvent(new Event('change'));
  }
  
  // ---- SAVE SPATIAL RESOLUTION INPUTS ----
  const resolutionInputs = [
    { id: 'optimumPixelResolution', key: 'optimumPixelResolution' },
    { id: 'optimumGISResolution', key: 'optimumGISResolution' },
    { id: 'optimumMLResolution', key: 'optimumMLResolution' },
    { id: 'optimumPredictionSpatialResolution', key: 'optimumPredictionSpatialResolution' },
    { id: 'optimumPredictionTemporalResolution', key: 'optimumPredictionTemporalResolution' },
    { id: 'optimumSurveyAggregation', key: 'optimumSurveyAggregation' },
    { id: 'optimumOtherResolution', key: 'optimumOtherResolution' }
  ];
  
  resolutionInputs.forEach(({ id, key }) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', function() {
        saveFormValue(key, this.value);
        // Also save a unified aggregation level if applicable
        if (key === 'optimumSurveyAggregation' || key === 'optimumPredictionSpatialResolution') {
          saveToDatabase('optimumAggregationLevel', this.value);
        }
      });
    }
  });

  // ---- SAVE SPATIAL RESOLUTION UNITS ----
  const unitDropdowns = [
    { id: 'optimumPixelResolutionUnit', key: 'optimumPixelResolutionUnit' },
    { id: 'optimumGISResolutionUnit', key: 'optimumGISResolutionUnit' },
    { id: 'optimumMLResolutionUnit', key: 'optimumMLResolutionUnit' },
    { id: 'optimumPredictionSpatialResolutionUnit', key: 'optimumPredictionSpatialResolutionUnit' }
  ];
  
  unitDropdowns.forEach(({ id, key }) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', function() {
        saveFormValue(key, this.value);
      });
    }
  });

  // ==========================================================
  // AREA OF INTEREST (AOI) - TYPE SWITCH (dropdown/coords/upload)
  // ==========================================================
  const aoiType = document.getElementById('aoiType');
  const aoiDropdownContainer = document.getElementById('aoi-dropdown');
  const aoiCoordinates = document.getElementById('aoi-coordinates');
  const aoiUpload = document.getElementById('aoi-upload');
  
  if (aoiType) {
    aoiType.addEventListener('change', function() {
      saveToDatabase('aoiType', this.value);
      
      [aoiDropdownContainer, aoiCoordinates, aoiUpload].forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      if (this.value === 'dropdown' && aoiDropdownContainer) aoiDropdownContainer.style.display = 'block';
      else if (this.value === 'coordinates' && aoiCoordinates) aoiCoordinates.style.display = 'block';
      else if (this.value === 'upload' && aoiUpload) aoiUpload.style.display = 'block';
    });
    aoiType.dispatchEvent(new Event('change'));
  }

  // ==========================================================
  // AOI SELECT2-STYLE DROPDOWN
  // ==========================================================

// =========================
// Load ISO-3166 Dataset from JSON
// =========================

let ISO_LOCATIONS = [];

// Load countries data from JSON
fetch('/assets/data/countries.json')
  .then(response => response.json())
  .then(data => {
    ISO_LOCATIONS = data;
  })
  .catch(error => console.error('Error loading ISO countries:', error));


  (function setupAoiSelect2() {
    const nativeSelect = document.getElementById('aoiDropdown'); // your big ISO select
    if (!nativeSelect) return;

    // Optional: hide any old search input if it exists
    const oldSearchInput = document.getElementById('aoiSearchInput');
    const aoiOptions = ISO_LOCATIONS;


    // Hide the native select; we'll keep it for storing the real value
    nativeSelect.style.display = 'none';

    // Create Select2-style structure:
    // <div class="custom-select2">
    //   <div class="select2-display">...</div>
    //   <div class="select2-dropdown">
    //     <input class="select2-search" />
    //     <ul class="select2-results"></ul>
    //   </div>
    // </div>

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select2';

    const display = document.createElement('div');
    display.className = 'select2-display';
    display.id = 'aoiSelect2Display';
    display.textContent = 'Select location…';

    const dropdown = document.createElement('div');
    dropdown.className = 'select2-dropdown';
    dropdown.id = 'aoiSelect2Dropdown';

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'select2-search';
    search.id = 'aoiSelect2Search';
    search.placeholder = 'Search…';

    const results = document.createElement('ul');
    results.className = 'select2-results';
    results.id = 'aoiSelect2Results';

    dropdown.appendChild(search);
    dropdown.appendChild(results);
    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);

    // Insert wrapper right after the native select
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect.nextSibling);

    // If you have a hidden input to store final value, wire it
    const hiddenValueInput = document.getElementById('aoiLocationValue');

    function renderResults(filterText = '') {
      const f = filterText.toLowerCase();
      const filtered = aoiOptions.filter(opt =>
        opt.label.toLowerCase().includes(f) || opt.value.toLowerCase().includes(f)
      );

      results.innerHTML = filtered
        .map(opt => `<li data-value="${opt.value}">${opt.label}</li>`)
        .join('');

      results.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          const val = li.getAttribute('data-value');
          const label = li.textContent;

          // Update UI
          display.textContent = label;

          // Update underlying <select>
          nativeSelect.value = val;

          // Update hidden input (if exists)
          if (hiddenValueInput) hiddenValueInput.value = val;

          // Persist
          saveFormValue('aoiLocation', val);

          // Close dropdown
          dropdown.style.display = 'none';
        });
      });
    }

    // Toggle dropdown on display click
    display.addEventListener('click', () => {
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';

      search.value = '';
      renderResults('');
      search.focus();
    });

    // Search with debounce
    search.addEventListener('input', debounce(() => {
      renderResults(search.value);
    }, 150));

    // Close when clicking outside
    document.addEventListener('click', evt => {
      if (!wrapper.contains(evt.target)) {
        dropdown.style.display = 'none';
      }
    });
  })();

  // ---- AOI COORDINATES ----
  ['minLat', 'maxLat', 'minLon', 'maxLon'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('change', function() {
        saveToDatabase(id, this.value);
      });
    }
  });

  // ---- AOI FILE UPLOAD ----
  const aoiFile = document.getElementById('aoiFile');
  if (aoiFile) {
    aoiFile.addEventListener('change', function() {
      if (this.files.length > 0) {
        saveToDatabase('aoiFileName', this.files[0].name);
      }
    });
  }
});
