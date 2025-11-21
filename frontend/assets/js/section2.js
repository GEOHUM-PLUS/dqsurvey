// import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
// import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
// import { initializePage } from './core/init.js';
// import { DataManager } from './core/datamanager.js';



// document.addEventListener('DOMContentLoaded', () => {
//     // Initialize DataManager if needed
//     DataManager.init();

//     // Get the saved data
//     const surveyData = DataManager.get();

//     // Access Section 1 data
//     const section1Data = surveyData.section1;

//     console.log("Section 1 data:", section1Data);

//     // Example: Use datasetTitle in Section 2
//     const datasetTitleInput = document.getElementById('datasetTitleSection2');
//     if (datasetTitleInput && section1Data?.basic?.datasetTitle) {
//         datasetTitleInput.value = section1Data.basic.datasetTitle;
//     }

//     // You can similarly access:
//     // section1Data.basic.evaluatorName
//     // section1Data.useCase.description
//     // etc.
// });
// // ---- KEYWORDS BANK ----
// // Predefined keywords that users can select from or add custom ones
// const KEYWORDS_BANK = [
//   'Geographic Information',
//   'Spatial Data',
//   'Climate',
//   'Land Cover',
//   'Urban Areas',
//   'Environmental Monitoring',
//   'Remote Sensing',
//   'GIS',
//   'Cadastral Data',
//   'Transportation',
//   'Natural Resources',
//   'Biodiversity',
//   'Water Resources',
//   'Agriculture',
//   'Geology',
//   'Atmosphere',
//   'Hydrography',
//   'Elevation',
//   'Boundaries',
//   'Population',
//   'Infrastructure',
//   'Utilities',
//   'Emergency Management',
//   'Precision Mapping'
// ];

// document.addEventListener('DOMContentLoaded', function () {
//   // Initialize shared features
//   initializeHighlighting();
//   initializeTooltips();
//   DataManager.init();
  
//   // Initialize conformance visibility
//   const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
//   if (savedProcessingLevel) {
//     applyConformanceVisibility(savedProcessingLevel);
//   }
//   updateNavigationButtons();
  
//   // Listen for data-type changes from section1
//   window.addEventListener('dataTypeChanged', function(event) {
//     const dataType = event.detail.dataType;
//     console.log('Section 2: Data type changed to:', dataType);
//     handleDataTypeChange(dataType);
//   });
  
//   // Listen for processing level changes from section1
//   window.addEventListener('processingLevelChanged', function(event) {
//     const processingLevel = event.detail.processingLevel;
//     console.log('Section 2: Processing level changed to:', processingLevel);
//     handleProcessingLevelChange(processingLevel);
//   });
  
//   // Listen for evaluation type changes from section1
//   window.addEventListener('evaluationTypeChanged', function(event) {
//     const evaluationType = event.detail.evaluationType;
//     console.log('Section 2: Evaluation type changed to:', evaluationType);
//     handleEvaluationTypeChange(evaluationType);
//   });
  
//   // Listen for aggregation level changes from section1 - CRITICAL
//   window.addEventListener('aggregationLevelChanged', function(event) {
//     const aggregationLevel = event.detail.aggregationLevel;
//     console.log('Section 2: Aggregation level changed to:', aggregationLevel);
//     handleAggregationLevelChange(aggregationLevel);
//   });
  
//   // Check current values from sessionStorage on page load
//   const currentDataType = sessionStorage.getItem('dataType');
//   if (currentDataType) {
//     handleDataTypeChange(currentDataType);
//   }
  
//   const currentProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
//   if (currentProcessingLevel) {
//     handleProcessingLevelChange(currentProcessingLevel);
//   }
  
//   const currentEvaluationType = sessionStorage.getItem('evaluationType');
//   if (currentEvaluationType) {
//     handleEvaluationTypeChange(currentEvaluationType);
//   }
  
//   const currentAggregationLevel = sessionStorage.getItem('optimumAggregationLevel');
//   if (currentAggregationLevel) {
//     handleAggregationLevelChange(currentAggregationLevel);
//   }
  
//   function handleDataTypeChange(dataType) {
//     console.log('Section 2 updating UI for data type:', dataType);
//   }
  
//   function handleProcessingLevelChange(processingLevel) {
//     console.log('Section 2 updating UI for processing level:', processingLevel);
//   }
  
//   function handleEvaluationTypeChange(evaluationType) {
//     console.log('Section 2 updating UI for evaluation type:', evaluationType);
//   }
  
//   function handleAggregationLevelChange(aggregationLevel) {
//     console.log('Section 2 updating UI for aggregation level:', aggregationLevel);
//   }
  
//   // ---- HELPER FUNCTION: SAVE KEY FORM VALUES ----
//   function saveFormValue(key, value) {
//     sessionStorage.setItem(key, value);
//     console.log(`Saved to session: ${key} = ${value}`);
//   }
  
//   // ---- KEYWORDS HANDLING ----
//   const keywordInput = document.getElementById('keyword-input');
//   const keywordTags = document.getElementById('keyword-tags');
//   const suggestions = document.getElementById('suggestions');
  
//   function addKeyword(keyword) {
//     if (!keyword || !keyword.trim()) return;
    
//     keyword = keyword.trim();
    
//     // Check if keyword already exists
//     const existingKeywords = getKeywords();
//     if (existingKeywords.includes(keyword)) {
//       console.log('Keyword already exists');
//       return;
//     }
    
//     const badge = document.createElement('span');
//     badge.className = 'badge bg-info me-1 mb-1';
//     badge.innerHTML = `${keyword} <button type="button" class="btn-close btn-close-white ms-1" aria-label="Close" style="cursor: pointer;"></button>`;
    
//     badge.querySelector('.btn-close').addEventListener('click', () => {
//       badge.remove();
//       saveKeywords();
//     });
    
//     keywordTags?.appendChild(badge);
//     keywordInput.value = '';
//     suggestions.style.display = 'none';
    
//     // Save keywords to session storage
//     saveKeywords();
//   }
  
//   function getKeywords() {
//     return Array.from(keywordTags?.querySelectorAll('.badge') || [])
//       .map(badge => badge.textContent.replace(/\s×\s/, '').trim());
//   }
  
//   function saveKeywords() {
//     const keywords = getKeywords();
//     saveFormValue('keywords', JSON.stringify(keywords));
//   }
  
//   function showSuggestions(input) {
//     if (!input.trim()) {
//       suggestions.style.display = 'none';
//       return;
//     }
    
//     const filtered = KEYWORDS_BANK.filter(k => 
//       k.toLowerCase().includes(input.toLowerCase()) && 
//       !getKeywords().includes(k)
//     );
    
//     suggestions.innerHTML = '';
    
//     if (filtered.length > 0) {
//       filtered.slice(0, 5).forEach(keyword => {
//         const li = document.createElement('li');
//         li.className = 'list-group-item list-group-item-action';
//         li.textContent = keyword;
//         li.style.cursor = 'pointer';
//         li.addEventListener('click', () => {
//           addKeyword(keyword);
//         });
//         suggestions.appendChild(li);
//       });
//       suggestions.style.display = 'block';
//     } else {
//       suggestions.style.display = 'none';
//     }
//   }
  
//   if (keywordInput) {
//     keywordInput.addEventListener('input', (e) => {
//       showSuggestions(e.target.value);
//     });
    
//     keywordInput.addEventListener('keypress', (e) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         addKeyword(keywordInput.value);
//       }
//     });
    
//     // Close suggestions when clicking outside
//     document.addEventListener('click', (e) => {
//       if (!e.target.closest('#keyword-input') && !e.target.closest('#suggestions')) {
//         suggestions.style.display = 'none';
//       }
//     });
//   }

//   // ---- LANGUAGE DROPDOWN ----
//   const languageDropdown = document.getElementById('languageDropdown');
//   if (languageDropdown) {
//     languageDropdown.addEventListener('change', function() {
//       DataManager.saveSection('section2', 'descriptives', { language: this.value });
//       saveFormValue('language', this.value);
//     });
//   }

//   // ---- METADATA FIELDS ----
//   const documentationInput = document.getElementById('documentation');
//   const accessibilityInput = document.getElementById('accessibility');
//   const metadataStandardInput = document.getElementById('metadataStandard');
  
//   if (documentationInput) {
//     documentationInput.addEventListener('change', function() {
//       DataManager.saveSection('section2', 'metadata', { documentation: this.value });
//     });
//   }
  
//   if (accessibilityInput) {
//     accessibilityInput.addEventListener('change', function() {
//       DataManager.saveSection('section2', 'metadata', { accessibility: this.value });
//     });
//   }
  
//   if (metadataStandardInput) {
//     metadataStandardInput.addEventListener('change', function() {
//       DataManager.saveSection('section2', 'metadata', { metadataStandard: this.value });
//     });
//   }

//   // ---- SAVE FORM DATA ----
//   window.addEventListener('beforeunload', () => {
//     // Don't save if form has been submitted
//     if (sessionStorage.getItem('formSubmitted')) {
//       return;
//     }
//     const formData = DataManager.collectCurrentPageData();
//     DataManager.saveSection('section2', 'general', formData);
//   });
  
//   // Restore saved data on page load
//   DataManager.restorePageData();
// });



// document.addEventListener("DOMContentLoaded", () => {
//   initializePage('section2');

//   // Prefill fields from DataManager
//   const section2Data = DataManager.get().section2?.descriptives || {};
//   Object.keys(section2Data).forEach((id) => {
//     const el = document.getElementById(id);
//     if (el) {
//       if (el.type === "checkbox") el.checked = section2Data[id] === el.value;
//       else if (el.type === "radio") el.checked = section2Data[id] === el.value;
//       else el.value = section2Data[id];
//     }
//   });

//   // Build payload on Next button click
//   const nextBtn = document.getElementById("nextSection2");
//   nextBtn?.addEventListener("click", (e) => {
//     e.preventDefault();

//     // Metadata Documentation
//     const identifier = document.getElementById("identifier").value.trim();
//     const dataset_description = document.getElementById("datasetDescription").value.trim();
//     const dataset_description_link = document.getElementById("datasetDescriptionLink").value.trim();
//     const language = document.getElementById("languageDropdown").value === "other"
//       ? document.getElementById("languageOtherInput").value.trim()
//       : document.getElementById("languageDropdown").value;
//     const metadata_documentation = document.getElementById("metadataDoc").value.trim();
//     const metadata_standards = document.getElementById("metadata-conformance").value;
//     const score_metadata_documentation = document.querySelector('.score-field[data-scoregroup="descriptives"]').value;

//     // Accessibility
//     const access_restrictions = Array.from(document.querySelectorAll('.access-check'))
//       .filter(cb => cb.checked).map(cb => cb.value).join(", ");
//     const api_availability = Array.from(document.querySelectorAll('.api-radio'))
//       .find(rb => rb.checked)?.value || "";
//     const usage_rights = Array.from(document.querySelectorAll('input[name="usageRights"]'))
//       .find(rb => rb.checked)?.value || "";
//     const data_format = document.getElementById("dataFormat").value;
//     const format_standards = Array.from(document.querySelectorAll('input[name="formatStandards"]'))
//       .find(rb => rb.checked)?.value || "";
//     const score_accessibility = document.querySelector('.score-field[data-scoregroup="accessibility"]').value;

//     // Spatial Accuracy
//     const crs = document.getElementById("crsSelect").value;
//     const positional_accuracy = document.getElementById("positionalAccuracy").value.trim();
//     const spatial_uncertainty = document.getElementById("spatialUncertainty").value.trim();
//     const score_spatial_accuracy = document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]').value;

//     // Build payload similar to section1
//     const payload = {
//       identifier,
//       dataset_description,
//       dataset_description_link,
//       language,
//       metadata_documentation,
//       metadata_standards,
//       score_metadata_documentation,

//       access_restrictions,
//       api_availability,
//       usage_rights,
//       data_format,
//       format_standards,
//       score_accessibility,

//       crs,
//       positional_accuracy,
//       spatial_uncertainty,
//       score_spatial_accuracy
//     };

//     // Save to DataManager and localStorage
//     DataManager.save("section2", "descriptives", payload);
//     localStorage.setItem("section2_data", JSON.stringify(payload));

//     console.log("📤 Section 2 payload:", payload);

//     // Go to next section
//     window.location.href = "section3.html";
//   });
// });


// const nextBtn = document.getElementById("nextSection2");
// nextBtn?.addEventListener("click", async (e) => {
//     e.preventDefault();

//     // Get section1 id from DataManager
//     const section1Data = DataManager.get().section1;
//     const section1Id = section1Data.id; // Make sure section1 id is saved after backend insert

//     if (!section1Id) {
//         alert("Error: Section 1 ID not found. Please save Section 1 first.");
//         return;
//     }
//     // getKeywords() already exists in this file
// const keywordsArray = getKeywords(); // e.g. ["GIS","Remote Sensing"]


//     // Collect Section 2 form values
//     const payload = {
//         section1Id,
//         identifier: document.getElementById("identifier").value.trim(),
//         dataset_description: document.getElementById("datasetDescription").value.trim(),
//         dataset_description_link: document.getElementById("datasetDescriptionLink").value.trim(),
//         keywords: JSON.stringify(keywordsArray),
//         language: document.getElementById("languageDropdown").value === "other"
//             ? document.getElementById("languageOtherInput").value.trim()
//             : document.getElementById("languageDropdown").value,
//         metadata_documentation: document.getElementById("metadataDoc").value.trim(),
//         metadata_standards: document.getElementById("metadata-conformance").value,
//         score_metadata_documentation: document.querySelector('.score-field[data-scoregroup="descriptives"]').value,

//         access_restrictions: Array.from(document.querySelectorAll('.access-check'))
//             .filter(cb => cb.checked).map(cb => cb.value).join(", "),
//         api_availability: Array.from(document.querySelectorAll('.api-radio'))
//             .find(rb => rb.checked)?.value || "",
//         usage_rights: Array.from(document.querySelectorAll('input[name="usageRights"]'))
//             .find(rb => rb.checked)?.value || "",
//         data_format: document.getElementById("dataFormat").value,
//         format_standards: Array.from(document.querySelectorAll('input[name="formatStandards"]'))
//             .find(rb => rb.checked)?.value || "",
//         score_accessibility: document.querySelector('.score-field[data-scoregroup="accessibility"]').value,

//         crs: document.getElementById("crsSelect").value,
//         positional_accuracy: document.getElementById("positionalAccuracy").value.trim(),
//         spatial_uncertainty: document.getElementById("spatialUncertainty").value.trim(),
//         score_spatial_accuracy: document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]').value
//     };

//     try {
//         const response = await fetch('http://localhost:8020/section2', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });

        

//         const result = await response.json();
//         if (response.ok) {
//             console.log("📤 Section 2 saved:", result);
//             window.location.href = "section3.html";
//         } else {
//             console.error(result.message);
//             alert("Error saving Section 2 data: " + result.message);
//         }
//     } catch (err) {
//         console.error(err);
//         alert("Network error while saving Section 2 data");
//     }
// });

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';

// ---------------------- PRELOAD SECTION 1 DATA ----------------------
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();

    const surveyData = DataManager.get();
    const section1Data = surveyData.section1 || {};

    console.log("Section 1 data:", section1Data);

    const datasetTitleInput = document.getElementById('datasetTitleSection2');
    if (datasetTitleInput && section1Data?.basic?.datasetTitle) {
        datasetTitleInput.value = section1Data.basic.datasetTitle;
    }
});

// ---------------------- KEYWORDS BANK ----------------------
const KEYWORDS_BANK = [
    'Geographic Information', 'Spatial Data', 'Climate', 'Land Cover',
    'Urban Areas', 'Environmental Monitoring', 'Remote Sensing', 'GIS',
    'Cadastral Data', 'Transportation', 'Natural Resources', 'Biodiversity',
    'Water Resources', 'Agriculture', 'Geology', 'Atmosphere', 'Hydrography',
    'Elevation', 'Boundaries', 'Population', 'Infrastructure', 'Utilities',
    'Emergency Management', 'Precision Mapping'
];

// ---------------------- MAIN PAGE INITIALIZATION ----------------------
document.addEventListener("DOMContentLoaded", () => {
    initializeHighlighting();
    initializeTooltips();
    DataManager.init();
    initializePage('section2');

    updateNavigationButtons();

    // ---------------------- KEYWORD HANDLING ----------------------
    const keywordInput = document.getElementById('keyword-input');
    const keywordTags = document.getElementById('keyword-tags');
    const suggestions = document.getElementById('suggestions');

    function getKeywords() {
        return Array.from(keywordTags?.querySelectorAll('.badge') || [])
            .map(badge => badge.textContent.replace("×", "").trim());
    }

    function saveKeywords() {
        sessionStorage.setItem("keywords", JSON.stringify(getKeywords()));
    }

    function addKeyword(keyword) {
        if (!keyword.trim() || getKeywords().includes(keyword)) return;

        const badge = document.createElement('span');
        badge.className = 'badge bg-info me-1 mb-1';
        badge.innerHTML = `${keyword} <button type="button" class="btn-close btn-close-white ms-1"></button>`;

        badge.querySelector('.btn-close').addEventListener('click', () => {
            badge.remove();
            saveKeywords();
        });

        keywordTags.appendChild(badge);
        keywordInput.value = "";
        suggestions.style.display = "none";

        saveKeywords();
    }

    function showSuggestions(text) {
        if (!text.trim()) {
            suggestions.style.display = "none";
            return;
        }

        const matches = KEYWORDS_BANK.filter(k =>
            k.toLowerCase().includes(text.toLowerCase()) &&
            !getKeywords().includes(k)
        );

        suggestions.innerHTML = "";
        if (matches.length === 0) {
            suggestions.style.display = "none";
            return;
        }

        matches.slice(0, 5).forEach(keyword => {
            const li = document.createElement('li');
            li.className = "list-group-item list-group-item-action";
            li.textContent = keyword;
            li.onclick = () => addKeyword(keyword);
            suggestions.appendChild(li);
        });

        suggestions.style.display = "block";
    }

    if (keywordInput) {
        keywordInput.addEventListener("input", e => showSuggestions(e.target.value));
        keywordInput.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                addKeyword(keywordInput.value);
            }
        });
        document.addEventListener("click", e => {
            if (!e.target.closest("#keyword-input") && !e.target.closest("#suggestions")) {
                suggestions.style.display = "none";
            }
        });
    }

    // ---------------------- NEXT BUTTON SAVE FUNCTION ----------------------
    const nextBtn = document.getElementById("descriptives");
    nextBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
debugger
        // SECTION 1 ID REQUIRED
        const section1 = DataManager.get().section1;
        const section1Id = section1?.id;

        if (!section1Id) {
            alert("Error: Section 1 ID missing. Save Section 1 first.");
            return;
        }

        // COLLECT KEYWORDS
        const keywordsArray = getKeywords();

        // BUILD PAYLOAD
        const payload = {
            section1Id,
            identifier: document.getElementById("identifier")?.value.trim(),
            dataset_description: document.getElementById("datasetDescription")?.value.trim(),
            dataset_description_link: document.getElementById("datasetDescriptionLink")?.value.trim(),

            keywords: JSON.stringify(keywordsArray),

            language: document.getElementById("languageDropdown")?.value === "other"
                ? document.getElementById("languageOtherInput").value.trim()
                : document.getElementById("languageDropdown").value,

            metadata_documentation: document.getElementById("metadataDoc")?.value.trim(),
            metadata_standards: document.getElementById("metadata-conformance")?.value,
            score_metadata_documentation: document.querySelector('.score-field[data-scoregroup="descriptives"]')?.value,

            access_restrictions: Array.from(document.querySelectorAll('.access-check'))
                .filter(cb => cb.checked).map(cb => cb.value).join(", "),

            api_availability: Array.from(document.querySelectorAll('.api-radio'))
                .find(rb => rb.checked)?.value || "",

            usage_rights: Array.from(document.querySelectorAll('input[name="usageRights"]'))
                .find(rb => rb.checked)?.value || "",

            data_format: document.getElementById("dataFormat")?.value,
            format_standards: Array.from(document.querySelectorAll('input[name="formatStandards"]'))
                .find(rb => rb.checked)?.value || "",
            score_accessibility: document.querySelector('.score-field[data-scoregroup="accessibility"]')?.value,

            crs: document.getElementById("crsSelect")?.value,
            positional_accuracy: document.getElementById("positionalAccuracy")?.value.trim(),
            spatial_uncertainty: document.getElementById("spatialUncertainty")?.value.trim(),
            score_spatial_accuracy: document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]')?.value
        };
debugger
        console.log("📤 Final Section 2 Payload:", payload);

        // SEND TO BACKEND
        try {
            const response = await fetch("http://localhost:8020/section2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                console.log("✔ Section 2 saved:", result);
                window.location.href = "section3.html";
            } else {
                alert("Error saving Section 2: " + result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Network error saving Section 2.");
        }
    });
});
