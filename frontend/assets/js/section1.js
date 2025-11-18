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

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { setDataType, setEvaluationType, setProcessingLevel, getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';


document.addEventListener('DOMContentLoaded', function () {
  initializeHighlighting();
  initializeTooltips();



  // ---- DATA PROCESSING LEVEL (Primary vs Products) 
  const dataProcessingLevel = document.getElementById('dataprocessinglevel');
  if (dataProcessingLevel) {
    dataProcessingLevel.addEventListener('change', function() {
      setProcessingLevel(this.value);
      applyConformanceVisibility(this.value);
      updateNavigationButtons();
    });
    dataProcessingLevel.dispatchEvent(new Event('change'));
  }

  // ---- EVALUATION TYPE (Use-case vs General)
  const evaluationType = document.getElementById('evaluationType');
  const useCaseSection = document.getElementById('use-case-section');
  
  if (evaluationType) {
    evaluationType.addEventListener('change', function() {
      setEvaluationType(this.value);
      
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
        sessionStorage.setItem(key, this.value);
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
        sessionStorage.setItem(key, this.value);
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
      sessionStorage.setItem('aoiType', this.value);
      
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
  // AOI DROPDOWN - Simple Implementation
  // ==========================================================
  
  const aoiSelect = document.getElementById('aoiDropdown');
  console.log('aoiSelect element:', aoiSelect);
  
  if (aoiSelect) {
    // Load countries.json and populate dropdown
    fetch('../assets/data/countries.json')
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Data loaded:', data);
        
        // Flatten countries array
        let allCountries = [];
        
        // Add global options
        if (data.global) {
          allCountries.push(...data.global);
        }
        
        // Add countries from all continents
        if (data.continents) {
          data.continents.forEach(continent => {
            if (continent.countries) {
              allCountries.push(...continent.countries);
            }
          });
        }
        
        console.log('Total countries to add:', allCountries.length);
        
        // Populate dropdown
        allCountries.forEach(country => {
          const option = document.createElement('option');
          option.value = country.value;
          option.textContent = country.label;
          aoiSelect.appendChild(option);
        });
        
        console.log('Dropdown populated with', allCountries.length, 'items');
      })
      .catch(error => console.error('Error loading countries:', error));
    
    // Save selected value
    aoiSelect.addEventListener('change', function() {
      console.log('Selected:', this.value);
      sessionStorage.setItem('aoiLocation', this.value);
    });
  } else {
    console.warn('aoiDropdown element not found in HTML');
  }

  // ---- AOI COORDINATES ----
  ['minLat', 'maxLat', 'minLon', 'maxLon'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('change', function() {
        sessionStorage.setItem(id, this.value);
      });
    }
  });

  // ---- AOI FILE UPLOAD ----
  const aoiFile = document.getElementById('aoiFile');
  if (aoiFile) {
    aoiFile.addEventListener('change', function() {
      if (this.files.length > 0) {
        sessionStorage.setItem('aoiFileName', this.files[0].name);
      }
    });
  }
});
