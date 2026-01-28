
import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { setDataType, setEvaluationType, setProcessingLevel, getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';
import { CONFIG } from './core/config.js';  // adjust path relative to section1.js

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

  // AREA OF INTEREST (AOI) - TYPE SWITCH (dropdown/coords/upload)
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
 // AOI DROPDOWN - Simple Implementation
  const aoiSelect = document.getElementById('aoiDropdown');
  // console.log('aoiSelect element:', aoiSelect);
  
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

// function getUnitValue(id) {
//     const el = document.getElementById(id);

//     if (!el) return null;           // dropdown doesn't exist → NULL
//     if (!el.value || el.value === "") return null;  // user didn't select anything → NULL

//     return el.value;  // return selected unit
// }


// document.getElementById('Initial-info').addEventListener('click', function(e) {
//     e.preventDefault(); // prevent default link

//     // Gather data from form
//     const data = {
//         datasetTitle: document.getElementById('datasetTitle').value,
//         evaluatorName: document.getElementById('evaluatorName').value,
//         affiliation: document.getElementById('evaluatorOrg').value,
//         dataProcessingLevel: document.getElementById('dataprocessinglevel').value,
//         dataType: document.getElementById('dataType').value,
//         dataTypeOther: document.getElementById('dataTypeOtherInput')?.value || '',
//         evaluationType: document.getElementById('evaluationType').value,
//         useCaseDescription: document.getElementById('useCaseDescription')?.value || '',
//         optimumDataCollection: document.getElementById('optimumDataCollection')?.value || null,
//         optimumPixelResolution: document.getElementById('optimumPixelResolution')?.value || null,
//         optimumPixelResolutionUnit: getUnitValue('optimumPixelResolutionUnit'),
//         optimumGISResolution: document.getElementById('optimumGISResolution')?.value || null,
//         optimumGISResolutionUnit: getUnitValue('optimumGISResolutionUnit'),
//         optimumMLResolution: document.getElementById('optimumMLResolution')?.value || null,
//         optimumMLResolutionUnit: getUnitValue('optimumMLResolutionUnit'),
//         optimumPredictionSpatialResolution: document.getElementById('optimumPredictionSpatialResolution')?.value || null,
//         optimumPredictionSpatialResolutionUnit: getUnitValue('optimumPredictionSpatialResolutionUnit'),
//         optimumPredictionTemporalResolution: document.getElementById('optimumPredictionTemporalResolution')?.value || '',
//         optimumSurveyAggregationPrimary: document.getElementById('optimumSurveyAggregation1')?.value || '',
//         optimumSurveyAggregationSecondary: document.getElementById('optimumSurveyAggregation2')?.value || '',
//         optimumOtherResolution: document.getElementById('optimumOtherResolution')?.value || '',
//         aoiType: document.getElementById('aoiType')?.value || '',
//         aoiLocation: document.getElementById('aoiDropdown')?.value || '',
//         minLat: document.getElementById('minLat')?.value || null,
//         maxLat: document.getElementById('maxLat')?.value || null,
//         minLon: document.getElementById('minLon')?.value || null,
//         maxLon: document.getElementById('maxLon')?.value || null,
//         aoiFileName: document.getElementById('aoiFile')?.files[0]?.name || '',
//         otherRequirements: document.getElementById('otherRequirements')?.value || '',
//     };

//     fetch('http://localhost:8020/section1', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//     })
//     .then(res => res.json())
 
//     // .then(response => {
//     //     console.log(response);
//     //     window.location.href = 'section2.html';
//     // })
//     .then(response => {
//     console.log("Server Response:", response);

//     // STORE SECTION1 ID IN LOCAL STORAGE
//     if (response.id) {
//         localStorage.setItem("section1_id", response.id);
//         console.log("Saved Section 1 ID:", response.id);
//     }

//     window.location.href = 'section2.html';
// })

//     .catch(err => {
//         console.error('Error saving Section1 data:', err);
//         alert('Error saving data. Please try again.');
//     });
// });
function getUnitValue(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value : null;
}

// document.addEventListener('DOMContentLoaded', function () {
//   debugger;
//     initializeHighlighting();
//     initializeTooltips();

//     const saveBtn = document.getElementById('Initial-info');
//     if (!saveBtn) return;

//     saveBtn.addEventListener('click', async (e) => {
//         e.preventDefault();

//         // Validate required fields
//         const datasetTitle = document.getElementById('datasetTitle')?.value.trim();
//         const dataProcessing = document.getElementById('dataprocessinglevel')?.value.trim();
//         const dataType = document.getElementById('dataType')?.value.trim();
//         const evaluationType = document.getElementById('evaluationType')?.value.trim();

//         if (!datasetTitle || !dataProcessing || !dataType || !evaluationType) {
//             alert("Please fill all required fields (*) before proceeding.");
//             return;
//         }

//         // Gather payload
//         const payload = {
//             datasetTitle,
//             evaluatorName: document.getElementById('evaluatorName')?.value || '',
//             affiliation: document.getElementById('evaluatorOrg')?.value || '',
//             dataProcessingLevel: dataProcessing,
//             dataType,
//             dataTypeOther: dataType === 'other' ? document.getElementById('dataTypeOtherInput')?.value || '' : null,
//             evaluationType,
//             useCaseDescription: evaluationType === 'use-case-adequacy' ? document.getElementById('useCaseDescription')?.value || '' : null,
//             optimumDataCollection: document.getElementById('optimumDataCollection')?.value || null,
//             optimumPixelResolution: document.getElementById('optimumPixelResolution')?.value || null,
//             optimumPixelResolutionUnit: getUnitValue('optimumPixelResolutionUnit'),
//             optimumGISResolution: document.getElementById('optimumGISResolution')?.value || null,
//             optimumGISResolutionUnit: getUnitValue('optimumGISResolutionUnit'),
//             optimumMLResolution: document.getElementById('optimumMLResolution')?.value || null,
//             optimumMLResolutionUnit: getUnitValue('optimumMLResolutionUnit'),
//             optimumPredictionSpatialResolution: document.getElementById('optimumPredictionSpatialResolution')?.value || null,
//             optimumPredictionSpatialResolutionUnit: getUnitValue('optimumPredictionSpatialResolutionUnit'),
//             optimumPredictionTemporalResolution: document.getElementById('optimumPredictionTemporalResolution')?.value || null,
//             optimumSurveyAggregationPrimary: document.getElementById('optimumSurveyAggregation1')?.value || null,
//             optimumSurveyAggregationSecondary: document.getElementById('optimumSurveyAggregation2')?.value || null,
//             optimumOtherResolution: document.getElementById('optimumOtherResolution')?.value || null,
//             aoiType: document.getElementById('aoiType')?.value || null,
//             aoiLocation: document.getElementById('aoiDropdown')?.value || null,
//             minLat: document.getElementById('minLat')?.value || null,
//             maxLat: document.getElementById('maxLat')?.value || null,
//             minLon: document.getElementById('minLon')?.value || null,
//             maxLon: document.getElementById('maxLon')?.value || null,
//             aoiFileName: document.getElementById('aoiFile')?.files[0]?.name || null,
//             otherRequirements: document.getElementById('otherRequirements')?.value || null
//         };

//         console.log("🚀 Sending Section1 payload:", payload);

//         try {
//             const response = await fetch("http://localhost:8020/section1", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 console.error("❌ Error saving Section1:", result);
//                 alert("Failed to save Section1: " + result.message);
//                 return;
//             }

//             console.log("✅ Section1 saved:", result);

//             // Save Section1 ID for later
//             if (result.id) {
//                 localStorage.setItem("section1_id", result.id);
//             }

//             // Redirect to Section2
//             window.location.href = "section2.html";

//         } catch (err) {
//             console.error("Network error:", err);
//             alert("Network error while saving Section1. Check backend.");
//         }
//     });
// });
// document.getElementById('Initial-info')?.addEventListener('click', function (e) {
  
//   e.preventDefault(); // prevent default <a> navigation

//   // Validate required fields
//   const datasetTitle = document.getElementById('datasetTitle').value.trim();
//   const dataProcessing = document.getElementById('dataprocessinglevel').value.trim();
//   const dataType = document.getElementById('dataType').value.trim();
//   const evaluationType = document.getElementById('evaluationType').value.trim();

//   if (!datasetTitle || !dataProcessing || !dataType || !evaluationType) {
//     alert("Please fill all required fields (*) before proceeding.");
//     return;
//   }

//   // BUILD SAVED DATA OBJECT
//   const section1Data = {
//     basic: {

//       datasetTitle,
//       evaluatorName: document.getElementById('evaluatorName').value || "",
//       evaluatorOrg: document.getElementById('evaluatorOrg').value || "",
//       dataProcessing,
//       dataType,
//       dataTypeOther: dataType === "other"
//         ? document.getElementById('dataTypeOtherInput').value || ""
//         : null,
//       evaluationType
//     },

//     useCase:
//       evaluationType === "use-case-adequacy"
//         ? {
//             description: document.getElementById('useCaseDescription').value || "",
//             optimumDataCollection: document.getElementById('optimumDataCollection').value || "",
//             otherRequirements: document.getElementById('otherRequirements').value || "",
//           }
//         : null
//   };

//   // SAVE TO LOCAL STORAGE USING YOUR datamanager
//   DataManager.save("section1", null, section1Data);

//   // NAVIGATE TO NEXT PAGE
//   // window.location.href = "section2.html";
// });



document.addEventListener('DOMContentLoaded', function () {
    initializeHighlighting();
    initializeTooltips();
    initializePage('section1');

    const saveBtn = document.getElementById('Initial-info');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // --- VALIDATE REQUIRED FIELDS ---
        const datasetTitle = document.getElementById('datasetTitle')?.value.trim();
        const dataProcessing = document.getElementById('dataprocessinglevel')?.value.trim();
        const dataType = document.getElementById('dataType')?.value.trim();
        const evaluationType = document.getElementById('evaluationType')?.value.trim();

        if (!datasetTitle || !dataProcessing || !dataType || !evaluationType) {
            alert("Please fill all required fields (*) before proceeding.");
            return;
        }

        // --- BUILD PAYLOAD FOR API ---
        const payload = {
            datasetTitle,
            evaluatorName: document.getElementById('evaluatorName')?.value || '',
            affiliation: document.getElementById('evaluatorOrg')?.value || '',
            dataProcessingLevel: dataProcessing,
            dataType,
            dataTypeOther: dataType === 'other' ? document.getElementById('dataTypeOtherInput')?.value || '' : null,
            evaluationType,
            useCaseDescription: evaluationType === 'use-case-adequacy' ? document.getElementById('useCaseDescription')?.value || '' : null,
            optimumDataCollection: document.getElementById('optimumDataCollection')?.value || null,
            optimumPixelResolution: document.getElementById('optimumPixelResolution')?.value || null,
            optimumPixelResolutionUnit: getUnitValue('optimumPixelResolutionUnit'),
            optimumGISResolution: document.getElementById('optimumGISResolution')?.value || null,
            optimumGISResolutionUnit: getUnitValue('optimumGISResolutionUnit'),
            optimumMLResolution: document.getElementById('optimumMLResolution')?.value || null,
            optimumMLResolutionUnit: getUnitValue('optimumMLResolutionUnit'),
            optimumPredictionSpatialResolution: document.getElementById('optimumPredictionSpatialResolution')?.value || null,
            optimumPredictionSpatialResolutionUnit: getUnitValue('optimumPredictionSpatialResolutionUnit'),
            optimumPredictionTemporalResolution: document.getElementById('optimumPredictionTemporalResolution')?.value || null,
            optimumSurveyAggregationPrimary: document.getElementById('optimumSurveyAggregation1')?.value || null,
            optimumSurveyAggregationSecondary: document.getElementById('optimumSurveyAggregation2')?.value || null,
            optimumOtherResolution: document.getElementById('optimumOtherResolution')?.value || null,
            aoiType: document.getElementById('aoiType')?.value || null,
            aoiLocation: document.getElementById('aoiDropdown')?.value || null,
            minLat: document.getElementById('minLat')?.value || null,
            maxLat: document.getElementById('maxLat')?.value || null,
            minLon: document.getElementById('minLon')?.value || null,
            maxLon: document.getElementById('maxLon')?.value || null,
            aoiFileName: document.getElementById('aoiFile')?.files[0]?.name || null,
            otherRequirements: document.getElementById('otherRequirements')?.value || null
        };

        // --- SAVE TO LOCAL STORAGE ---
        const section1Data = {
            basic: {
                datasetTitle,
                evaluatorName: payload.evaluatorName,
                evaluatorOrg: payload.affiliation,
                dataProcessing,
                dataType,
                dataTypeOther: payload.dataTypeOther,
                evaluationType
            },
            useCase: evaluationType === 'use-case-adequacy' ? {
                description: payload.useCaseDescription,
                optimumDataCollection: payload.optimumDataCollection,
                otherRequirements: payload.otherRequirements
            } : null
        };

        DataManager.save("section1", null, section1Data);
        console.log("💾 Saved Section1 locally:", section1Data);

        // --- SEND TO BACKEND ---
        try {
            const response = await fetch('http://localhost:8020/section1', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
//             const response = await fetch(`${CONFIG.API_URL}/section1`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
// });

            const result = await response.json();

            if (!response.ok) {
                console.error("❌ Error saving Section1:", result);
                alert("Failed to save Section1: " + (result.message || 'Unknown error'));
                return;
            }

            console.log("✅ Section1 saved on backend:", result);

            // Save backend-generated ID for later use
            if (result.id) localStorage.setItem("section1_id", result.id);

            // --- REDIRECT TO SECTION2 ---
            window.location.href = "section2.html";

        } catch (err) {
            console.error("🌐 Network error while saving Section1:", err);
            alert("Network error. Please check your backend server.");
        }
    });
});