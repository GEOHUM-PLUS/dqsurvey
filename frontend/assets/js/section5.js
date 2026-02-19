// ============================================
// SECTION 5: CONTEXT
// ============================================

import {initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
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
   const section4Id = sessionStorage.getItem("section4_id");

  if (!section1Id || !section2Id || !section3Id ) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

  console.log("✔ Section5 loaded with IDs:", {
    section1Id,
    section2Id,
    section3Id,
    section4Id
  });
 // -------------------------------
// PREVIOUS BUTTON LOGIC (dynamic)
// -------------------------------
const backBtn = document.getElementById("back5");
if (backBtn) {
  backBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const section1Id = sessionStorage.getItem("section1_id");
    const section2Id = sessionStorage.getItem("section2_id");
    const section3Id = sessionStorage.getItem("section3_id");
    const section4Id = sessionStorage.getItem("section4_id"); // may be null

    // // if required IDs missing, send user to section1
    // if (!section1Id || !section2Id || !section3Id) {
    //   window.location.href = "section1.html";
    //   return;
    // }

    // ✅ If section4Id exists -> go back to section4 and set step4=1
    if (section4Id && section4Id !== "null" && section4Id !== "undefined" && section4Id !== "") {
      sessionStorage.setItem("step4", "1");
      window.location.href = "section4.html";
      return;
    }

    // ✅ If section4Id not exists -> go back to section3 and set step3=1
    sessionStorage.setItem("step3", "1");
    window.location.href = "section3.html";
  });
}

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

    // Show use-case-specific fields only when evaluation type indicates use-case adequacy
    const useCaseSection = document.querySelector('.use-case-only');
    const generalQualitySection = document.querySelector('.general-quality-only');

    const normalized = (evaluationType || '').toString().trim().toLowerCase();
    
    // Show/hide use-case-only section
    if (useCaseSection) {
      if (normalized === 'use-case-adequacy' || normalized === 'use_case_adequacy' || normalized === 'usecaseadequacy' || normalized === 'usecase-adequacy') {
        useCaseSection.style.display = '';
      } else {
        useCaseSection.style.display = 'none';
      }
    }

    // Show/hide general-quality-only section
    if (generalQualitySection) {
      if (normalized === 'general-quality' || normalized === 'general_quality' || normalized === 'generalquality') {
        generalQualitySection.style.display = '';
      } else {
        generalQualitySection.style.display = 'none';
      }
    }
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
  // ---- DYNAMIC INPUT DATA ROWS for strengths----
  const inputDataList = document.getElementById('strength-list');

  inputDataList.addEventListener('click', function (e) {
    // Handle Add Button
    if (e.target.classList.contains('add-strength')) {
      const currentRow = e.target.closest('.input-group');
      const newRow = currentRow.cloneNode(true);

      // Clear the values in the new row
      newRow.querySelectorAll('input').forEach(input => input.value = '');
      newRow.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
      
      // Change the button from + to -
      const btn = newRow.querySelector('.add-strength');
      btn.classList.replace('btn-outline-success', 'btn-outline-danger');
      btn.classList.replace('add-strength', 'remove-strength');
      btn.textContent = '-';

      inputDataList.appendChild(newRow);
    }

    // Handle Remove Button
    if (e.target.classList.contains('remove-strength')) {
      e.target.closest('.input-group').remove();
    }
  });
  
  // ---- DYNAMIC INPUT DATA ROWS for limitations----
  const limitDataList = document.getElementById('limitation-list');

  limitDataList.addEventListener('click', function (e) {
    // Handle Add Button
    if (e.target.classList.contains('add-limitation')) {
      const currentRow = e.target.closest('.input-group');
      const newRow = currentRow.cloneNode(true);

      // Clear the values in the new row
      newRow.querySelectorAll('input').forEach(input => input.value = '');
      newRow.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
      
      // Change the button from + to -
      const btn = newRow.querySelector('.add-limitation');
      btn.classList.replace('btn-outline-success', 'btn-outline-danger');
      btn.classList.replace('add-limitation', 'remove-limitation');
      btn.textContent = '-';

      limitDataList.appendChild(newRow);
    }

    // Handle Remove Button
    if (e.target.classList.contains('remove-limitation')) {
      e.target.closest('.input-group').remove();
    }
  });
    
  // ---- DYNAMIC INPUT DATA ROWS for limitations----
  const constraintsDataList = document.getElementById('constraint-list');

  constraintsDataList.addEventListener('click', function (e) {
    // Handle Add Button
    if (e.target.classList.contains('add-constraint')) {
      const currentRow = e.target.closest('.input-group');
      const newRow = currentRow.cloneNode(true);

      // Clear the values in the new row
      newRow.querySelectorAll('input').forEach(input => input.value = '');
      newRow.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
      
      // Change the button from + to -
      const btn = newRow.querySelector('.add-constraint');
      btn.classList.replace('btn-outline-success', 'btn-outline-danger');
      btn.classList.replace('add-constraint', 'remove-constraint');
      btn.textContent = '-';

      constraintsDataList.appendChild(newRow);
    }

    // Handle Remove Button
    if (e.target.classList.contains('remove-constraint')) {
      e.target.closest('.input-group').remove();
    }
  });


  // -------------------------------
  // SUBMIT SECTION 5 TO BACKEND
  // -------------------------------
  const submitBtn = document.getElementById("submitSection5"); // next button id

  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      const section1Id = sessionStorage.getItem("section1_id");
      const section2Id = sessionStorage.getItem("section2_id");
      const section3Id = sessionStorage.getItem("section3_id");
      const section4Id = sessionStorage.getItem("section4_id");

      if (!section1Id || !section2Id || !section3Id) {
        alert("❌ Missing required Section IDs");
        return;
      }

      // -------------------------------
      // SAFE VALUE HELPER
      // -------------------------------
      const val = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? el.value.trim() : null;
      };

      // -------------------------------
      // COLLECT MULTIPLE INPUT ARRAYS
      // -------------------------------
      const collectList = (selector) => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => el.value.trim())
          .filter(v => v !== "");
      };

      const strengths = collectList('#strength-list input[name="strengths[]"]');
      const limitations = collectList('#limitation-list input[name="limitations[]"]');
      const constraints = collectList('#constraint-list input[name="constraints[]"]');

      // -------------------------------
      // COLLECT SCORES
      // -------------------------------
      const scoreReputation =
        document.querySelector('[data-scoregroup="context-reputation"]')?.value || null;

      const scoreRelevance =
        document.querySelector('[data-scoregroup="context-relevance"]')?.value || null;

      const scoreApplicability =
        document.querySelector('[data-scoregroup="context-applicability"]')?.value || null;

      const scoreTransferability =
        document.querySelector('[data-scoregroup="context-transferability"]')?.value || null;
//  general-quality
      // -------------------------------
      // BUILD PAYLOAD
      // -------------------------------
      const payload = {
        section1Id: Number(section1Id),
        section2Id: Number(section2Id),
        section3Id: Number(section3Id),
        section4Id: section4Id ? Number(section4Id) : null,

        creator: val("creator"),
        contributors: val("contributors"),
        publisher: val("publisher"),
        trustProducer: val("trustProducer"),
        relations: val("relations"),
        relationsUrl: val("relationsUrl"),
        frequencyUse: val("frequencyUse"),
        audience: val("audience"),
        familiarity: val("familiarity"),
        scoreReputation,

        strengths,
        limitations,

        relevanceUsecase: val("relevanceUsecase"),
        impactStrengths: val("impactStrengths"),
        impactLimitations: val("impactLimitations"),
        scoreRelevance,

        constraints,
        modelDataFit: val("modelDataFit"),
        scoreApplicability,

        spatialHomogeneity: val("spatialHomogeneity"),
        usabilityLocations: val("usabilityLocations"),
        scoreTransferability
      };

      console.log("🚀 Section5 Payload:", payload);

      // -------------------------------
      // SEND TO BACKEND
      // -------------------------------
      try {
        const response = await fetch("https://dqsurvey.onrender.com/section5/section5", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Section5 save failed");
        }

        console.log("✅ Section5 saved:", result);

        // Save returned ID
        sessionStorage.setItem("section5_id", result.section5_id);
        sessionStorage.setItem("formSubmitted", "true");

        // Go to summary
        window.location.href = "summary.html";

      } catch (err) {
        console.error("❌ Section5 Submit Error:", err);
        alert("Failed to save Section 5. Please try again.");
      }
    });
  }


});
