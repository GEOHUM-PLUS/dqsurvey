// ============================================
// SECTION 4: CONFORMANCE
// ============================================

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
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
  let step4Flag = parseInt(sessionStorage.getItem("step4") || "0");
  if (!section1Id || !section2Id || !section3Id) {
    alert("❌ Required IDs missing. Please complete previous sections.");
    window.location.href = "section1.html"; // or section2.html
    return;
  }

  console.log("✔ Section4 loaded with IDs:", {
    section1Id,
    section2Id,
    section3Id,
    section4Id
  });

  // ✅ REFILL WHEN COMING BACK
  if (section4Id && step4Flag === 1) {
    refillSection4FromDB(section4Id, section1Id, section2Id, section3Id);
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
    console.log('Section 4: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });

  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function (event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 4: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });

  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function (event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 4: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });

  // Listen for aggregation level changes from section1 - CRITICAL for conformance decisions
  window.addEventListener('aggregationLevelChanged', function (event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 4: Aggregation level changed to:', aggregationLevel);
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
    console.log('Section 4 updating UI for data type:', dataType);
  }

  function handleProcessingLevelChange(processingLevel) {
    console.log('Section 4 updating UI for processing level:', processingLevel);
  }

  function handleEvaluationTypeChange(evaluationType) {
    console.log('Section 4 updating UI for evaluation type:', evaluationType);
  }

  function handleAggregationLevelChange(aggregationLevel) {
    console.log('Section 4 updating UI for aggregation level:', aggregationLevel);
  }


  // ---- DYNAMIC INPUT DATA ROWS ----
  const inputDataList = document.getElementById('input-data-list');

  inputDataList.addEventListener('click', function (e) {
    // Handle Add Button
    if (e.target.classList.contains('add-input-data')) {
      const currentRow = e.target.closest('.input-data-entry');
      const newRow = currentRow.cloneNode(true);

      // Clear the values in the new row
      newRow.querySelectorAll('input').forEach(input => input.value = '');
      newRow.querySelectorAll('select').forEach(select => select.selectedIndex = 0);

      // Change the button from + to -
      const btn = newRow.querySelector('.add-input-data');
      btn.classList.replace('btn-outline-success', 'btn-outline-danger');
      btn.classList.replace('add-input-data', 'remove-input-data');
      btn.textContent = '-';

      inputDataList.appendChild(newRow);
    }

    // Handle Remove Button
    if (e.target.classList.contains('remove-input-data')) {
      e.target.closest('.input-data-entry').remove();
    }
  });

  // ---- CONFORMANCE SECTION ACCESS CONTROL ----
  const sectionPageName = window.location.pathname.split('/').pop();
  const savedProcessingLevelCheck = sessionStorage.getItem('dataProcessingLevel');

  if (sectionPageName === 'section4.html') {
    if (savedProcessingLevelCheck === 'primary') {
      console.warn('Access denied to conformance section: Primary Data selected');
      setTimeout(() => {
        window.location.href = 'section5.html';
      }, 1000);
    }
  }

  // ---- ACCURACY TYPE HANDLING ----
  const accuracyTypeRadios = document.querySelectorAll('input[name="accuracyType"]');

  function handleAccuracyTypeChange() {
    const selected = document.querySelector('input[name="accuracyType"]:checked');

    // Hide all accuracy input sections
    document.getElementById('positional-accuracy')?.classList.add('d-none');
    document.getElementById('attribute-accuracy')?.classList.add('d-none');
    document.getElementById('model-performance')?.classList.add('d-none');
    document.getElementById('data-plausibility')?.classList.add('d-none');

    if (selected) {
      const value = selected.value;
      const targetIdMap = {
        'positional': 'positional-accuracy',
        'attribute': 'attribute-accuracy',
        'model': 'model-performance',
        'plausibility': 'data-plausibility'
      };

      const targetId = targetIdMap[value];
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.classList.remove('d-none');
        console.log('Showing accuracy input for:', value, '-> div ID:', targetId);
      } else {
        console.error('Target element not found for accuracy type:', value, '-> expected ID:', targetId);
      }

      // Save the selected accuracy type
      DataManager.saveSection('section4', 'conformance', { accuracyType: value });
      console.log('Accuracy type changed to:', value);
    }
  }

  accuracyTypeRadios.forEach(radio => {
    radio.addEventListener('change', handleAccuracyTypeChange);
  });



  // ---- CONFORMANCE SCORING ----
  const conformanceScores = document.querySelectorAll('input[name="conformanceScore"]');

  conformanceScores.forEach(score => {
    score.addEventListener('change', function () {
      DataManager.saveScore(this.id, this.value, 'conformance', 'section4');
      console.log('Conformance score saved:', this.id, '=', this.value);
    });
  });


  // SUBMIT SECTION 4 TO BACKEND
  const submitBtn = document.querySelector('.btn-next');

  if (submitBtn) {
    submitBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      const section1Id = sessionStorage.getItem("section1_id");
      const section2Id = sessionStorage.getItem("section2_id");
      const section3Id = sessionStorage.getItem("section3_id");

      if (!section1Id || !section2Id || !section3Id) {
        alert("❌ Missing section IDs.");
        return;
      }

      // -------- helper --------
      const val = (id) => {
        const el = document.getElementById(id);
        return el && el.value !== '' ? el.value : null;
      };

      const checkedValues = (selector) =>
        Array.from(document.querySelectorAll(selector))
          .filter(cb => cb.checked)
          .map(cb => cb.value);

      // -------- input datasets --------
      const inputDatasets = [];
      document.querySelectorAll('.input-data-entry').forEach(row => {
        const name = row.querySelector('[name="inputName[]"]')?.value;
        const link = row.querySelector('[name="inputLink[]"]')?.value;
        const score = row.querySelector('[name="inputScore[]"]')?.value;

        if (name || link || score) {
          inputDatasets.push({
            name: name || null,
            link: link || null,
            score: score ? Number(score) : null
          });
        }
      });

      // -------- payload (MATCHES BACKEND & DB) --------
      const payload = {
        section1Id: Number(section1Id),
        section2Id: Number(section2Id),
        section3Id: Number(section3Id),

        // Completeness
        valuesCompleteness: val("valuesCompleteness"),
        attributeCompleteness: val("attributeCompleteness"),
        thematicSelectivity: val("thematicSelectivity"),
        spatialVariability: val("spatialVariability"),
        completenessScore: document.querySelector('[data-scoregroup="conformance-completeness"]')?.value || null,

        // Consistency
        topoConsistency: val("topoConsistency"),
        domainConsistency: val("domainConsistency"),
        thematicConsistency: val("thematicConsistency"),
        spatialConsistency: val("spatialConsistency"),
        inconsistencySources: checkedValues('.inconsistency-check'),
        consistencyScore: document.querySelector('[data-scoregroup="conformance-consistency"]')?.value || null,

        // Accuracy
        accuracyType: document.querySelector('input[name="accuracyType"]:checked')?.value || null,
        thematicAccuracy: val("thematicAccuracy"),
        attributeAccuracy: val("attributeAccuracy"),
        modelPerformance: val("modelPerformance"),
        dataPlausibility: val("dataPlausibility"),

        validationMethod: val("validationMethod"),
        validationData: val("validationData"),
        temporalStability: val("temporalStability"),
        thematicStability: val("thematicStability"),
        spatialStability: val("spatialStability"),
        uncertaintyAnalyses: val("uncertaintyAnalyses"),
        uncertaintySources: checkedValues('input[name="uncertaintySources"]'),
        accuracyScore: document.querySelector('[data-scoregroup="conformance-accuracy"]')?.value || null,

        // Reproducibility
        methodClarity: val("methodClarity"),
        methodDocsLink: val("methodDocsLink"),
        methodReputation: val("methodReputation"),
        methodTransferability: val("methodTransferability"),
        codeAvailability: val("codeAvailability"),
        codeRepo: val("codeRepo"),
        resourcesNeeded: val("resourcesNeeded"),
        reproducibilityScore: document.querySelector('[data-scoregroup="conformance-reproducibility"]')?.value || null,

        // Input data summary
        traceability: val("traceability"),
        inputConsistency: val("inputConsistency"),
        inputDataFit: val("inputDataFit"),
        inputScore: document.querySelector('[data-scoregroup="conformance-inputdata"]')?.value || null,

        inputDatasets
      };

      console.log("🚀 Section4 Payload:", payload);

      // -------- API call --------
      try {
        // const res = await fetch('https://dqsurvey.onrender.com/section4/section4', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });

        // ✅ detect edit mode
const section4Id = sessionStorage.getItem("section4_id");
const step4Flag = parseInt(sessionStorage.getItem("step4") || "0");

// ✅ choose endpoint + method
const isEdit = section4Id && step4Flag === 1;

const endpoint = isEdit
  ? `https://dqsurvey.onrender.com/section4/section4/${section4Id}`
  : `https://dqsurvey.onrender.com/section4/section4`;

const method = isEdit ? "PUT" : "POST";

const res = await fetch(endpoint, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Section4 save failed');
        }

        console.log('✅ Section4 saved:', result);

        sessionStorage.setItem('section4_id', result.section4_id);
        sessionStorage.setItem('formSubmitted', 'true');
// ✅ after successful update/save, reset step4 to 0 (optional but best)
sessionStorage.setItem("step4", "0");
        window.location.href = 'section5.html';

      } catch (err) {
        console.error('❌ Section4 submit error:', err);
        alert('Failed to save Section 4.');
      }
    });
  }


  async function refillSection4FromDB(section4Id, section1Id, section2Id, section3Id) {
    try {
      const url = `https://dqsurvey.onrender.com/section4/bySection1And2And3/${section4Id}/${section1Id}/${section2Id}/${section3Id}`;
        const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch section4 data");
      const data = await res.json();

      console.log("✅ Section4 DB data:", data);
      if (!data) return;

      // ---------- helpers ----------
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = (v ?? "");
    };

    const setScoreByGroup = (group, v) => {
      const el = document.querySelector(`.score-field[data-scoregroup="${group}"]`);
      if (el) el.value = (v ?? "");
    };

    const setChecks = (selector, values) => {
      const arr = Array.isArray(values) ? values : (values ? [values] : []);
      document.querySelectorAll(selector).forEach(cb => {
        cb.checked = arr.includes(cb.value);
      });
    };

    const setRadioByName = (name, value) => {
      if (!value) return;
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.checked = (r.value === value);
      });
    };

    // ---------- MAIN FIELDS ----------
    setVal("valuesCompleteness", data.values_completeness);
    setVal("attributeCompleteness", data.attribute_completeness);
    setVal("thematicSelectivity", data.thematic_selectivity);
    setVal("spatialVariability", data.spatial_variability);

    setVal("topoConsistency", data.topo_consistency);
    setVal("domainConsistency", data.domain_consistency);
    setVal("thematicConsistency", data.thematic_consistency);
    setVal("spatialConsistency", data.spatial_consistency);

    setVal("thematicAccuracy", data.thematic_accuracy);
    setVal("attributeAccuracy", data.attribute_accuracy);
    setVal("modelPerformance", data.model_performance);
    setVal("dataPlausibility", data.data_plausibility);

    setVal("validationMethod", data.validation_method);
    setVal("validationData", data.validation_data);
    setVal("temporalStability", data.temporal_stability);
    setVal("thematicStability", data.thematic_stability);
    setVal("spatialStability", data.spatial_stability);
    setVal("uncertaintyAnalyses", data.uncertainty_analyses);

    setVal("methodClarity", data.method_clarity);
    setVal("methodDocsLink", data.method_docs_link);
    setVal("methodReputation", data.method_reputation);
    setVal("methodTransferability", data.method_transferability);
    setVal("codeAvailability", data.code_availability);
    setVal("codeRepo", data.code_repo);
    setVal("resourcesNeeded", data.resources_needed);

    setVal("traceability", data.traceability);
    setVal("inputConsistency", data.input_consistency);
    setVal("inputDataFit", data.input_data_fit);

    // ---------- SCORES (dropdowns) ----------
    setScoreByGroup("conformance-completeness", data.completeness_score);
    setScoreByGroup("conformance-consistency", data.consistency_score);
    setScoreByGroup("conformance-accuracy", data.accuracy_score);
    setScoreByGroup("conformance-reproducibility", data.reproducibility_score);
    setScoreByGroup("conformance-inputdata", data.input_score);

    // ---------- CHECKBOXES ----------
    // inconsistency_sources + uncertainty_sources backend me arrays store ho rahe hain (pg array)
    setChecks(".inconsistency-check", data.inconsistency_sources);
    setChecks('input[name="uncertaintySources"]', data.uncertainty_sources);

    // ---------- ACCURACY TYPE RADIO + SHOW SECTION ----------
    // backend stores: positional/attribute/model/plausibility? (tumhare payload me: thematic/attribute/model/plausibility)
    if (data.accuracy_type) {
      setRadioByName("accuracyType", data.accuracy_type);

      // show/hide UI blocks like your handler does
      document.getElementById('positional-accuracy')?.classList.add('d-none');
      document.getElementById('attribute-accuracy')?.classList.add('d-none');
      document.getElementById('model-performance')?.classList.add('d-none');
      document.getElementById('data-plausibility')?.classList.add('d-none');

      const map = {
        positional: 'positional-accuracy',
        thematic: 'thematic-accuracy',
        attribute: 'attribute-accuracy',
        model: 'model-performance',
        plausibility: 'data-plausibility'
      };

      const targetId = map[data.accuracy_type];
      if (targetId) {
        document.getElementById(targetId)?.classList.remove('d-none');
        document.getElementById(targetId)?.style && (document.getElementById(targetId).style.display = "block");
      }
    }

    // ---------- INPUT DATASETS (dynamic rows) ----------
    const list = document.getElementById("input-data-list");
    if (list) {
      // remove all old rows
      list.innerHTML = "";

      const datasets = Array.isArray(data.inputdatasets)
        ? data.inputdatasets
        : Array.isArray(data.inputDatasets)
          ? data.inputDatasets
          : [];

      if (datasets.length === 0) {
        // create one empty row (same structure as HTML)
        list.innerHTML = `
          <div class="row g-2 mb-2 align-items-center input-data-entry">
            <div class="col-md-4 position-relative">
              <input autocomplete="off" class="form-control dataset-name" name="inputName[]" placeholder="Dataset Name" type="text" />
              <ul class="list-group position-absolute w-100 z-3 suggestion-list" style="top: 100%; max-height: 150px; overflow-y: auto;"></ul>
            </div>
            <div class="col-md-4">
              <input class="form-control" name="inputLink[]" placeholder="Dataset Link" type="url" />
            </div>
            <div class="col-md-3">
              <select class="form-select" name="inputScore[]">
                <option value="">Score</option>
                <option value="1">1 - Low</option>
                <option value="2">2 - Medium</option>
                <option value="3">3 - High</option>
              </select>
            </div>
            <div class="col-md-1">
              <button class="btn btn-outline-success add-input-data" type="button">+</button>
            </div>
          </div>
        `;
      } else {
        datasets.forEach((ds, idx) => {
          const row = document.createElement("div");
          row.className = "row g-2 mb-2 align-items-center input-data-entry";

          row.innerHTML = `
            <div class="col-md-4 position-relative">
              <input autocomplete="off" class="form-control dataset-name" name="inputName[]" placeholder="Dataset Name" type="text" />
              <ul class="list-group position-absolute w-100 z-3 suggestion-list" style="top: 100%; max-height: 150px; overflow-y: auto;"></ul>
            </div>
            <div class="col-md-4">
              <input class="form-control" name="inputLink[]" placeholder="Dataset Link" type="url" />
            </div>
            <div class="col-md-3">
              <select class="form-select" name="inputScore[]">
                <option value="">Score</option>
                <option value="1">1 - Low</option>
                <option value="2">2 - Medium</option>
                <option value="3">3 - High</option>
              </select>
            </div>
            <div class="col-md-1">
              <button class="btn ${idx === 0 ? "btn-outline-success add-input-data" : "btn-outline-danger remove-input-data"}" type="button">
                ${idx === 0 ? "+" : "-"}
              </button>
            </div>
          `;

          // fill values
          row.querySelector('[name="inputName[]"]').value = ds.dataset_name ?? ds.name ?? "";
          row.querySelector('[name="inputLink[]"]').value = ds.dataset_link ?? ds.link ?? "";
          row.querySelector('[name="inputScore[]"]').value = (ds.dataset_score ?? ds.score ?? "")?.toString();

          list.appendChild(row);
        });
      }
    }

    console.log("✅ Section4 refill done.");
  } catch (err) {
    console.error("❌ Error fetching Section 4 data for refill:", err);
  }
}
  // Handle previous button click to send step1=1
  document.getElementById('back4to3').addEventListener('click', function () {
    sessionStorage.setItem('step3', '1');
  });

});
