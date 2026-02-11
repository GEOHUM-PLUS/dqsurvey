import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { setDataType, setEvaluationType, setProcessingLevel, getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';
import { CONFIG } from './core/config.js';  // adjust path relative to section1.js
window.__desiredAOILabel = "";

const fireChange = (id) => {
  const el = document.getElementById(id);
  if (el) el.dispatchEvent(new Event('change', { bubbles: true }));
};

function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function () {
  initializeHighlighting();
  initializeTooltips();
  initializePage('section1');


  // ---- DATA PROCESSING LEVEL (Primary vs Products) 
  const dataProcessingLevel = document.getElementById('dataprocessinglevel');
  if (dataProcessingLevel) {
    dataProcessingLevel.addEventListener('change', function () {
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
    evaluationType.addEventListener('change', function () {
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

  // ---- EVALUATOR NAME ----
  const evaluatorNameInput = document.getElementById('evaluatorName');
  if (evaluatorNameInput) {
    evaluatorNameInput.addEventListener('change', function () {
      sessionStorage.setItem('evaluatorName', this.value);
      window.dispatchEvent(new CustomEvent('evaluatorNameChanged', { detail: { evaluatorName: this.value } }));
    });
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

    dataTypeSelect.addEventListener('change', function () {
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
      switch (this.value) {
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
      // ✅ CLEAR irrelevant resolution fields when switching data type
const clear = (id, isSelect = false) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (isSelect) el.selectedIndex = 0;
  else el.value = '';
};

if (this.value === 'remote-sensing') {
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
  clear('optimumOtherResolution');
}

if (this.value === 'gis') {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
  clear('optimumOtherResolution');
}

if (this.value === 'model-ml') {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
  clear('optimumOtherResolution');
}

if (this.value === 'prediction') {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
  clear('optimumOtherResolution');
}

if (this.value === 'survey') {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumOtherResolution');
}

if (this.value === 'other') {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
}

// if user clears dataType entirely
if (!this.value) {
  clear('optimumPixelResolution');
  clear('optimumPixelResolutionUnit', true);
  clear('optimumGISResolution');
  clear('optimumGISResolutionUnit', true);
  clear('optimumMLResolution');
  clear('optimumMLResolutionUnit', true);
  clear('optimumPredictionSpatialResolution');
  clear('optimumPredictionSpatialResolutionUnit', true);
  clear('optimumPredictionTemporalResolution', true);
  clear('optimumSurveyAggregation1', true);
  clear('optimumSurveyAggregation2', true);
  clear('optimumOtherResolution');
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
      element.addEventListener('change', function () {
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
      element.addEventListener('change', function () {
        sessionStorage.setItem(key, this.value);
      });
    }
  });

  // AREA OF INTEREST (AOI) - TYPE SWITCH (dropdown/coords/upload)
  const aoiType = document.getElementById('aoiType');
  const aoiDropdownContainer = document.getElementById('aoi-dropdown');
  const aoiCoordinates = document.getElementById('aoi-coordinates');
  const aoiUpload = document.getElementById('aoi-upload');

  // if (aoiType) {
  //   aoiType.addEventListener('change', function () {
  //     sessionStorage.setItem('aoiType', this.value);

  //     [aoiDropdownContainer, aoiCoordinates, aoiUpload].forEach(el => {
  //       if (el) el.style.display = 'none';
  //     });

  //     if (this.value === 'dropdown' && aoiDropdownContainer) aoiDropdownContainer.style.display = 'block';
  //     else if (this.value === 'coordinates' && aoiCoordinates) aoiCoordinates.style.display = 'block';
  //     else if (this.value === 'upload' && aoiUpload) aoiUpload.style.display = 'block';
  //   });
  //   aoiType.dispatchEvent(new Event('change'));
  // }
if (aoiType) {
  aoiType.addEventListener('change', function () {

    sessionStorage.setItem('aoiType', this.value);

    // Hide all
    [aoiDropdownContainer, aoiCoordinates, aoiUpload].forEach(el => {
      if (el) el.style.display = 'none';
    });

    // Show selected panel
    if (this.value === 'dropdown' && aoiDropdownContainer) {
      aoiDropdownContainer.style.display = 'block';
    } 
    else if (this.value === 'coordinates' && aoiCoordinates) {
      aoiCoordinates.style.display = 'block';
    } 
    else if (this.value === 'upload' && aoiUpload) {
      aoiUpload.style.display = 'block';
    }

    // ✅ CLEAR irrelevant fields when switching type

    if (this.value === 'dropdown') {
      ['minLat','maxLat','minLon','maxLon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      sessionStorage.removeItem('aoiFileName');
    }

    if (this.value === 'coordinates') {
      const dd = document.getElementById('aoiDropdown');
      if (dd) dd.selectedIndex = 0;
      sessionStorage.removeItem('aoiFileName');
    }

    if (this.value === 'upload') {
      const dd = document.getElementById('aoiDropdown');
      if (dd) dd.selectedIndex = 0;

      ['minLat','maxLat','minLon','maxLon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }

  });

  aoiType.dispatchEvent(new Event('change'));
}


  // AOI DROPDOWN - Simple Implementation
  const aoiSelect = document.getElementById('aoiDropdown');
  console.log('aoiSelect element:', aoiSelect.value);

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
        // ✅ Apply selected country AFTER options are added (edit mode)
        if (window.__desiredAOILabel) {
          const desired = window.__desiredAOILabel;
          const aoiSelect = document.getElementById("aoiDropdown");

          for (let i = 0; i < aoiSelect.options.length; i++) {
            if (aoiSelect.options[i].text === desired) {
              aoiSelect.selectedIndex = i;
              // trigger any listeners / session save
              aoiSelect.dispatchEvent(new Event("change", { bubbles: true }));
              break;
            }
          }
        }

      })
      .catch(error => console.error('Error loading countries:', error));

    // Save selected value
    aoiSelect.addEventListener('change', function () {
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
      field.addEventListener('change', function () {
        sessionStorage.setItem(id, this.value);
      });
    }
  });

  // ---- AOI FILE UPLOAD ----
  const aoiFile = document.getElementById('aoiFile');
  if (aoiFile) {
    aoiFile.addEventListener('change', function () {
      if (this.files.length > 0) {
        sessionStorage.setItem('aoiFileName', this.files[0].name);
      }
    });
  }
});


function getUnitValue(id) {
  const el = document.getElementById(id);
  return el && el.value ? el.value : null;
}

// =============SECTION 1 CLEAN UNIFIED FRONTEND  CREATE + EDIT SUPPORT=====================================

let isEditMode = false;
let section1Id = sessionStorage.getItem("section1_id");
let step1Flag = parseInt(sessionStorage.getItem("step1") || "0");
console.log("Loaded session values - section1_id:", section1Id, "step1:", step1Flag);
// Detect Mode
if (section1Id && step1Flag === 1) {
  isEditMode = true;
}
console.log("Section1 Mode:", isEditMode ? "EDIT" : "CREATE");

document.addEventListener('DOMContentLoaded', async function () {

  const nextBtn = document.getElementById('Initial-info');
  if (!nextBtn) return;

  console.log("Section1 Mode in button:", isEditMode ? "EDIT" : "CREATE", section1Id,);

  // ✅ REFILL FIELDS IF EDIT MODE
  if (isEditMode && section1Id) {
    try {
      const res = await fetch(`http://localhost:8020/section1/${section1Id}`);
      if (!res.ok) throw new Error('Failed to fetch Section 1 data');
      const data = await res.json();
      console.log('data:', data);
      // Map each field to the corresponding input Map backend fields to frontend input IDs
      document.getElementById('datasetTitle').value = data.dataset_title || '';
      document.getElementById('evaluatorName').value = data.evaluator_name || '';
      document.getElementById('evaluatorOrg').value = data.evaluator_org || '';
      document.getElementById('dataprocessinglevel').value = data.data_processing_level || '';
      document.getElementById('dataType').value = data.data_type || '';
      document.getElementById('dataTypeOtherInput').value = data.data_type_other || '';
      document.getElementById('evaluationType').value = data.evaluation_type || '';
      document.getElementById('useCaseDescription').value = data.use_case_description || '';
      document.getElementById('optimumDataCollection').value = data.optimum_data_collection || '';

      document.getElementById('optimumPixelResolution').value = data.optimum_pixel_resolution || '';
      document.getElementById('optimumPixelResolutionUnit').value = data.optimum_pixel_resolution_unit || '';
      document.getElementById('optimumGISResolution').value = data.optimum_gis_resolution || '';
      document.getElementById('optimumGISResolutionUnit').value = data.optimum_gis_resolution_unit || '';
      document.getElementById('optimumMLResolution').value = data.optimum_ml_resolution || '';
      // document.getElementById('optimumMLUnit').value = data.optimum_ml_unit || '';
      document.getElementById('optimumMLResolutionUnit').value = data.optimum_ml_unit || '';

      document.getElementById('optimumPredictionSpatialResolution').value = data.optimum_prediction_spatial_resolution || '';
      document.getElementById('optimumPredictionSpatialResolutionUnit').value = data.optimum_prediction_spatial_resolution_unit || '';
      document.getElementById('optimumPredictionTemporalResolution').value = data.optimum_prediction_temporal_resolution || '';
      document.getElementById('optimumSurveyAggregation1').value = data.optimum_survey_aggregation1 || '';
      document.getElementById('optimumSurveyAggregation2').value = data.optimum_survey_aggregation2 || '';
      document.getElementById('optimumOtherResolution').value = data.optimum_other_resolution || '';

      document.getElementById('aoiType').value = data.aoi_type || '';


      document.getElementById('minLat').value = data.min_lat || '';
      document.getElementById('maxLat').value = data.max_lat || '';
      document.getElementById('minLon').value = data.min_lon || '';
      document.getElementById('maxLon').value = data.max_lon || '';

      document.getElementById('otherRequirements').value = data.other_requirements || '';

      // ✅ NOW sync UI exactly like user left it
      syncSection1UIFromValues();
      applyEvaluationTypeUI();
      fireChange('evaluationType');
      fireChange('dataType');
      fireChange('aoiType');

      // const desired = sessionStorage.setItem("desiredAOILabel", data.aoidropdown || "");
      const desired = data.aoi_dropdown || "";

      window.__desiredAOILabel = data.aoi_dropdown || "";
      sessionStorage.setItem("desiredAOILabel", window.__desiredAOILabel);

      if (desired) {
        const aoiSelect = document.getElementById("aoiDropdown");
        for (let i = 0; i < aoiSelect.options.length; i++) {
          if (aoiSelect.options[i].text === desired) {
            aoiSelect.selectedIndex = i;
            break;
          }
        }
        // ✅ sync again after dropdown applied
        syncSection1UIFromValues();
        // after setting values in EDIT mode:
        applyEvaluationTypeUI();
      }

      console.log('✅ Section 1 form refilled in EDIT mode.');
    } catch (err) {
      console.error('Error loading Section 1 for edit:', err);
    }
  }

  nextBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    // Gather form data
    const payload = {
      datasetTitle: document.getElementById('datasetTitle')?.value || null,
      evaluatorName: document.getElementById('evaluatorName')?.value || null,
      evaluatorOrg: document.getElementById('evaluatorOrg')?.value || null,
      dataProcessingLevel: document.getElementById('dataprocessinglevel')?.value || null,
      dataType: document.getElementById('dataType')?.value || null,
      dataTypeOther: document.getElementById('dataTypeOtherInput')?.value || null,
      evaluationType: document.getElementById('evaluationType')?.value || null,
      useCaseDescription: document.getElementById('useCaseDescription')?.value || null,
      optimumDataCollection: document.getElementById('optimumDataCollection')?.value || null,

      optimumPixelResolution: document.getElementById('optimumPixelResolution')?.value || null,
      optimumPixelResolutionUnit: document.getElementById('optimumPixelResolutionUnit')?.value || null,

      optimumGISResolution: document.getElementById('optimumGISResolution')?.value || null,
      optimumGISResolutionUnit: document.getElementById('optimumGISResolutionUnit')?.value || null,

      optimumMLResolution: document.getElementById('optimumMLResolution')?.value || null,
      // optimumMLUnit: document.getElementById('optimumMLUnit')?.value || null,
      optimumMLUnit: document.getElementById('optimumMLResolutionUnit')?.value || null,


      optimumPredictionSpatialResolution: document.getElementById('optimumPredictionSpatialResolution')?.value || null,
      optimumPredictionSpatialResolutionUnit: document.getElementById('optimumPredictionSpatialResolutionUnit')?.value || null,
      optimumPredictionTemporalResolution: document.getElementById('optimumPredictionTemporalResolution')?.value || null,

      optimumSurveyAggregation1: document.getElementById('optimumSurveyAggregation1')?.value || null,
      optimumSurveyAggregation2: document.getElementById('optimumSurveyAggregation2')?.value || null,

      optimumOtherResolution: document.getElementById('optimumOtherResolution')?.value || null,

      aoiType: document.getElementById('aoiType')?.value || null,
      // aoiDropdown: document.getElementById('aoiDropdown')?.value || null,
      aoiDropdown: document.getElementById('aoiDropdown')?.selectedOptions[0]?.text || null,

      minLat: document.getElementById('minLat')?.value || null,
      maxLat: document.getElementById('maxLat')?.value || null,
      minLon: document.getElementById('minLon')?.value || null,
      maxLon: document.getElementById('maxLon')?.value || null,

      aoiFileName: sessionStorage.getItem('aoiFileName') || null,

      otherRequirements: document.getElementById('otherRequirements')?.value || null,
      step1: 0

    };

    try {
      // const res = await fetch('http://localhost:8020/section1/section1', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
const url = (isEditMode && section1Id)
  ? `http://localhost:8020/section1/section1/${section1Id}`
  : `http://localhost:8020/section1/section1`;

const method = (isEditMode && section1Id) ? 'PUT' : 'POST';

const res = await fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

      const data = await res.json();

      if (data.success) {
        console.log('Section 1 saved, ID:', data.id);

        // 🔑 SAVE ID FOR NEXT SECTIONS
        sessionStorage.setItem('section1_id', data.id);

        // (optional but useful)
        sessionStorage.setItem('evaluatorName', payload.evaluatorName);
        sessionStorage.setItem('dataType', payload.dataType);

        // Redirect to next section
        window.location.href = './section2.html';
      } else {
        console.error('Save failed:', data.error);
        alert('Failed to save Section 1: ' + data.error);
      }
    } catch (err) {
      console.error('Error submitting Section 1:', err);
      alert('Error submitting Section 1: ' + err.message);
    }
  });
});
// ===============================refills interaction logic for edit mode===============================
// ✅ direct UI apply
fireChange('evaluationType');          // ✅ if anything else depends on it

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Missing element: #${id}`);
    return;
  }
  el.value = value ?? '';
}

function syncSection1UIFromValues() {
  // 1) Evaluation type => Use-case section show/hide
  const evaluationType = document.getElementById("evaluationType");
  const useCaseSection = document.getElementById("use-case-section");
  if (evaluationType && useCaseSection) {
    const isUseCase = evaluationType.value === "use-case-adequacy";
    useCaseSection.style.display = isUseCase ? "block" : "none";

    document.querySelectorAll(".use-case-only").forEach(el => {
      el.style.display = isUseCase ? "block" : "none";
    });

    document.querySelectorAll(".general-design-only").forEach(el => {
      el.style.display = isUseCase ? "none" : "block";
    });
  }

  // 2) Data type => Resolution blocks show/hide
  const dataTypeSelect = document.getElementById("dataType");
  const dataTypeOtherContainer = document.getElementById("datatype-other-container");

  const rsPixelResolution = document.getElementById("rs-pixel-resolution");
  const gisGridResolution = document.getElementById("gis-grid-resolution");
  const mlResolution = document.getElementById("ml-resolution");
  const predictionResolution = document.getElementById("prediction-resolution");
  const surveyAggregation = document.getElementById("survey-aggregation");
  const otherResolution = document.getElementById("other-resolution");

  // parent label div
  const spatialResolutionContainerEl = document.getElementById("spatial-resolution-container");
  const spatialResolutionContainer = spatialResolutionContainerEl ? spatialResolutionContainerEl.parentElement : null;

  if (dataTypeSelect) {
    const val = dataTypeSelect.value;

    if (dataTypeOtherContainer) {
      dataTypeOtherContainer.style.display = val === "other" ? "block" : "none";
    }

    if (spatialResolutionContainer) {
      spatialResolutionContainer.style.display = val ? "block" : "none";
    }

    // hide all
    [rsPixelResolution, gisGridResolution, mlResolution, predictionResolution, surveyAggregation, otherResolution]
      .forEach(el => { if (el) el.style.display = "none"; });

    // show selected
    if (val === "remote-sensing" && rsPixelResolution) rsPixelResolution.style.display = "block";
    if (val === "gis" && gisGridResolution) gisGridResolution.style.display = "block";
    if (val === "model-ml" && mlResolution) mlResolution.style.display = "block";
    if (val === "prediction" && predictionResolution) predictionResolution.style.display = "block";
    if (val === "survey" && surveyAggregation) surveyAggregation.style.display = "block";
    if (val === "other" && otherResolution) otherResolution.style.display = "block";
  }

  // 3) AOI type => which AOI panel show/hide
  const aoiType = document.getElementById("aoiType");
  const aoiDropdownContainer = document.getElementById("aoi-dropdown");
  const aoiCoordinates = document.getElementById("aoi-coordinates");
  const aoiUpload = document.getElementById("aoi-upload");

  if (aoiType) {
    const t = aoiType.value;

    [aoiDropdownContainer, aoiCoordinates, aoiUpload].forEach(el => {
      if (el) el.style.display = "none";
    });

    if (t === "dropdown" && aoiDropdownContainer) aoiDropdownContainer.style.display = "block";
    if (t === "coordinates" && aoiCoordinates) aoiCoordinates.style.display = "block";
    if (t === "upload" && aoiUpload) aoiUpload.style.display = "block";
  }
}

function applyEvaluationTypeUI() {
  const evaluationType = document.getElementById('evaluationType');
  const useCaseSection = document.getElementById('use-case-section');
  if (!evaluationType || !useCaseSection) return;

  const isUseCase = evaluationType.value === 'use-case-adequacy';
  useCaseSection.style.display = isUseCase ? 'block' : 'none';

  document.querySelectorAll('.use-case-only').forEach(el => {
    el.style.display = isUseCase ? 'block' : 'none';
  });

  document.querySelectorAll('.general-design-only').forEach(el => {
    el.style.display = isUseCase ? 'none' : 'block';
  });
}


