import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons, initializeTooltips } from './shared-utils.js';
import { getDataType, getEvaluationType, getProcessingLevel, subscribe } from './state.js';
import { initializePage } from './core/init.js';
import { DataManager } from './core/datamanager.js';




document.addEventListener('DOMContentLoaded', function () {
  // Initialize shared features
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();

  const section1Id = sessionStorage.getItem('section1_id');
  if (!section1Id) {
    alert('Session expired. Please start again.');
    window.location.href = 'section1.html';
    return;
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
    console.log('Section 2: Data type changed to:', dataType);
    handleDataTypeChange(dataType);
  });

  // Listen for processing level changes from section1
  window.addEventListener('processingLevelChanged', function (event) {
    const processingLevel = event.detail.processingLevel;
    console.log('Section 2: Processing level changed to:', processingLevel);
    handleProcessingLevelChange(processingLevel);
  });

  // Listen for evaluator name changes from section1
  window.addEventListener('evaluatorNameChanged', function (event) {
    const evaluatorName = event.detail.evaluatorName;
    console.log('Section 2: Evaluator name changed to:', evaluatorName);
    handleEvaluatorNameChange(evaluatorName);
  });

  // Listen for evaluation type changes from section1
  window.addEventListener('evaluationTypeChanged', function (event) {
    const evaluationType = event.detail.evaluationType;
    console.log('Section 2: Evaluation type changed to:', evaluationType);
    handleEvaluationTypeChange(evaluationType);
  });

  // Listen for aggregation level changes from section1 - CRITICAL
  window.addEventListener('aggregationLevelChanged', function (event) {
    const aggregationLevel = event.detail.aggregationLevel;
    console.log('Section 2: Aggregation level changed to:', aggregationLevel);
    handleAggregationLevelChange(aggregationLevel);
  });

  // Check current values from sessionStorage on page load
  const currentDataType = sessionStorage.getItem('dataType');
  if (currentDataType) {
    handleDataTypeChange(currentDataType);
  }

  const currentEvaluatorName = sessionStorage.getItem('evaluatorName');
  if (currentEvaluatorName) {
    handleEvaluatorNameChange(currentEvaluatorName);
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

  function handleEvaluatorNameChange(evaluatorName) {
    console.log('Section 2 updating UI for evaluator name:', evaluatorName);
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
    languageDropdown.addEventListener('change', function () {
      // DataManager.saveSection('section2', 'descriptives', { language: this.value });
      saveFormValue('language', this.value);
    });
  }

  // ---- METADATA FIELDS ----
  const documentationInput = document.getElementById('documentation');
  const accessibilityInput = document.getElementById('accessibility');
  const metadataStandardInput = document.getElementById('metadataStandard');

  if (documentationInput) {
    documentationInput.addEventListener('change', function () {
      DataManager.saveSection('section2', 'metadata', { documentation: this.value });
    });
  }

  if (accessibilityInput) {
    accessibilityInput.addEventListener('change', function () {
      DataManager.saveSection('section2', 'metadata', { accessibility: this.value });
    });
  }

  if (metadataStandardInput) {
    metadataStandardInput.addEventListener('change', function () {
      DataManager.saveSection('section2', 'metadata', { metadataStandard: this.value });
    });
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




function addKeywordBadge(keyword) {
  const keywordTags = document.getElementById('keyword-tags');
  if (!keywordTags || !keyword) return;

  const badge = document.createElement('span');
  badge.className = 'badge bg-info me-1 mb-1';
  badge.innerHTML = `${keyword} <button type="button" class="btn-close btn-close-white ms-1" aria-label="Close" style="cursor: pointer;"></button>`;

  badge.querySelector('.btn-close').addEventListener('click', () => {
    badge.remove();
    // optional: resave keywords to session if you want

  });

  keywordTags.appendChild(badge);
}


document.addEventListener("DOMContentLoaded", () => {

  // ✅ STEP2 edit check on load (coming back from section3)
  const step2Flag = parseInt(sessionStorage.getItem("step2") || "0");
  const section1Id = sessionStorage.getItem("section1_id");
  const section2Id = sessionStorage.getItem("section2_id");
  if (step2Flag === 1 && section1Id) {
    refillSection2FromDB(section2Id,section1Id);   // ✅ refill first
  }

  // ---------- WHEN USER CLICKS SAVE / NEXT ----------
  document.getElementById("section2save").addEventListener("click", async (e) => {
    e.preventDefault();

    console.log("▶ Saving Section 2...");

    // Fetch section1_id safely

    const section1Id = sessionStorage.getItem("section1_id");

    if (!section1Id) {
      alert("❌ Section 1 not found. Please complete Section 1 first.");
      window.location.href = "section1.html";
      return;
    }

    if (!section1Id) {
      alert("❌ Section 1 not found. Please complete Section 1 first.");
      return;
    }

    // ---------- COLLECT KEYWORDS ----------
    const keywordsArray = Array.from(
      document.querySelectorAll(".badge")
    ).map(b => b.textContent.replace('×', '').trim());


    // ---------- SAFE VALUE HELPER ----------
    const val = (id) => {
      const el = document.getElementById(id);
      return el && el.value ? el.value.trim() : null;
    };


    // ---------- BUILD PAYLOAD ----------
    const payload = {
      section1Id,

      identifier: val("identifier"),
      dataset_description: val("datasetDescription"),
      dataset_description_link: val("datasetDescriptionLink"),
      // keywords: JSON.stringify(keywordsArray),
      keywords: keywordsArray,


      language: (() => {
        const lang = document.getElementById("languageDropdown")?.value;
        if (!lang) return null;
        return lang === "other" ? val("languageOtherInput") : lang;
      })(),

      metadata_documentation: val("metadataDoc"),
      metadata_standards: document.getElementById("metadata-conformance")?.value || null,

      score_metadata_documentation:
        document.querySelector('.score-field[data-scoregroup="descriptives"]')?.value
          ? parseInt(document.querySelector('.score-field[data-scoregroup="descriptives"]').value)
          : null,

      access_restrictions:
        Array.from(document.querySelectorAll('.access-check'))
          .filter(cb => cb.checked)
          .map(cb => cb.value)
          .join(", ") || null,

      api_availability:
        Array.from(document.querySelectorAll('.api-radio'))
          .find(rb => rb.checked)?.value || null,

      usage_rights:
        Array.from(document.querySelectorAll('input[name="usageRights"]'))
          .find(rb => rb.checked)?.value || null,

      data_format: val("dataFormat"),

      format_standards:
        Array.from(document.querySelectorAll('input[name="formatStandards"]'))
          .find(rb => rb.checked)?.value || null,

      score_accessibility:
        document.querySelector('.score-field[data-scoregroup="accessibility"]')?.value
          ? parseInt(document.querySelector('.score-field[data-scoregroup="accessibility"]').value)
          : null,

      crs: val("crsSelect"),
      positional_accuracy: val("positionalAccuracy"),
      spatial_uncertainty: val("spatialUncertainty"),

      score_spatial_accuracy:
        document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]')?.value
          ? parseInt(document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]').value)
          : null
    };


    console.log("🚀 Section2 Payload:", payload);


    // ---------- API CALL ----------
    try {
      // const response = await fetch("http://localhost:8020/section2/section2", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload)
      // });
const section2Id = sessionStorage.getItem("section2_id");
  const step2Flag = parseInt(sessionStorage.getItem("step2") || "0");

  const isEditMode = !!section2Id && step2Flag === 1;

  const url = isEditMode
    ? `http://localhost:8020/section2/section2/${section2Id}`
    : `http://localhost:8020/section2/section2`;

  const method = isEditMode ? "PUT" : "POST";

  console.log("📌 Section2 Save Mode:", isEditMode ? "UPDATE" : "CREATE", { url, method });

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Error saving Section2:", result);
        alert("❌ Failed to save Section 2: " + result.message);
        return;
      }
      console.log("✅ Section 2 saved!", result);
      // 🔑 Save Section2 ID to sessionStorage
      sessionStorage.setItem("section2_id", result.id);
      sessionStorage.setItem("step2", "0");
      window.location.href = "section3.html";

    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Network error saving Section 2.");
    }
  });

  // Handle previous button click to send step1=1
  document.getElementById('back2to1').addEventListener('click', function () {
    sessionStorage.setItem('step1', '1');
  });

  // ================== REFILL FUNCTION INSIDE DOM ==================
  async function refillSection2FromDB(section2Id,section1Id) {
    try {
      const res = await fetch(`http://localhost:8020/section2/bySection1/${section2Id}/${section1Id}`);
      if (!res.ok) throw new Error("Failed to fetch section2 data");
      const data = await res.json();
      console.log("✅ Section2 DB data:", data);

      if (!data) return;

      const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };

      const setRadio = (selector, value) => {
        if (!value) return;
        const radios = document.querySelectorAll(selector);
        radios.forEach(r => r.checked = (r.value === value));
      };

      const setChecksFromCSV = (selector, csv) => {
        const values = (csv || '').split(',').map(s => s.trim()).filter(Boolean);
        document.querySelectorAll(selector).forEach(cb => {
          cb.checked = values.includes(cb.value);
        });
      };

      // ---------- normal inputs ----------
      setVal("identifier", data.identifier);
      setVal("datasetDescription", data.dataset_description);
      setVal("datasetDescriptionLink", data.dataset_description_link);

      setVal("metadataDoc", data.metadata_documentation);
      setVal("metadata-conformance", data.metadata_standards);

      setVal("dataFormat", data.data_format);
      setVal("crsSelect", data.crs);
      setVal("positionalAccuracy", data.positional_accuracy);
      setVal("spatialUncertainty", data.spatial_uncertainty);

      // ---------- language ----------
      setVal("languageDropdown", data.language);

      // ✅ Trigger language UI (if "other" container exists in your code)
      document.getElementById("languageDropdown")?.dispatchEvent(new Event("change", { bubbles: true }));

      // ---------- scores ----------
      const scoreMeta = document.querySelector('.score-field[data-scoregroup="descriptives"]');
      if (scoreMeta) scoreMeta.value = data.score_metadata_documentation ?? '';

      const scoreAcc = document.querySelector('.score-field[data-scoregroup="accessibility"]');
      if (scoreAcc) scoreAcc.value = data.score_accessibility ?? '';

      const scoreSpatial = document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]');
      if (scoreSpatial) scoreSpatial.value = data.score_spatial_accuracy ?? '';

      // ---------- radios ----------
      setRadio('.api-radio', data.api_availability);
      setRadio('input[name="usageRights"]', data.usage_rights);
      setRadio('input[name="formatStandards"]', data.format_standards);

      // ---------- checkboxes ----------
      setChecksFromCSV('.access-check', data.access_restrictions);

      // ---------- keywords ----------
      // const keywordTags = document.getElementById('keyword-tags');
      // if (keywordTags) keywordTags.innerHTML = '';

      // let keywordsArr = [];
      // try {
      //   keywordsArr = data.keywords ? JSON.parse(data.keywords) : [];
      // } catch (e) {
      //   keywordsArr = [];
      // }

      // keywordsArr.forEach(k => addKeywordBadge(k));
      // ---------- keywords ----------
      const keywordTags = document.getElementById('keyword-tags');
      if (keywordTags) keywordTags.innerHTML = '';

      let keywordsArr = [];

      if (Array.isArray(data.keywords)) {
        keywordsArr = data.keywords;                // ✅ your case
      } else if (typeof data.keywords === "string" && data.keywords.trim()) {
        // if stored as JSON string
        try {
          keywordsArr = JSON.parse(data.keywords);
          if (typeof keywordsArr === "string") keywordsArr = JSON.parse(keywordsArr);
        } catch (e) {
          // fallback CSV
          keywordsArr = data.keywords.split(",").map(s => s.trim()).filter(Boolean);
        }
      }

      console.log("✅ parsed keywords:", keywordsArr);

      keywordsArr.forEach(k => addKeywordBadge(k));

      console.log("keywords raw:", data.keywords, typeof data.keywords);
      console.log("✅ Section2 refill done.");
    } catch (err) {
      console.error("❌ Refill section2 error:", err);
    }
  }

});

