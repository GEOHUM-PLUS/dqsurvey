import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';

// let isEditMode = false;
// const section1Id = sessionStorage.getItem("section1_id");
// const section2Id = sessionStorage.getItem("section2_id");
// const section3Id = sessionStorage.getItem("section3_id");
// let step3Flag = parseInt(sessionStorage.getItem("step3") || "0");
// console.log("Loaded session values - section3_id:", section3Id, "step1:", step3Flag);
// // Detect Mode
// if (section3Id && step3Flag === 1) {
//   isEditMode = true;
// }
// console.log("Section1 Mode:", isEditMode ? "EDIT" : "CREATE");
const fireChange = (id) => {
  const el = document.getElementById(id);
  if (el) el.dispatchEvent(new Event("change", { bubbles: true }));
};

// Convert DB date/timestamp -> YYYY-MM-DD for <input type="date">
const toDateInputValue = (v) => {
  if (!v) return '';
  if (typeof v === 'string' && v.includes('T')) return v.split('T')[0];
  // if Date object:
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (e) { }
  return v; // already YYYY-MM-DD
};

const setVal = (id, v) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = (v ?? '');
};

const setDate = (id, v) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = toDateInputValue(v);
};

const setSelect = (id, v) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = (v ?? '');
  // if your UI depends on change handlers:
  el.dispatchEvent(new Event("change", { bubbles: true }));
};

document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();

  // Validate presence of Section 1 and Section 2 IDs
  const section1Id = sessionStorage.getItem("section1_id");
  const section2Id = sessionStorage.getItem("section2_id");

  const section3Id = sessionStorage.getItem("section3_id");
  let step3Flag = parseInt(sessionStorage.getItem("step3") || "0");

  if (!section1Id || !section2Id) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

  console.log("✔ Section3 loaded with IDs:", {
    section1Id,
    section2Id
  });

  // ✅ REFILL WHEN COMING BACK
  if (section3Id && step3Flag === 1) {
    refillSection3FromDB(section3Id, section1Id, section2Id);
  }

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

      const section3Id = sessionStorage.getItem("section3_id");
      const step3Flag = parseInt(sessionStorage.getItem("step3") || "0");

      // ✅ edit mode if step3=1 and section3_id exists
      const isEditMode = !!section3Id && step3Flag === 1;

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
        // const response = await fetch('https://dqsurvey.onrender.com/section3/section3', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });

const url = isEditMode
  ? `https://dqsurvey.onrender.com/section3/section3/${section3Id}`
  : `https://dqsurvey.onrender.com/section3/section3`;

const method = isEditMode ? "PUT" : "POST";
const response = await fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
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
// refill back from section 4
  async function refillSection3FromDB(section3Id, section1Id, section2Id) {
    try {
      const url = `https://dqsurvey.onrender.com/section3/bySection1And2/${section3Id}/${section1Id}/${section2Id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch section3 data");
      const data = await res.json();

      console.log("✅ Section3 DB data:", data);
      if (!data) return;

      // ✅ FIRST: ensure correct UI sections open (important!)
      const currentDataType = sessionStorage.getItem("dataType");
      if (currentDataType) handleDataTypeChange(currentDataType);

      const currentEvaluationType = sessionStorage.getItem("evaluationType");
      if (currentEvaluationType) handleEvaluationTypeChange(currentEvaluationType);

      // ✅ NOW set values (normal inputs)
      setVal("pixelResolutionValue", data.pixel_resolution_value);
      setVal("pixelResolutionUnit", data.pixel_resolution_unit);

      setVal("gridResolutionValue", data.grid_resolution_value);
      setVal("gridResolutionUnit", data.grid_resolution_unit);

      setVal("outputResolutionValue", data.output_resolution_value);
      setVal("outputResolutionUnit", data.output_resolution_unit);

      setVal("aggregationResolutionLevel", data.aggregation_resolution_level);

      // ✅ SCORES (these are SELECT dropdowns usually)
      setSelect("generalResolutionScore", data.general_resolution_score);
      setSelect("useCaseResolutionScore", data.usecase_resolution_score);
      setSelect("spatialFitScore", data.spatial_fit_score);

      setSelect("generalCoverageScore", data.general_coverage_score);
      setSelect("coverageFitScore", data.coverage_fit_score);

      setSelect("generalTimelinessScore", data.general_timeliness_score);
      setSelect("temporalFitScore", data.temporal_fit_score);

      // ✅ TEXT INPUTS
      setVal("optimalResolution", data.optimal_resolution);
      setVal("spatialFit", data.spatial_fit);
      setVal("spatialDeviation", data.spatial_deviation);

      setVal("generalExtent", data.general_extent);
      setVal("generalExtentDetails", data.general_extent_details);

      setVal("aoiCoverage", data.aoi_coverage);
      setVal("cloudCover", data.cloud_cover);
      setVal("coverageDeviation", data.coverage_deviation);

      setVal("temporalExtent", data.temporal_extent);
      setVal("temporalValidity", data.temporal_validity);
      setVal("temporalDeviation", data.temporal_deviation);

      // ✅ DATES (use setDate!!)
      setDate("collectionDate", data.collection_date);
      setVal("temporalResolution", data.temporal_resolution);
      setDate("optimumCollectionDate", data.optimum_collection_date);

      // These are often date or text — adjust based on your HTML type:
      setDate("latestUpdate", data.latest_update); // if <input type="date">
      // if latestUpdate is <input type="text"> then use setVal instead

      console.log("✅ Section3 refill done.");
    } catch (err) {
      console.error("❌ Section3 refill error:", err);
    }
  }

  document.getElementById('back3to2').addEventListener('click', function () {
    sessionStorage.setItem('step2', '1');
  });

});
