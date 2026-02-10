import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';


document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();

  // Validate presence of Section 1 and Section 2 IDs
  const section1Id = sessionStorage.getItem("section1_id");
  const section2Id = sessionStorage.getItem("section2_id");

  if (!section1Id || !section2Id) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

  console.log("✔ Section3 loaded with IDs:", {
    section1Id,
    section2Id
  });


  // Initialize conformance visibility
  const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  if (savedProcessingLevel) {
    applyConformanceVisibility(savedProcessingLevel);
  }
  updateNavigationButtons();

  // Listen for data-type changes from section1
  window.addEventListener('dataTypeChanged', function (event) {
    const dataType = event.detail.dataType;
    console.log('Section 3: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });

  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function (event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 3: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });

  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function (event) {
    const evaluationType = event.detail.evaluationType;

    console.log('Section 3: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });

  // Listen for aggregation level changes from section1 - CRITICAL for design decisions
  window.addEventListener('aggregationLevelChanged', function (event) {
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

  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 3 updating UI for processing level:', processingLevel);
  }

  function handleDataTypeChange(dataType) {
    console.log('Section 3: Filtering UI for data type:', dataType);

    // list of all resolution sections
    const sections = {
      'pixel': document.getElementById('pixel-resolution'),
      'grid': document.getElementById('grid-resolution'),
      'output': document.getElementById('output-resolution'),
      'aggregation': document.getElementById('aggregation-resolution'),
      'manual': document.getElementById('manual-resolution-selection')
    };

    // Step 1: initialize - hide all sections
    Object.values(sections).forEach(el => {
      if (el) {
        el.style.display = 'none';
        el.style.border = "none"; // remove temporary border
      }
    });

    // Step 2: conditional logic
    const type = dataType ? dataType.toLowerCase() : '';

    if (type === 'remote sensing' || type === 'remote-sensing') {
      if (sections.pixel) sections.pixel.style.display = 'block';
    }
    else if (type === 'gis') {
      if (sections.grid) sections.grid.style.display = 'block';
    }
    else if (type === 'prediction' || type === 'model-ml' || type === 'model') {
      if (sections.output) sections.output.style.display = 'block';
    }
    else if (type === 'survey' || type === 'administrative' || type === 'other') {
      if (sections.aggregation) sections.aggregation.style.display = 'block';
    }
    else {
      // Agar koi match na ho toh manual selection dikhayein
      if (sections.manual) sections.manual.style.display = 'block';
    }
  }
  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 3: Handling UI for evaluation type:', evaluationType);
    const useCaseSection = document.querySelector('.use-case-only');
    const generalSpatialSection = document.getElementById('resolution-inputs').parentElement;
    // 1. Use-Case Adequacy 
    if (evaluationType === 'use-case-adequacy') {
      if (useCaseSection) useCaseSection.style.display = 'block';
      if (generalSpatialSection) generalSpatialSection.style.display = 'none'; // hide General data quality
    }
    else if (evaluationType === 'general-quality') {
      if (useCaseSection) useCaseSection.style.display = 'none'; // hide Use-case specific (adequacy) 
      if (generalSpatialSection) generalSpatialSection.style.display = 'block';
    }
    // 3. Default: show both
    else {
      if (useCaseSection) useCaseSection.style.display = 'block';
      if (generalSpatialSection) generalSpatialSection.style.display = 'block';
    }
  }

  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 3 updating UI for aggregation level:', aggregationLevel);
  }

  // ---- SPATIAL RESOLUTION HANDLING ----
  const spatialResolutionRadios = document.querySelectorAll('input[name="spatialResolution"]');

  spatialResolutionRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      // Hide all sub-options
      document.getElementById('pixel-size-input')?.style.display === 'none';
      document.getElementById('grid-size-input')?.style.display === 'none';
      document.getElementById('aggregation-level-input')?.style.display === 'none';

      // Show selected option
      if (this.value === 'remote-sensing') {
        const pixelInput = document.getElementById('pixel-size-input');
        if (pixelInput) pixelInput.style.display = 'block';
      } else if (this.value === 'grid') {
        const gridInput = document.getElementById('grid-size-input');
        if (gridInput) gridInput.style.display = 'block';
      } else if (this.value === 'aggregated') {
        const aggInput = document.getElementById('aggregation-level-input');
        if (aggInput) aggInput.style.display = 'block';
      }

      DataManager.saveSection('section3', 'spatialResolution', { type: this.value });
    });
  });

  // ---- SPATIAL COVERAGE HANDLING ----
  const coverageTypeSelect = document.getElementById('coverageType');
  if (coverageTypeSelect) {
    coverageTypeSelect.addEventListener('change', function () {
      DataManager.saveSection('section3', 'spatialCoverage', { coverageType: this.value });
    });
  }
  // ---- DYNAMIC NEXT BUTTON RESOLUTION ----
  (function () {
    const nextBtn = document.getElementById('Design');
    function resolveNext() {
      const keys = ['dataProcessingLevel', 'processingLevel', 'processing-level', 'processing_level'];
      let val = null;
      // try sessionStorage first
      for (const k of keys) {
        try { val = sessionStorage.getItem(k); if (val) break; } catch (e) { }
      }
      // fallback to localStorage
      if (!val) {
        for (const k of keys) {
          try { val = localStorage.getItem(k); if (val) break; } catch (e) { }
        }
      }
      // fallback to a DOM input on the page (if present)
      if (!val) {
        const el = document.querySelector('[name="processingLevel"], [name="processing-level"], [name="processing_level"]');
        if (el) val = el.value || el.getAttribute('value') || null;
      }
      // decide next target: if value is 'primary' -> skip conformance -> go to context (section5)
      if (val && val.toString().toLowerCase().includes('primary')) {
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
    startDateInput.addEventListener('change', function () {
      DataManager.saveSection('section3', 'timeliness', { startDate: this.value });
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', function () {
      DataManager.saveSection('section3', 'timeliness', { endDate: this.value });
    });
  }

  if (temporalResolutionInput) {
    temporalResolutionInput.addEventListener('change', function () {
      DataManager.saveSection('section3', 'timeliness', { temporalResolution: this.value });
    });
  }

  // ---- AUTO-FILL OPTIMUM DATE FROM SECTION 1 ----
  const optimumDateAuto = document.getElementById('optimumCollectionAuto');
  if (optimumDateAuto) {
    // const savedOptimumDate = sessionStorage.getItem('optimumDataCollection') || DataManager.getSection('section1', 'useCase')?.optimumDataCollection;
    const savedOptimumDate = sessionStorage.getItem('optimumDataCollection');
    if (savedOptimumDate) {
      optimumDateAuto.value = savedOptimumDate;
    }
  }
  // ---- SUBMIT SECTION 3 TO BACKEND ----
  const submitBtn = document.getElementById('Design');

  if (submitBtn) {
    submitBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      const section1Id = sessionStorage.getItem("section1_id");
      const section2Id = sessionStorage.getItem("section2_id");

      if (!section1Id || !section2Id) {
        alert("❌ Missing Section IDs. Please complete previous sections.");
        return;
      }
      // ---- SAFE VALUE HELPER ----
      const val = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? el.value.trim() : null;
      };

      // Build API payload (MATCHES BACKEND EXACTLY)
      const payload = {
        section1Id: Number(section1Id),
        section2Id: Number(section2Id),

        pixelResolutionValue: val("pixelResolutionValue"),
        pixelResolutionUnit: val("pixelResolutionUnit"),

        gridResolutionValue: val("gridResolutionValue"),
        gridResolutionUnit: val("gridResolutionUnit"),

        outputResolutionValue: val("outputResolutionValue"),
        outputResolutionUnit: val("outputResolutionUnit"),

        aggregationResolutionLevel: val("aggregationResolutionLevel"),

        generalResolutionScore: val("generalResolutionScore"),
        useCaseResolutionScore: val("useCaseResolutionScore"),
        optimalResolution: val("optimalResolution"),
        spatialFit: val("spatialFit"),
        spatialDeviation: val("spatialDeviation"),
        spatialFitScore: val("spatialFitScore"),

        generalExtent: val("generalExtent"),
        generalExtentDetails: val("generalExtentDetails"),
        generalCoverageScore: val("generalCoverageScore"),

        aoiCoverage: val("aoiCoverage"),
        cloudCover: val("cloudCover"),
        coverageDeviation: val("coverageDeviation"),
        coverageFitScore: val("coverageFitScore"),

        collectionDate: val("collectionDate"),
        temporalResolution: val("temporalResolution"),
        latestUpdate: val("latestUpdate"),
        temporalExtent: val("temporalExtent"),
        temporalValidity: val("temporalValidity"),

        generalTimelinessScore: val("generalTimelinessScore"),
        optimumCollectionDate: val("optimumCollectionDate"),
        temporalDeviation: val("temporalDeviation"),
        temporalFitScore: val("temporalFitScore")
      };

      console.log("🚀 Section3 Payload:", payload);
      // Send to backend
      try {
        const response = await fetch('https://dqsurvey.onrender.com/section3/section3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('✅ Section 3 saved:', result);

        if (!response.ok) {
          throw new Error(result.message || 'Section 3 save failed');
        }

        console.log('✅ Section 3 saved:', result);

        // Save returned ID for next sections
        sessionStorage.setItem('section3_id', result.section3_id);
        sessionStorage.setItem('formSubmitted', 'true');

        // Go next
        // window.location.href = 'section4.html';
    
        // Decide next section based on processing level
        const processingLevel =
          sessionStorage.getItem('products') ||
          sessionStorage.getItem('processingLevel');

        if (processingLevel && processingLevel.toLowerCase().includes('primary')) {
          console.log('➡ Redirecting to Section 5 (Primary Data)');
          window.location.href = 'section5.html';
        } else {
          console.log('➡ Redirecting to Section 4 (Data Product)');
          window.location.href = 'section4.html';
        }

      } catch (err) {
        console.error('❌ Section3 submit error:', err);
        alert('Failed to save Section 3. Please try again.');
      }
    });
  }


});
