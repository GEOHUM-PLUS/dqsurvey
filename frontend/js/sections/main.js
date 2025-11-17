// Helper function to get all stored surveys from localStorage
function getAllStoredSurveys() {
  const surveys = [];
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('surveyData_')) {
      try {
        const surveyData = JSON.parse(localStorage.getItem(key));
        if (surveyData) {
          surveys.push(surveyData);
        }
      } catch (error) {
        console.warn(`Failed to parse survey data for key ${key}:`, error);
      }
    }
  });
  
  // Sort by creation date (newest first)
  surveys.sort((a, b) => {
    const dateA = new Date(a.timestamps?.created || 0);
    const dateB = new Date(b.timestamps?.created || 0);
    return dateB - dateA;
  });
  
  return surveys;
}

// Updated script_new.js with full dynamic behavior & summary
document.addEventListener('DOMContentLoaded', function () {
  
  // ---- COMPREHENSIVE DATA MANAGEMENT SYSTEM ----
  const DataManager = {
    // Initialize data structure
    init() {
      if (!localStorage.getItem('surveyData')) {
        const initialData = {
          section1: {
            basic: {},
            useCase: {},
            spatial: {},
            aoi: {}
          },
          section2: {
            descriptives: {},
            metadata: {},
            keywords: []
          },
          section3: {
            spatialResolution: {},
            spatialCoverage: {},
            timeliness: {}
          },
          section4: {
            conformance: {}
          },
          section5: {
            context: {}
          },
          scores: {
            byGroup: {},
            bySection: {},
            overall: null
          },
          timestamps: {
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        };
        localStorage.setItem('surveyData', JSON.stringify(initialData));
      }
    },
    
    // Get all survey data
    getData() {
      return JSON.parse(localStorage.getItem('surveyData') || '{}');
    },
    
    // Save data to specific section
    saveSection(sectionKey, subsectionKey, data) {
      const surveyData = this.getData();
      if (!surveyData[sectionKey]) surveyData[sectionKey] = {};
      if (subsectionKey) {
        surveyData[sectionKey][subsectionKey] = { ...surveyData[sectionKey][subsectionKey], ...data };
      } else {
        surveyData[sectionKey] = { ...surveyData[sectionKey], ...data };
      }
      surveyData.timestamps.lastModified = new Date().toISOString();
      localStorage.setItem('surveyData', JSON.stringify(surveyData));
    },
    
    // Get data from specific section
    getSection(sectionKey, subsectionKey) {
      const data = this.getData();
      if (subsectionKey) {
        return data[sectionKey]?.[subsectionKey] || {};
      }
      return data[sectionKey] || {};
    },
    
    // Save scoring data
    saveScore(fieldId, value, scoreGroup, section) {
      const surveyData = this.getData();
      if (!surveyData.scores.byGroup[scoreGroup]) {
        surveyData.scores.byGroup[scoreGroup] = [];
      }
      if (!surveyData.scores.bySection[section]) {
        surveyData.scores.bySection[section] = {};
      }
      
      // Remove existing score for this field
      surveyData.scores.byGroup[scoreGroup] = surveyData.scores.byGroup[scoreGroup].filter(s => s.fieldId !== fieldId);
      
      if (value && value !== '') {
        surveyData.scores.byGroup[scoreGroup].push({
          fieldId: fieldId,
          value: parseInt(value),
          section: section,
          timestamp: new Date().toISOString()
        });
        surveyData.scores.bySection[section][fieldId] = parseInt(value);
      }
      
      this.calculateOverallScore(surveyData);
      surveyData.timestamps.lastModified = new Date().toISOString();
      localStorage.setItem('surveyData', JSON.stringify(surveyData));
    },
    
    // Calculate overall score
    calculateOverallScore(surveyData) {
      const allScores = [];
      Object.values(surveyData.scores.byGroup).forEach(groupScores => {
        groupScores.forEach(score => allScores.push(score.value));
      });
      surveyData.scores.overall = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
    },
    
    // Collect all form data from current page
    collectCurrentPageData() {
      const currentPage = window.location.pathname.split('/').pop();
      const formData = {};
      
      // Collect all form inputs
      document.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.id && element.value) {
          formData[element.id] = element.value;
        }
      });
      
      // Collect checkboxes and radio buttons
      document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(element => {
        if (element.id) {
          formData[element.id] = element.checked;
        }
      });
      
      // Collect keywords if present
      const keywordTags = document.getElementById('keyword-tags');
      if (keywordTags) {
        const keywords = Array.from(keywordTags.querySelectorAll('.badge')).map(badge => badge.textContent);
        formData.keywords = keywords;
      }
      
      return formData;
    },
    
    // Restore form data to current page
    restoreCurrentPageData() {
      const currentPage = window.location.pathname.split('/').pop();
      let sectionKey = '';
      
      switch (currentPage) {
        case 'section1.html': sectionKey = 'section1'; break;
        case 'section2.html': sectionKey = 'section2'; break;
        case 'section3.html': sectionKey = 'section3'; break;
        case 'section4.html': sectionKey = 'section4'; break;
        case 'section5.html': sectionKey = 'section5'; break;
        default: return;
      }
      
      const sectionData = this.getSection(sectionKey);
      this.populateFormFields(sectionData);
    },
    
    // Populate form fields with saved data
    populateFormFields(data) {
      Object.entries(data).forEach(([subsection, subsectionData]) => {
        if (typeof subsectionData === 'object' && subsectionData !== null) {
          Object.entries(subsectionData).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
              if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = value;
              } else {
                element.value = value;
              }
            }
          });
        }
      });
      
      // Restore keywords if present
      if (data.descriptives?.keywords) {
        const keywordTags = document.getElementById('keyword-tags');
        if (keywordTags) {
          keywordTags.innerHTML = '';
          data.descriptives.keywords.forEach(keyword => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary me-1';
            badge.textContent = keyword;
            badge.style.cursor = 'pointer';
            badge.title = 'Click to remove';
            badge.addEventListener('click', () => badge.remove());
            keywordTags.appendChild(badge);
          });
        }
      }
    }
  };
  
  // Initialize data management system
  DataManager.init();
  
  // ---- Inject overlay and fade-in effect ----
  // Add fade-in effect to main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }

  // Add overlay if not present
  if (!document.querySelector('.overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  // ---- CONFORMANCE TOGGLE (Primary vs Products) - with localStorage persistence ----
  const dataProcessingLevel = document.getElementById('dataprocessinglevel');
  
  function applyConformanceVisibility(processingLevel) {
    // Show/hide conformance section and nav bar item
    const conf = document.getElementById('conformance');
    const toc = document.getElementById('conformance-toc');
    const navConf = document.getElementById('nav-conformance');
    
    console.log('applyConformanceVisibility called with:', processingLevel);
    console.log('conformance element:', conf);
    console.log('toc element:', toc);
    console.log('navConf element:', navConf);
    
    if (processingLevel === 'primary') {
      console.log('Hiding conformance (primary data selected)');
      if (conf) conf.classList.add('d-none');
      if (toc) toc.classList.add('d-none');
      if (navConf) navConf.classList.add('d-none');
    } else if (processingLevel === 'products' || processingLevel === '') {
      console.log('Showing conformance (data products selected or empty)');
      if (conf) conf.classList.remove('d-none');
      if (toc) toc.classList.remove('d-none');
      if (navConf) navConf.classList.remove('d-none');
    }
  }
  
  function toggleConformance() {
    if (!dataProcessingLevel) return;
    
    const selectedValue = dataProcessingLevel.value;
    console.log('toggleConformance called, selected value:', selectedValue);
    
    // Save to localStorage
    if (selectedValue) {
      localStorage.setItem('dataProcessingLevel', selectedValue);
    } else {
      localStorage.removeItem('dataProcessingLevel');
    }
    
    // Apply visibility
    applyConformanceVisibility(selectedValue);
    
    // Update navigation buttons immediately
    updateNavigationButtons();
  }
  
  // Initialize conformance visibility on page load (for all pages)
  function initializeConformanceVisibility() {
    const savedProcessingLevel = localStorage.getItem('dataProcessingLevel');
    console.log('Initializing conformance visibility, saved value:', savedProcessingLevel);
    
    // Apply the saved setting
    if (savedProcessingLevel) {
      applyConformanceVisibility(savedProcessingLevel);
      
      // Also set the dropdown value if we're on section1
      if (dataProcessingLevel) {
        dataProcessingLevel.value = savedProcessingLevel;
      }
    } else {
      // Default to showing conformance if no selection made
      applyConformanceVisibility('');
    }
  }
  
  // Set up event listener only if we're on the page with the dropdown
  if (dataProcessingLevel) {
    dataProcessingLevel.addEventListener('change', toggleConformance);
  }
  
  // Always initialize conformance visibility on every page
  initializeConformanceVisibility();

  // ---- SMART NAVIGATION: Skip conformance section when hidden ----
  function updateNavigationButtons() {
    const savedProcessingLevel = localStorage.getItem('dataProcessingLevel');
    const isConformanceHidden = savedProcessingLevel === 'primary';
    
    console.log('updateNavigationButtons called, isConformanceHidden:', isConformanceHidden);
    
    // Update navigation buttons to skip section4 if conformance is hidden
    const currentPage = window.location.pathname.split('/').pop();
    
    // Update "Next" buttons to skip section4 if conformance is hidden
    if (currentPage === 'section3.html' && isConformanceHidden) {
      // Look for next button that goes to section4
      const nextBtns = document.querySelectorAll('a[href="section4.html"]');
      nextBtns.forEach(btn => {
        if (btn.classList.contains('btn-next') || btn.textContent.includes('Next')) {
          btn.href = 'section5.html';
          if (btn.textContent.includes('Next Section')) {
            btn.innerHTML = btn.innerHTML.replace('Next Section', 'Skip to Context');
          }
          console.log('Updated next button on section3 to skip to section5');
        }
      });
    }
    
    // Update "Previous" buttons to skip section4 if conformance is hidden
    if (currentPage === 'section5.html' && isConformanceHidden) {
      // Look for previous button that goes to section4
      const prevBtns = document.querySelectorAll('a[href="section4.html"]');
      prevBtns.forEach(btn => {
        if (btn.classList.contains('btn-previous') || btn.textContent.includes('Previous')) {
          btn.href = 'section3.html';
          if (btn.textContent.includes('Previous')) {
            btn.innerHTML = btn.innerHTML.replace('Previous', 'Back to Design');
          }
          console.log('Updated previous button on section5 to go back to section3');
        }
      });
    }
    
    // Reset navigation buttons if conformance is shown
    if (!isConformanceHidden) {
      // Reset section3 next button
      if (currentPage === 'section3.html') {
        const nextBtns = document.querySelectorAll('a[href="section5.html"]');
        nextBtns.forEach(btn => {
          if (btn.classList.contains('btn-next')) {
            btn.href = 'section4.html';
            btn.innerHTML = btn.innerHTML.replace('Skip to Context', 'Next Section');
          }
        });
      }
      
      // Reset section5 previous button
      if (currentPage === 'section5.html') {
        const prevBtns = document.querySelectorAll('a[href="section3.html"]');
        prevBtns.forEach(btn => {
          if (btn.classList.contains('btn-previous')) {
            btn.href = 'section4.html';
            btn.innerHTML = btn.innerHTML.replace('Back to Design', 'Previous');
          }
        });
      }
    }
  }
  
  // Call navigation update after conformance initialization
  updateNavigationButtons();

  // ---- SECTION 4 ACCESS CONTROL ----
  // If user tries to access section4 directly when conformance should be hidden
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'section4.html') {
    const savedProcessingLevel = localStorage.getItem('dataProcessingLevel');
    if (savedProcessingLevel === 'primary') {
      // Show warning and redirect
      const conformanceSection = document.getElementById('conformance');
      if (conformanceSection) {
        conformanceSection.innerHTML = `
          <div class="alert alert-warning" role="alert">
            <h4 class="alert-heading">Section Not Available</h4>
            <p>The Conformance section is not applicable for Primary Data. You selected "Primary Data" in the Initial Information section.</p>
            <hr>
            <p class="mb-0">
              <a href="section1.html" class="btn btn-primary">Go back to Initial Info</a>
              <a href="section3.html" class="btn btn-secondary">Continue to Design</a>
              <a href="section5.html" class="btn btn-secondary">Skip to Context</a>
            </p>
          </div>
        `;
      }
    }
  }

  // ---- USE-CASE vs GENERAL ----
  const evaluationType = document.getElementById('evaluationType');
  const useCaseSection = document.getElementById('use-case-section');
  
  function toggleUseCase() {
    // Get evaluation type from current form or saved data
    let isUseCase = false;
    if (evaluationType && evaluationType.value) {
      isUseCase = evaluationType.value === 'use-case-adequacy';
      // Save to localStorage and DataManager
      localStorage.setItem('evaluationType', evaluationType.value);
      DataManager.saveSection('section1', 'basic', { evaluationType: evaluationType.value });
    } else {
      // Check saved data if no current form value
      const savedEvaluationType = localStorage.getItem('evaluationType') || DataManager.getSection('section1', 'basic').evaluationType;
      isUseCase = savedEvaluationType === 'use-case-adequacy';
    }
    
    console.log('toggleUseCase called, isUseCase:', isUseCase);
    
    // Toggle visibility in Section 1
    if (useCaseSection) useCaseSection.style.display = isUseCase ? 'block' : 'none';
    
    // Toggle visibility across all sections
    document.querySelectorAll('.use-case-only').forEach(el => {
      el.style.display = isUseCase ? 'block' : 'none';
      console.log('Setting use-case-only element to:', isUseCase ? 'block' : 'none', el);
    });
    
    document.querySelectorAll('.general-design-only').forEach(el => {
      el.style.display = isUseCase ? 'none' : 'block';
      console.log('Setting general-design-only element to:', isUseCase ? 'none' : 'block', el);
    });
    
    document.querySelectorAll('.general-quality-only').forEach(el => {
      el.style.display = isUseCase ? 'none' : 'block';
      console.log('Setting general-quality-only element to:', isUseCase ? 'none' : 'block', el);
    });
    
    // Auto-fill use-case optimum date into design timeliness subsection
    const opt = document.getElementById('optimumDataCollection');
    const out = document.getElementById('optimumCollectionAuto');
    if (opt && out) {
      out.value = opt.value || '';
    } else {
      // Try to get from saved data
      const savedOptimumDate = localStorage.getItem('optimumDataCollection') || DataManager.getSection('section1', 'useCase').optimumDataCollection;
      if (out && savedOptimumDate) {
        out.value = savedOptimumDate;
      }
    }
    
    // Auto-populate optimal resolution for use-case evaluations
    if (isUseCase) {
      autoPopulateOptimalResolution();
    }
  }
  
  // Initialize use-case toggle based on saved data (for all pages)
  function initializeUseCaseToggle() {
    const savedEvaluationType = localStorage.getItem('evaluationType') || DataManager.getSection('section1', 'basic').evaluationType;
    console.log('Initializing use-case toggle, saved evaluation type:', savedEvaluationType);
    
    // Set the dropdown value if we're on section1
    if (evaluationType && savedEvaluationType) {
      evaluationType.value = savedEvaluationType;
    }
    
    // Apply the visibility toggle
    toggleUseCase();
  }
  
  // Set up event listener only if we're on the page with the dropdown
  if (evaluationType) {
    evaluationType.addEventListener('change', toggleUseCase);
  }
  
  // Always initialize use-case toggle on every page
  initializeUseCaseToggle();
  
  const optimumDate = document.getElementById('optimumDataCollection');
  if (optimumDate) {
    optimumDate.addEventListener('change', () => {
      localStorage.setItem('optimumDataCollection', optimumDate.value);
      DataManager.saveSection('section1', 'useCase', { optimumDataCollection: optimumDate.value });
      toggleUseCase();
    });
  }

  // ---- AOI METHOD TOGGLE ----
  const aoiType = document.getElementById('aoiType');
  function toggleAOI() {
    const val = aoiType ? aoiType.value : '';
    ['dropdown','coordinates','upload'].forEach(type => {
      const el = document.getElementById(`aoi-${type}`);
      if (el) el.style.display = (val === type) ? 'block' : 'none';
    });
  }
  if (aoiType) {
    aoiType.addEventListener('change', toggleAOI);
    toggleAOI();
  }

  // ---- DATA TYPE TOGGLE: resolution inputs, RS-only blocks, accuracy inputs ----
  const dataType = document.getElementById('dataType');
  function toggleDataType() {
    const savedDataType = localStorage.getItem('dataType') || (dataType ? dataType.value : '');
    const isRS = savedDataType === 'remote-sensing';
    const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? 'block' : 'none'; };
    
    // Section 1 resolution inputs
    show('pixel-size-input', isRS);
    show('grid-size-input', !isRS && savedDataType !== '');
    show('aggregation-level-input', !isRS && savedDataType !== '');
    
    // Section 3 resolution inputs - auto-select based on data type
    toggleSpatialResolutionInputs(savedDataType);
    
    document.querySelectorAll('.remote-sensing-only').forEach(el => el.style.display = isRS ? 'block' : 'none');

    // Accuracy subforms
    show('thematic-accuracy', isRS);
    show('attribute-accuracy', savedDataType === 'gis');
    show('model-performance', savedDataType === 'model-ml' || savedDataType === 'prediction');
    show('data-plausibility', savedDataType === 'survey' || savedDataType === 'other');
  }
  
  // Save data type to localStorage when changed
  if (dataType) {
    dataType.addEventListener('change', () => {
      localStorage.setItem('dataType', dataType.value);
      toggleDataType();
    });
    toggleDataType();
  }
  
  // ---- SPATIAL RESOLUTION INPUTS (Section 3) ----
  function toggleSpatialResolutionInputs(dataTypeValue) {
    const savedDataType = dataTypeValue || localStorage.getItem('dataType');
    const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? 'block' : 'none'; };
    
    // Show appropriate resolution input based on data type
    if (savedDataType === 'remote-sensing') {
      show('pixel-resolution', true);
      show('grid-resolution', false);
      show('aggregation-resolution', false);
      show('manual-resolution-selection', false);
    } else if (savedDataType && savedDataType !== '' && savedDataType !== 'other') {
      show('pixel-resolution', false);
      show('grid-resolution', false);
      show('aggregation-resolution', true);
      show('manual-resolution-selection', false);
    } else if (savedDataType === 'other' || !savedDataType) {
      // Show manual selection for 'other' data type or when no data type is set
      show('pixel-resolution', false);
      show('grid-resolution', false);
      show('aggregation-resolution', false);
      show('manual-resolution-selection', true);
    }
    
    // Auto-populate optimal resolution for use-case evaluations
    autoPopulateOptimalResolution();
    
    // Set up automatic scoring suggestion
    setupAutomaticScoring();
  }
  
  // Manual resolution type selection
  document.querySelectorAll('input[name="resolutionType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? 'block' : 'none'; };
      show('pixel-resolution', radio.value === 'pixel');
      show('grid-resolution', radio.value === 'grid');
      show('aggregation-resolution', radio.value === 'aggregation');
    });
  });
  
  // Initialize spatial resolution inputs on page load
  toggleSpatialResolutionInputs();
  
  // ---- AUTO-POPULATE OPTIMAL RESOLUTION FOR USE-CASE ----
  function autoPopulateOptimalResolution() {
    const savedEvaluationType = localStorage.getItem('evaluationType') || DataManager.getSection('section1', 'basic').evaluationType;
    const savedDataType = localStorage.getItem('dataType') || DataManager.getSection('section1', 'basic').dataType;
    
    console.log('autoPopulateOptimalResolution called, evaluationType:', savedEvaluationType, 'dataType:', savedDataType);
    
    if (savedEvaluationType === 'use-case-adequacy') {
      const optimalResolutionField = document.getElementById('optimalResolution');
      if (!optimalResolutionField) {
        console.log('optimalResolution field not found');
        return;
      }
      
      let optimalValue = '';
      
      // Get spatial data from both localStorage and DataManager
      const spatialData = DataManager.getSection('section1', 'spatial');
      
      if (savedDataType === 'remote-sensing') {
        const pixelSize = localStorage.getItem('pixelSize') || spatialData.pixelSize;
        if (pixelSize) {
          optimalValue = `${pixelSize} m`;
          console.log('Set optimal pixel size:', optimalValue);
        }
      } else if (savedDataType && savedDataType !== 'other') {
        // For aggregation-based data types (census, survey, administrative, etc.)
        const aggregationLevel = localStorage.getItem('aggregationLevel') || spatialData.aggregationLevel;
        if (aggregationLevel) {
          const levelNames = {
            'household': 'Household level',
            'city': 'City level', 
            'region': 'Regional level',
            'country': 'Country level'
          };
          optimalValue = levelNames[aggregationLevel] || (aggregationLevel.charAt(0).toUpperCase() + aggregationLevel.slice(1));
          console.log('Set optimal aggregation level:', optimalValue);
        }
      } else {
        // For grid-based or other/unknown data types
        const gridSize = localStorage.getItem('gridSize') || spatialData.gridSize;
        if (gridSize) {
          optimalValue = `${gridSize} m`;
          console.log('Set optimal grid size:', optimalValue);
        }
      }
      
      if (optimalValue) {
        optimalResolutionField.value = optimalValue;
        console.log('Populated optimal resolution field with:', optimalValue);
      } else {
        console.log('No optimal resolution value found');
      }
      
      // Trigger spatial deviation calculation
      calcSpatialDeviation();
    }
  }
  
  // ---- AUTOMATIC SCORING SUGGESTION ----
  function setupAutomaticScoring() {
    const pixelInput = document.getElementById('pixelResolutionValue');
    const gridInput = document.getElementById('gridResolutionValue');
    const aggregationSelect = document.getElementById('aggregationResolutionLevel');
    const scoreSelect = document.getElementById('generalResolutionScore');
    const suggestionDiv = document.getElementById('auto-score-suggestion');
    
    function suggestScore() {
      if (!scoreSelect || !suggestionDiv) return;
      
      let suggestedScore = null;
      let explanation = '';
      
      // Check pixel resolution (Remote Sensing)
      if (pixelInput && pixelInput.value && pixelInput.offsetParent !== null) {
        const pixelValue = parseFloat(pixelInput.value);
        if (pixelValue > 30) {
          suggestedScore = 1;
          explanation = 'Pixel size > 30m suggests score 1';
        } else if (pixelValue >= 5) {
          suggestedScore = 2;
          explanation = 'Pixel size 5-30m suggests score 2';
        } else if (pixelValue >= 1) {
          suggestedScore = 3;
          explanation = 'Pixel size 1-5m suggests score 3';
        } else {
          suggestedScore = 4;
          explanation = 'Pixel size < 1m suggests score 4';
        }
      }
      
      // Check grid resolution (Other data types)
      if (gridInput && gridInput.value && gridInput.offsetParent !== null) {
        const gridValue = parseFloat(gridInput.value);
        if (gridValue > 30) {
          suggestedScore = 1;
          explanation = 'Grid size > 30m suggests score 1';
        } else if (gridValue >= 5) {
          suggestedScore = 2;
          explanation = 'Grid size 5-30m suggests score 2';
        } else if (gridValue >= 1) {
          suggestedScore = 3;
          explanation = 'Grid size 1-5m suggests score 3';
        } else {
          suggestedScore = 4;
          explanation = 'Grid size < 1m suggests score 4';
        }
      }
      
      // Check aggregation level
      if (aggregationSelect && aggregationSelect.value && aggregationSelect.offsetParent !== null) {
        switch (aggregationSelect.value) {
          case 'country':
            suggestedScore = 1;
            explanation = 'Country/Federation level suggests score 1';
            break;
          case 'region':
            suggestedScore = 2;
            explanation = 'Region/Province/State level suggests score 2';
            break;
          case 'city':
            suggestedScore = 3;
            explanation = 'City/District/Village level suggests score 3';
            break;
          case 'household':
            suggestedScore = 4;
            explanation = 'Household level suggests score 4';
            break;
        }
      }
      
      // Display suggestion
      if (suggestedScore && explanation) {
        suggestionDiv.style.display = 'block';
        suggestionDiv.innerHTML = `<span class="text-info"><i class="fas fa-lightbulb"></i> Suggested: ${explanation}</span>`;
        suggestionDiv.className = 'form-text text-info';
      } else {
        suggestionDiv.style.display = 'none';
      }
    }
    
    // Add event listeners for automatic scoring suggestion
    if (pixelInput) pixelInput.addEventListener('input', suggestScore);
    if (gridInput) gridInput.addEventListener('input', suggestScore);
    if (aggregationSelect) aggregationSelect.addEventListener('change', suggestScore);
  }

  // ---- METADATA: Conformance -> show standards; also auto-fill format standards ----
  const metadataConformance = document.getElementById('metadata-conformance');
  function handleMetaConf() {
    const val = metadataConformance ? metadataConformance.value : '';
    const fieldset = document.getElementById('metadata-standards');
    if (fieldset) fieldset.style.display = (val === 'yes') ? 'block' : 'none';
    const formatYes = document.getElementById('formatYes');
    if (formatYes) formatYes.checked = (val === 'yes');
  }
  if (metadataConformance) {
    metadataConformance.addEventListener('change', handleMetaConf);
    handleMetaConf();
  }

  // Metadata 'Other' standard control
  const metaOther = document.getElementById('metadata-other');
  const metaOtherContainer = document.getElementById('metadata-other-container');
  const addOtherBtn = document.getElementById('add-other-standard');
  
  // ---- LANGUAGE OTHER OPTION ----
  const languageDropdown = document.getElementById('languageDropdown');
  const languageOtherContainer = document.getElementById('language-other-container');
  if (languageDropdown && languageOtherContainer) {
    languageDropdown.addEventListener('change', () => {
      languageOtherContainer.style.display = (languageDropdown.value === 'other') ? 'block' : 'none';
    });
  }
  
  // ---- DATA TYPE OTHER OPTION ----
  const dataTypeOtherContainer = document.getElementById('datatype-other-container');
  if (dataType && dataTypeOtherContainer) {
    const originalToggleDataType = toggleDataType;
    toggleDataType = function() {
      originalToggleDataType();
      dataTypeOtherContainer.style.display = (dataType.value === 'other') ? 'block' : 'none';
    };
    
    // Also add direct event listener for consistency
    dataType.addEventListener('change', () => {
      dataTypeOtherContainer.style.display = (dataType.value === 'other') ? 'block' : 'none';
    });
  }
  if (metaOther && metaOtherContainer) {
    metaOther.addEventListener('change', () => {
      metaOtherContainer.style.display = metaOther.checked ? 'block' : 'none';
    });
  }
  if (addOtherBtn && metaOtherContainer) {
    addOtherBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control mt-2';
      input.name = 'metadata-standard-other[]';
      input.placeholder = 'Describe other standard';
      metaOtherContainer.appendChild(input);
    });
  }

  // ---- ACCESS RESTRICTIONS: show details when 'Other' is checked ----
  const accessOther = document.getElementById('accessOther');
  const accessOtherDetails = document.getElementById('accessOtherDetails');
  function toggleAccessOther() {
    if (accessOtherDetails) accessOtherDetails.style.display = accessOther && accessOther.checked ? 'block' : 'none';
  }
  if (accessOther) {
    accessOther.addEventListener('change', toggleAccessOther);
    toggleAccessOther();
  }

  // ---- API AVAILABILITY: show details when not manual ----
  document.querySelectorAll('.api-radio').forEach(r => {
    r.addEventListener('change', () => {
      const details = document.getElementById('apiDetails');
      if (details) details.style.display = (r.value !== 'manual' && r.checked) ? 'block' : (r.value === 'manual' && r.checked) ? 'none' : details.style.display;
    });
  });

  // ---- CRS Other ----
  const crsSelect = document.getElementById('crsSelect');
  const crsOtherDetails = document.getElementById('crsOtherDetails');
  function toggleCRSOther() {
    if (!crsSelect || !crsOtherDetails) return;
    crsOtherDetails.style.display = (crsSelect.value === 'Other') ? 'block' : 'none';
  }
  if (crsSelect) {
    crsSelect.addEventListener('change', toggleCRSOther);
    toggleCRSOther();
  }

  // ---- Inconsistency & Uncertainty 'Other' ----
  const inconsistencyOther = document.getElementById('inconsistencyOther');
  const inconsistencyOtherText = document.getElementById('inconsistencyOtherText');
  if (inconsistencyOther && inconsistencyOtherText) {
    inconsistencyOther.addEventListener('change', () => {
      inconsistencyOtherText.style.display = inconsistencyOther.checked ? 'block' : 'none';
    });
  }
  const uncertaintyOther = document.getElementById('uncertaintyOther');
  const uncertaintyOtherText = document.getElementById('uncertaintyOtherText');
  if (uncertaintyOther && uncertaintyOtherText) {
    uncertaintyOther.addEventListener('change', () => {
      uncertaintyOtherText.style.display = uncertaintyOther.checked ? 'block' : 'none';
    });
  }

  // ---- Strengths / Limitations / Constraints add-remove ----
  function addListHandlers(wrapperId, addClass, removeClass, placeholder) {
    const wrap = document.getElementById(wrapperId);
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      if (e.target.classList.contains(addClass)) {
        const container = document.createElement('div');
        container.className = 'input-group mb-2';
        container.innerHTML = `<input type="text" class="form-control" placeholder="${placeholder}">
          <button type="button" class="btn btn-outline-danger ${removeClass}">–</button>`;
        wrap.appendChild(container);
      }
      if (e.target.classList.contains(removeClass)) {
        e.target.parentElement.remove();
      }
    });
  }
  addListHandlers('strength-list','add-strength','remove-strength','Additional Strength');
  addListHandlers('limitation-list','add-limitation','remove-limitation','Additional Limitation');
  addListHandlers('constraint-list','add-constraint','remove-constraint','Additional Constraint');

  // ---- Input Data dynamic rows + autocomplete ----
  const inputDataList = document.getElementById('input-data-list');
  const datasetSuggestions = [
    "Sentinel-1", "Sentinel-2", "MODIS", "Landsat 8", "Landsat 9",
    "VIIRS", "Copernicus DEM", "ASTER", "SRTM", "CHIRPS", "GPM"
  ];
  function createInputDataRow() {
    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 align-items-center input-data-entry';
    row.innerHTML = `
      <div class="col-md-4 position-relative">
        <input type="text" class="form-control dataset-name" name="inputName[]" placeholder="Dataset Name" autocomplete="off">
        <ul class="list-group position-absolute w-100 z-3 suggestion-list" style="top: 100%; max-height: 150px; overflow-y: auto;"></ul>
      </div>
      <div class="col-md-4">
        <input type="url" class="form-control" name="inputLink[]" placeholder="Dataset Link">
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
        <button type="button" class="btn btn-outline-danger remove-input-data">–</button>
      </div>`;
    return row;
  }
  if (inputDataList) {
    inputDataList.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-input-data')) {
        inputDataList.appendChild(createInputDataRow());
      }
      if (e.target.classList.contains('remove-input-data')) {
        e.target.closest('.input-data-entry').remove();
      }
    });

    inputDataList.addEventListener('input', (e) => {
      if (e.target.classList.contains('dataset-name')) {
        const input = e.target;
        const list = input.nextElementSibling;
        const value = input.value.toLowerCase();
        list.innerHTML = '';
        if (!value) return;
        const matches = datasetSuggestions.filter(ds => ds.toLowerCase().startsWith(value));
        matches.forEach(match => {
          const li = document.createElement('li');
          li.className = 'list-group-item list-group-item-action';
          li.textContent = match;
          li.addEventListener('click', () => { input.value = match; list.innerHTML = ''; });
          list.appendChild(li);
        });
      }
    });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('dataset-name')) {
      document.querySelectorAll('.suggestion-list').forEach(el => el.innerHTML = '');
    }
  });

  // ---- Keyword tags simple helper ----
  const kwInput = document.getElementById('keyword-input');
  const kwTags = document.getElementById('keyword-tags');
  const kwSuggest = document.getElementById('suggestions');
  const kwBank = ['flood', 'land cover','elevation','precipitation','temperature','population','roads','cloud','DEM','forest','urban'];
  function addTag(text) {
    const badge = document.createElement('span');
    badge.className = 'badge bg-secondary me-1';
    badge.textContent = text;
    badge.style.cursor = 'pointer';
    badge.title = 'Click to remove';
    badge.addEventListener('click', () => badge.remove());
    kwTags.appendChild(badge);
  }
  if (kwInput && kwSuggest) {
    kwInput.addEventListener('input', () => {
      const v = kwInput.value.trim().toLowerCase();
      kwSuggest.style.display = v ? 'block' : 'none';
      kwSuggest.innerHTML = '';
      if (!v) return;
      kwBank.filter(k => k.startsWith(v)).forEach(k => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = k;
        li.addEventListener('click', () => { addTag(k); kwSuggest.style.display='none'; kwInput.value=''; });
        kwSuggest.appendChild(li);
      });
    });
    kwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && kwInput.value.trim()) {
        addTag(kwInput.value.trim()); kwInput.value=''; e.preventDefault();
      }
    });
    document.addEventListener('click', (e) => {
      if (!kwSuggest.contains(e.target) && e.target !== kwInput) kwSuggest.style.display = 'none';
    });
  }

  // ---- Auto calculations (coverage & deviations) ----
  function calcCoverageDeviation() {
    const cov = parseFloat(document.getElementById('aoiCoverage')?.value || 'NaN');
    const out = document.getElementById('coverageDeviation');
    if (isFinite(cov) && out) out.value = `${Math.max(0, 100 - cov).toFixed(1)} %`;
  }
  const aoiCoverage = document.getElementById('aoiCoverage');
  if (aoiCoverage) aoiCoverage.addEventListener('input', calcCoverageDeviation);

  function calcTemporalDeviation() {
    const opt = document.getElementById('optimumDataCollection')?.value;
    const latest = document.getElementById('latestUpdate')?.value;
    const out = document.getElementById('temporalDeviation');
    if (!opt || !latest || !out) return;
    const d1 = new Date(opt), d2 = new Date(latest);
    const ms = Math.abs(d2 - d1);
    const days = Math.round(ms / (1000*60*60*24));
    out.value = `${days} days`;
  }
  const latestUpdate = document.getElementById('latestUpdate');
  if (latestUpdate) latestUpdate.addEventListener('change', calcTemporalDeviation);
  if (optimumDate) optimumDate.addEventListener('change', calcTemporalDeviation);

  function calcSpatialDeviation() {
    const savedDataType = localStorage.getItem('dataType') || DataManager.getSection('section1', 'basic').dataType;
    const isRS = savedDataType === 'remote-sensing';
    const spatialData = DataManager.getSection('section1', 'spatial');
    
    console.log('calcSpatialDeviation called, dataType:', savedDataType, 'spatialData:', spatialData);
    
    const out = document.getElementById('spatialDeviation');
    if (!out) return;
    
    let deviationText = '';
    
    if (isRS) {
      // For remote sensing: compare pixel sizes
      const optimalPixelSize = parseFloat(localStorage.getItem('pixelSize') || spatialData.pixelSize || 'NaN');
      const actualPixelSize = parseFloat(document.getElementById('pixelResolutionValue')?.value || 'NaN');
      
      if (isFinite(optimalPixelSize) && isFinite(actualPixelSize)) {
        const deviation = actualPixelSize - optimalPixelSize;
        deviationText = `${deviation.toFixed(2)} m`;
        console.log('Pixel size deviation calculated:', deviationText);
      }
    } else if (savedDataType && savedDataType !== 'other') {
      // For aggregation-based data: check if levels match
      const optimalAggregation = localStorage.getItem('aggregationLevel') || spatialData.aggregationLevel;
      const actualAggregation = document.getElementById('aggregationResolutionLevel')?.value;
      
      if (optimalAggregation && actualAggregation) {
        if (optimalAggregation === actualAggregation) {
          deviationText = 'Perfect match';
        } else {
          // Map aggregation levels to numeric values for comparison
          const aggregationLevels = { 'household': 4, 'city': 3, 'region': 2, 'country': 1 };
          const optimalLevel = aggregationLevels[optimalAggregation] || 0;
          const actualLevel = aggregationLevels[actualAggregation] || 0;
          const levelDiff = actualLevel - optimalLevel;
          
          if (levelDiff > 0) {
            deviationText = `${levelDiff} levels coarser than optimal`;
          } else {
            deviationText = `${Math.abs(levelDiff)} levels finer than optimal`;
          }
        }
        console.log('Aggregation deviation calculated:', deviationText);
      }
    } else {
      // For grid-based data (if gridSize is available)
      const optimalGridSize = parseFloat(localStorage.getItem('gridSize') || spatialData.gridSize || 'NaN');
      const actualGridSize = parseFloat(document.getElementById('gridResolutionValue')?.value || 'NaN');
      
      if (isFinite(optimalGridSize) && isFinite(actualGridSize)) {
        const deviation = actualGridSize - optimalGridSize;
        deviationText = `${deviation.toFixed(2)} m`;
        console.log('Grid size deviation calculated:', deviationText);
      }
    }
    
    if (deviationText) {
      out.value = deviationText;
    } else {
      out.value = 'Cannot calculate - missing optimal or actual values';
    }
    
    // Auto-populate optimal resolution display
    autoPopulateOptimalResolution();
  }
  
  // Add event listeners for deviation calculation
  ['pixelResolutionValue','gridResolutionValue','aggregationResolutionLevel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'aggregationResolutionLevel') {
        el.addEventListener('change', calcSpatialDeviation);
      } else {
        el.addEventListener('input', calcSpatialDeviation);
      }
    }
  });
  
  // Save section 1 resolution values to localStorage when changed
  ['pixelSize','gridSize','aggregationLevel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'aggregationLevel') {
        el.addEventListener('change', () => {
          localStorage.setItem(id, el.value);
          calcSpatialDeviation();
        });
      } else {
        el.addEventListener('input', () => {
          localStorage.setItem(id, el.value);
          calcSpatialDeviation();
        });
      }
    }
  });

  // ---- ENHANCED SUMMARY GENERATION ----
  function gatherScores() {
    // Get scores from DataManager (comprehensive across all sections)
    const surveyData = DataManager.getData();
    const storedScores = surveyData.scores || { byGroup: {}, bySection: {}, overall: null };
    
    // Also collect current page scores for immediate feedback
    const currentPageGroups = {};
    document.querySelectorAll('.score-field').forEach(sel => {
      const val = parseInt(sel.value, 10);
      if (!sel.dataset.scoregroup || Number.isNaN(val)) return;
      const g = sel.dataset.scoregroup;
      if (!currentPageGroups[g]) currentPageGroups[g] = [];
      currentPageGroups[g].push(val);
    });
    
    // Merge stored scores with current page scores
    const mergedGroups = { ...storedScores.byGroup };
    Object.entries(currentPageGroups).forEach(([group, scores]) => {
      if (!mergedGroups[group]) mergedGroups[group] = [];
      scores.forEach(score => {
        if (!mergedGroups[group].find(s => s.value === score)) {
          mergedGroups[group].push({ value: score, timestamp: new Date().toISOString() });
        }
      });
    });
    
    // Calculate averages
    const byGroup = {};
    let allVals = [];
    Object.entries(mergedGroups).forEach(([groupName, groupScores]) => {
      const values = groupScores.map(s => s.value || s);
      const avg = values.length ? (values.reduce((a,b)=>a+b,0)/values.length) : null;
      byGroup[groupName] = {
        count: values.length, 
        average: avg,
        scores: values,
        lastUpdated: groupScores.length ? Math.max(...groupScores.map(s => new Date(s.timestamp || Date.now()).getTime())) : null
      };
      allVals = allVals.concat(values);
    });
    
    const overall = allVals.length ? (allVals.reduce((a,b)=>a+b,0)/allVals.length) : null;
    
    return {
      byGroup, 
      bySection: storedScores.bySection,
      overall,
      totalScores: allVals.length,
      spiderChartData: generateSpiderChartData(byGroup)
    };
  }
  
  // Generate spider chart data structure
  function generateSpiderChartData(scoresByGroup) {
    const chartData = {
      labels: [],
      datasets: [{
        label: 'Data Quality Scores',
        data: [],
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(13, 110, 253, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
      }]
    };
    
    // Map score groups to readable labels
    const groupLabels = {
      'design-resolution': 'Spatial Resolution',
      'design-coverage': 'Spatial Coverage', 
      'design-timeliness': 'Timeliness',
      'usecase-spatial-fit': 'Spatial Fit',
      'usecase-coverage-fit': 'Coverage Fit',
      'usecase-temporal-fit': 'Temporal Fit',
      'conformance': 'Conformance',
      'context': 'Context',
      'accuracy': 'Accuracy',
      'completeness': 'Completeness',
      'consistency': 'Consistency'
    };
    
    Object.entries(scoresByGroup).forEach(([group, data]) => {
      if (data.average !== null) {
        chartData.labels.push(groupLabels[group] || group);
        chartData.datasets[0].data.push(data.average);
      }
    });
    
    return chartData;
  }

  // Enhanced summary generation with comprehensive data
  function generateSummaryText() {
    const scoreInfo = gatherScores();
    const surveyData = DataManager.getData();
    
    // Get basic information from stored data
    const basicInfo = surveyData.section1?.basic || {};
    const useCaseInfo = surveyData.section1?.useCase || {};
    const descriptives = surveyData.section2?.descriptives || {};
    
    let txt = `DATA QUALITY EVALUATION SUMMARY\n`;
    txt += `=====================================\n\n`;
    
    // Basic Information
    txt += `DATASET INFORMATION:\n`;
    txt += `- Title: ${basicInfo.datasetTitle || 'Not specified'}\n`;
    txt += `- Data Type: ${basicInfo.dataType || 'Not specified'}\n`;
    txt += `- Processing Level: ${basicInfo.dataprocessinglevel || 'Not specified'}\n`;
    txt += `- Evaluation Type: ${basicInfo.evaluationType || 'Not specified'}\n`;
    txt += `- Language: ${descriptives.languageDropdown || 'Not specified'}\n`;
    txt += `- Evaluator: ${basicInfo.evaluatorName || 'Not specified'}\n`;
    txt += `- Organization: ${basicInfo.evaluatorOrg || 'Not specified'}\n\n`;
    
    // Use-case specific information if applicable
    if (basicInfo.evaluationType === 'use-case-adequacy') {
      txt += `USE-CASE SPECIFIC REQUIREMENTS:\n`;
      txt += `- Description: ${useCaseInfo.useCaseDescription || 'Not specified'}\n`;
      txt += `- Optimum Collection Date: ${useCaseInfo.optimumDataCollection || 'Not specified'}\n`;
      
      const spatialInfo = surveyData.section1?.spatial || {};
      if (spatialInfo.pixelSize) txt += `- Optimum Pixel Size: ${spatialInfo.pixelSize}m\n`;
      if (spatialInfo.gridSize) txt += `- Optimum Grid Size: ${spatialInfo.gridSize}m\n`;
      if (spatialInfo.aggregationLevel) txt += `- Optimum Aggregation: ${spatialInfo.aggregationLevel}\n`;
      
      const aoiInfo = surveyData.section1?.aoi || {};
      if (aoiInfo.aoiType) txt += `- AOI Type: ${aoiInfo.aoiType}\n`;
      
      txt += `- Other Requirements: ${useCaseInfo.otherRequirements || 'None specified'}\n\n`;
    }
    
    // Descriptive information
    if (descriptives.identifier || descriptives.datasetDescription) {
      txt += `DATASET DESCRIPTION:\n`;
      if (descriptives.identifier) txt += `- Identifier: ${descriptives.identifier}\n`;
      if (descriptives.datasetDescription) txt += `- Description: ${descriptives.datasetDescription}\n`;
      if (descriptives.keywords && descriptives.keywords.length > 0) {
        txt += `- Keywords: ${descriptives.keywords.join(', ')}\n`;
      }
      txt += `\n`;
    }
    
    // Quality Scores Summary
    txt += `QUALITY ASSESSMENT SCORES:\n`;
    if (scoreInfo.totalScores > 0) {
      txt += `- Total Assessments: ${scoreInfo.totalScores}\n`;
      txt += `- Overall Score: ${scoreInfo.overall?.toFixed(2) || 'N/A'} / 4.0\n\n`;
      
      txt += `Detailed Scores by Category:\n`;
      Object.entries(scoreInfo.byGroup).forEach(([group, data]) => {
        if (data.average !== null) {
          const groupName = group.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          txt += `  • ${groupName}: ${data.average.toFixed(2)}/4.0 (${data.count} assessment${data.count > 1 ? 's' : ''})\n`;
        }
      });
      
      // Performance interpretation
      txt += `\nPERFORMANCE INTERPRETATION:\n`;
      const overall = scoreInfo.overall;
      if (overall >= 3.5) {
        txt += `- Overall Rating: EXCELLENT (${overall.toFixed(2)}/4.0)\n`;
        txt += `- The dataset demonstrates very high quality across evaluated dimensions.\n`;
      } else if (overall >= 2.5) {
        txt += `- Overall Rating: GOOD (${overall.toFixed(2)}/4.0)\n`;
        txt += `- The dataset shows good quality with some areas for improvement.\n`;
      } else if (overall >= 1.5) {
        txt += `- Overall Rating: FAIR (${overall.toFixed(2)}/4.0)\n`;
        txt += `- The dataset has moderate quality with several limitations.\n`;
      } else if (overall > 0) {
        txt += `- Overall Rating: POOR (${overall.toFixed(2)}/4.0)\n`;
        txt += `- The dataset has significant quality issues requiring attention.\n`;
      }
    } else {
      txt += `- No quality scores available yet.\n`;
    }
    
    // Section-specific highlights
    const section3Data = surveyData.section3 || {};
    if (section3Data.spatialCoverage?.aoiCoverage) {
      txt += `\nSPATIAL COVERAGE ANALYSIS:\n`;
      txt += `- AOI Coverage: ${section3Data.spatialCoverage.aoiCoverage}%\n`;
      if (section3Data.spatialCoverage.cloudCover) {
        txt += `- Cloud Cover: ${section3Data.spatialCoverage.cloudCover}%\n`;
      }
    }
    
    // Timestamp information
    txt += `\nEVALUATION METADATA:\n`;
    txt += `- Created: ${new Date(surveyData.timestamps?.created || Date.now()).toLocaleString()}\n`;
    txt += `- Last Modified: ${new Date(surveyData.timestamps?.lastModified || Date.now()).toLocaleString()}\n`;
    
    return txt;
  }
  
  // Generate comprehensive JSON export
  function generateComprehensiveExport() {
    const surveyData = DataManager.getData();
    const scoreInfo = gatherScores();
    
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        evaluationType: surveyData.section1?.basic?.evaluationType || 'unknown'
      },
      dataset: {
        basic: surveyData.section1?.basic || {},
        useCase: surveyData.section1?.useCase || {},
        spatial: surveyData.section1?.spatial || {},
        aoi: surveyData.section1?.aoi || {}
      },
      descriptives: surveyData.section2?.descriptives || {},
      design: {
        spatialResolution: surveyData.section3?.spatialResolution || {},
        spatialCoverage: surveyData.section3?.spatialCoverage || {},
        timeliness: surveyData.section3?.timeliness || {}
      },
      conformance: surveyData.section4 || {},
      context: surveyData.section5 || {},
      qualityScores: {
        summary: scoreInfo,
        spiderChartData: scoreInfo.spiderChartData,
        bySection: scoreInfo.bySection,
        overall: scoreInfo.overall
      },
      timestamps: surveyData.timestamps
    };
  }

  // --- XLSX and JSON ZIP Export System ---
const ExportManager = {
  generateXLSX(surveyData) {
    const wb = XLSX.utils.book_new();

    const addSheet = (name, data) => {
      const flatData = Array.isArray(data) ? data : [data];
      const ws = XLSX.utils.json_to_sheet(flatData);
      XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Excel sheet name limit
    };

    addSheet('Section1_Basic', surveyData.dataset.basic);
    addSheet('Section1_UseCase', surveyData.dataset.useCase);
    addSheet('Section1_Spatial', surveyData.dataset.spatial);
    addSheet('Section2_Descriptives', surveyData.descriptives);
    addSheet('Section3_Design', surveyData.design);
    addSheet('Section4_Conformance', surveyData.conformance);
    addSheet('Section5_Context', surveyData.context);
    addSheet('Scores_BySection', surveyData.qualityScores.bySection);
    addSheet('Scores_ByGroup', surveyData.qualityScores.summary.byGroup);

    const datasetTitle = surveyData.dataset.basic.datasetTitle || 'DataQuality';
    const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,'-');
    XLSX.writeFile(wb, `${datasetTitle.replace(/[^a-z0-9]/gi,'_')}_${timestamp}.xlsx`);
  },

  async generateJSONZip(surveyData) {
    const zip = new JSZip();

    zip.file("Section1_Basic.json", JSON.stringify(surveyData.dataset.basic, null, 2));
    zip.file("Section1_UseCase.json", JSON.stringify(surveyData.dataset.useCase, null, 2));
    zip.file("Section1_Spatial.json", JSON.stringify(surveyData.dataset.spatial, null, 2));
    zip.file("Section2_Descriptives.json", JSON.stringify(surveyData.descriptives, null, 2));
    zip.file("Section3_Design.json", JSON.stringify(surveyData.design, null, 2));
    zip.file("Section4_Conformance.json", JSON.stringify(surveyData.conformance, null, 2));
    zip.file("Section5_Context.json", JSON.stringify(surveyData.context, null, 2));
    zip.file("Scores.json", JSON.stringify(surveyData.qualityScores, null, 2));

    const datasetTitle = surveyData.dataset.basic.datasetTitle || 'DataQuality';
    const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,'-');
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${datasetTitle.replace(/[^a-z0-9]/gi,'_')}_${timestamp}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }
};


  const summaryBtn = document.getElementById('generateSummary');
  const summaryOut = document.getElementById('summary-output');
  if (summaryBtn && summaryOut) {
    summaryBtn.addEventListener('click', () => {
      try {
        // Simple working summary
        showSimpleSummary();
        // Also update the text output for compatibility
        summaryOut.textContent = generateSummaryText();
      } catch (error) {
        console.error('Summary error:', error);
        // Fallback to text summary only
        summaryOut.textContent = generateSummaryText();
        alert('Error details: ' + error.message);
      }
    });
  }

  // ---- COMPREHENSIVE DATA STORAGE & EXPORT SYSTEM ----
  
  const StorageManager = {
    // GitHub Integration
    github: {
      owner: 'PLUS-CLIMB',
      repo: 'dqsurvey',
      branch: 'main',
      token: localStorage.getItem('githubToken') || null,
      
      async authenticate() {
        if (!this.token) {
          const token = prompt('Enter your GitHub Personal Access Token for data storage:');
          if (token) {
            localStorage.setItem('githubToken', token);
            this.token = token;
            return true;
          }
          return false;
        }
        return true;
      },
      
      async uploadSurveyData(surveyData) {
        if (!await this.authenticate()) {
          throw new Error('GitHub authentication required');
        }
        
        const filename = `survey_data/${surveyData.dataset.basic.datasetTitle || 'unnamed'}_${Date.now()}.json`;
        const content = btoa(JSON.stringify(surveyData, null, 2));
        
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filename}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Add survey data: ${surveyData.dataset.basic.datasetTitle || 'Unnamed Dataset'}`,
            content: content,
            branch: this.branch
          })
        });
        
        if (!response.ok) {
          throw new Error(`GitHub upload failed: ${response.statusText}`);
        }
        
        return await response.json();
      }
    },
    
    // Database Integration (PostgreSQL via API)
    database: {
      endpoint: localStorage.getItem('dbEndpoint') || 'http://localhost:3001/api',
      apiKey: localStorage.getItem('dbApiKey') || null,
      configured: false,
      
      async configure() {
        const currentEndpoint = this.endpoint;
        const endpoint = prompt(`Enter database API endpoint URL:`, currentEndpoint);
        const apiKey = prompt('Enter database API key (leave blank if not required):');
        
        if (endpoint) {
          localStorage.setItem('dbEndpoint', endpoint);
          this.endpoint = endpoint;
          this.configured = true;
        }
        if (apiKey) {
          localStorage.setItem('dbApiKey', apiKey);
          this.apiKey = apiKey;
        }
        
        // Test connection
        try {
          const testResponse = await fetch(`${this.endpoint}/health`);
          if (testResponse.ok) {
            console.log('Database API connection successful');
            return true;
          } else {
            throw new Error('API health check failed');
          }
        } catch (error) {
          console.error('Database connection test failed:', error);
          alert('Warning: Could not connect to database API. Data will be saved locally.');
          return false;
        }
      },
      
      async saveSurveyData(surveyData) {
        // Auto-configure if not done
        if (!this.configured) {
          const configured = await this.configure();
          if (!configured) {
            throw new Error('Database configuration failed');
          }
        }
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        
        const response = await fetch(`${this.endpoint}/survey`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(surveyData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Database save failed: ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
      },
      
      async getDashboardData() {
        try {
          const headers = {};
          if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
          }
          
          const response = await fetch(`${this.endpoint}/dashboard`, {
            headers: headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          throw error;
        }
      },
      
      async getSurveyById(surveyId) {
        try {
          const headers = {};
          if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
          }
          
          const response = await fetch(`${this.endpoint}/survey/${surveyId}`, {
            headers: headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch survey: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('Error fetching survey:', error);
          throw error;
        }
      }
    },
    
    // CSV Export functionality
    generateCSV(surveyData) {
      const rows = [];
      
      // Comprehensive header row - ALL survey questions
      const headers = [
        // Section 1 - Basic Dataset Information
        'dataset_title', 'data_type', 'processing_level', 'evaluation_type',
        'evaluator_name', 'evaluator_org',
        
        // Section 1 - Use Case Information  
        'use_case_description', 'optimum_collection_date', 'optimum_aggregation',
        
        // Section 1 - Spatial Information
        'pixel_resolution_value', 'grid_resolution_value', 'aggregation_resolution_level',
        'general_extent', 'general_extent_details', 'aoi_type', 'aoi_other',
        
        // Section 2 - Dataset Descriptives
        'identifier', 'dataset_description', 'dataset_description_link', 
        'metadata_doc', 'language_dropdown', 'language_other', 'keywords',
        
        // Section 2 - Metadata Standards
        'metadata_standard', 'metadata_standard_other', 'metadata_completeness',
        'metadata_quality', 'metadata_accessibility',
        
        // Section 3 - Design Quality (Spatial Resolution)
        'optimal_resolution', 'spatial_fit', 'spatial_deviation',
        
        // Section 3 - Design Quality (Spatial Coverage)
        'aoi_coverage', 'cloud_cover', 'coverage_deviation',
        
        // Section 3 - Design Quality (Timeliness)
        'collection_date', 'temporal_resolution', 'latest_update', 
        'temporal_extent', 'temporal_validity', 'temporal_deviation',
        
        // Section 4 - All Assessment Questions (Design, Conformance, Context)
        'q_spatial_resolution_adequate', 'q_spatial_resolution_justified', 
        'q_spatial_resolution_documented', 'q_spatial_coverage_complete',
        'q_spatial_coverage_appropriate', 'q_spatial_coverage_documented',
        'q_temporal_coverage_adequate', 'q_temporal_coverage_appropriate',
        'q_temporal_coverage_documented', 'q_data_format_appropriate',
        'q_data_structure_logical', 'q_data_accessible', 'q_metadata_complete',
        'q_metadata_standard_compliant', 'q_documentation_adequate',
        'q_lineage_documented', 'q_processing_transparent', 'q_quality_measures_present',
        'q_uncertainty_quantified', 'q_validation_performed', 'q_accuracy_appropriate',
        'q_consistency_maintained', 'q_completeness_adequate', 'q_currency_appropriate',
        'q_fitness_for_purpose', 'q_user_needs_met', 'q_cost_effective',
        'q_technical_compatibility', 'q_organizational_compatibility',
        
        // Section 5 - Quality Scores and Summary
        'overall_score', 'total_assessments', 'design_resolution_score', 
        'design_coverage_score', 'design_timeliness_score', 'conformance_score', 
        'context_score', 'assessment_notes', 'recommendations',
        
        // Metadata
        'created_date', 'last_modified', 'survey_version', 'completion_status'
      ];
      rows.push(headers.join(','));
      
      // Extract all data sections
      const basic = surveyData.dataset?.basic || {};
      const useCase = surveyData.dataset?.useCase || {};
      const spatial = surveyData.dataset?.spatial || {};
      const aoi = surveyData.dataset?.aoi || {};
      const descriptives = surveyData.descriptives || {};
      const metadata = surveyData.metadata || {};
      const design = surveyData.design || {};
      const assessments = surveyData.assessments || {};
      const scores = surveyData.qualityScores || {};
      
      // Also get data from localStorage as fallback
      const getField = (field) => {
        return localStorage.getItem(field) || 
               (surveyData[field] !== undefined ? surveyData[field] : '') ||
               '';
      };
      
      // Comprehensive data row with ALL survey fields
      const dataRow = [
        // Section 1 - Basic Dataset Information
        this.escapeCSV(basic.datasetTitle || getField('datasetTitle')),
        this.escapeCSV(basic.dataType || getField('dataType')),
        this.escapeCSV(basic.dataprocessinglevel || getField('dataprocessinglevel')),
        this.escapeCSV(basic.evaluationType || getField('evaluationType')),
        this.escapeCSV(basic.evaluatorName || getField('evaluatorName')),
        this.escapeCSV(basic.evaluatorOrg || getField('evaluatorOrg')),
        
        // Section 1 - Use Case Information
        this.escapeCSV(useCase.useCaseDescription || getField('useCaseDescription')),
        useCase.optimumDataCollection || getField('optimumDataCollection'),
        this.escapeCSV(useCase.optimumAggregation || getField('optimumAggregation')),
        
        // Section 1 - Spatial Information
        spatial.pixelResolutionValue || getField('pixelResolutionValue'),
        spatial.gridResolutionValue || getField('gridResolutionValue'),
        this.escapeCSV(spatial.aggregationResolutionLevel || getField('aggregationResolutionLevel')),
        this.escapeCSV(aoi.generalExtent || getField('generalExtent')),
        this.escapeCSV(aoi.generalExtentDetails || getField('generalExtentDetails')),
        this.escapeCSV(aoi.aoiType || getField('aoiType')),
        this.escapeCSV(aoi.aoiOther || getField('aoiOther')),
        
        // Section 2 - Dataset Descriptives
        this.escapeCSV(descriptives.identifier || getField('identifier')),
        this.escapeCSV(descriptives.datasetDescription || getField('datasetDescription')),
        this.escapeCSV(descriptives.datasetDescriptionLink || getField('datasetDescriptionLink')),
        this.escapeCSV(descriptives.metadataDoc || getField('metadataDoc')),
        this.escapeCSV(descriptives.languageDropdown || getField('languageDropdown')),
        this.escapeCSV(descriptives.languageOther || getField('languageOther')),
        this.escapeCSV((descriptives.keywords || []).join('; ') || getField('keywords')),
        
        // Section 2 - Metadata Standards
        this.escapeCSV(metadata.metadataStandard || getField('metadataStandard')),
        this.escapeCSV(metadata.metadataStandardOther || getField('metadataStandardOther')),
        this.escapeCSV(metadata.metadataCompleteness || getField('metadataCompleteness')),
        this.escapeCSV(metadata.metadataQuality || getField('metadataQuality')),
        this.escapeCSV(metadata.metadataAccessibility || getField('metadataAccessibility')),
        
        // Section 3 - Design Quality (Spatial Resolution)
        this.escapeCSV(design.spatialResolution?.optimalResolution || getField('optimalResolution')),
        this.escapeCSV(design.spatialResolution?.spatialFit || getField('spatialFit')),
        design.spatialResolution?.spatialDeviation || getField('spatialDeviation'),
        
        // Section 3 - Design Quality (Spatial Coverage)
        design.spatialCoverage?.aoiCoverage || getField('aoiCoverage'),
        design.spatialCoverage?.cloudCover || getField('cloudCover'),
        design.spatialCoverage?.coverageDeviation || getField('coverageDeviation'),
        
        // Section 3 - Design Quality (Timeliness)
        design.timeliness?.collectionDate || getField('collectionDate'),
        this.escapeCSV(design.timeliness?.temporalResolution || getField('temporalResolution')),
        design.timeliness?.latestUpdate || getField('latestUpdate'),
        this.escapeCSV(design.timeliness?.temporalExtent || getField('temporalExtent')),
        this.escapeCSV(design.timeliness?.temporalValidity || getField('temporalValidity')),
        design.timeliness?.temporalDeviation || getField('temporalDeviation'),
        
        // Section 4 - All Assessment Questions
        assessments['spatial-resolution-adequate'] || getField('spatial-resolution-adequate') || '',
        assessments['spatial-resolution-justified'] || getField('spatial-resolution-justified') || '',
        assessments['spatial-resolution-documented'] || getField('spatial-resolution-documented') || '',
        assessments['spatial-coverage-complete'] || getField('spatial-coverage-complete') || '',
        assessments['spatial-coverage-appropriate'] || getField('spatial-coverage-appropriate') || '',
        assessments['spatial-coverage-documented'] || getField('spatial-coverage-documented') || '',
        assessments['temporal-coverage-adequate'] || getField('temporal-coverage-adequate') || '',
        assessments['temporal-coverage-appropriate'] || getField('temporal-coverage-appropriate') || '',
        assessments['temporal-coverage-documented'] || getField('temporal-coverage-documented') || '',
        assessments['data-format-appropriate'] || getField('data-format-appropriate') || '',
        assessments['data-structure-logical'] || getField('data-structure-logical') || '',
        assessments['data-accessible'] || getField('data-accessible') || '',
        assessments['metadata-complete'] || getField('metadata-complete') || '',
        assessments['metadata-standard-compliant'] || getField('metadata-standard-compliant') || '',
        assessments['documentation-adequate'] || getField('documentation-adequate') || '',
        assessments['lineage-documented'] || getField('lineage-documented') || '',
        assessments['processing-transparent'] || getField('processing-transparent') || '',
        assessments['quality-measures-present'] || getField('quality-measures-present') || '',
        assessments['uncertainty-quantified'] || getField('uncertainty-quantified') || '',
        assessments['validation-performed'] || getField('validation-performed') || '',
        assessments['accuracy-appropriate'] || getField('accuracy-appropriate') || '',
        assessments['consistency-maintained'] || getField('consistency-maintained') || '',
        assessments['completeness-adequate'] || getField('completeness-adequate') || '',
        assessments['currency-appropriate'] || getField('currency-appropriate') || '',
        assessments['fitness-for-purpose'] || getField('fitness-for-purpose') || '',
        assessments['user-needs-met'] || getField('user-needs-met') || '',
        assessments['cost-effective'] || getField('cost-effective') || '',
        assessments['technical-compatibility'] || getField('technical-compatibility') || '',
        assessments['organizational-compatibility'] || getField('organizational-compatibility') || '',
        
        // Section 5 - Quality Scores and Summary  
        scores.overall || '',
        scores.summary?.totalScores || 0,
        scores.summary?.byGroup?.['design-resolution']?.average || '',
        scores.summary?.byGroup?.['design-coverage']?.average || '',
        scores.summary?.byGroup?.['design-timeliness']?.average || '',
        scores.summary?.byGroup?.['conformance']?.average || '',
        scores.summary?.byGroup?.['context']?.average || '',
        this.escapeCSV(scores.notes || getField('assessmentNotes')),
        this.escapeCSV(scores.recommendations || getField('recommendations')),
        
        // Metadata
        surveyData.timestamps?.created || '',
        surveyData.timestamps?.lastModified || '',
        surveyData.version || '1.0',
        surveyData.completionStatus || 'in-progress'
      ];
      
      rows.push(dataRow.join(','));
      return rows.join('\n');
    },
    
    // Generate CSV for multiple surveys
    generateMultipleSurveysCSV(surveysArray) {
      const rows = [];
      
      // Header row
      const headers = [
        'survey_id', 'dataset_title', 'data_type', 'processing_level', 'evaluation_type',
        'evaluator_name', 'evaluator_org', 'language', 'overall_score',
        'total_assessments', 'created_date', 'last_modified',
        'use_case_description', 'optimum_collection_date', 'spatial_resolution',
        'aoi_coverage', 'cloud_cover', 'temporal_deviation', 'spatial_deviation',
        'scores_design_resolution', 'scores_design_coverage', 'scores_design_timeliness',
        'scores_conformance', 'scores_context', 'keywords'
      ];
      rows.push(headers.join(','));
      
      // Data rows for each survey
      surveysArray.forEach((surveyData, index) => {
        const basic = surveyData.dataset?.basic || {};
        const useCase = surveyData.dataset?.useCase || {};
        const descriptives = surveyData.descriptives || {};
        const design = surveyData.design || {};
        const scores = surveyData.qualityScores || {};
        
        const dataRow = [
          `survey_${index + 1}`,
          this.escapeCSV(basic.datasetTitle || ''),
          this.escapeCSV(basic.dataType || ''),
          this.escapeCSV(basic.dataprocessinglevel || ''),
          this.escapeCSV(basic.evaluationType || ''),
          this.escapeCSV(basic.evaluatorName || ''),
          this.escapeCSV(basic.evaluatorOrg || ''),
          this.escapeCSV(descriptives.languageDropdown || ''),
          scores.overall || '',
          scores.summary?.totalScores || 0,
          surveyData.timestamps?.created || '',
          surveyData.timestamps?.lastModified || '',
          this.escapeCSV(useCase.useCaseDescription || ''),
          useCase.optimumDataCollection || '',
          this.escapeCSV(this.getSpatialResolutionText(surveyData.dataset?.spatial)),
          design.spatialCoverage?.aoiCoverage || '',
          design.spatialCoverage?.cloudCover || '',
          design.timeliness?.temporalDeviation || '',
          design.spatialResolution?.spatialDeviation || '',
          scores.summary?.byGroup?.['design-resolution']?.average || '',
          scores.summary?.byGroup?.['design-coverage']?.average || '',
          scores.summary?.byGroup?.['design-timeliness']?.average || '',
          scores.summary?.byGroup?.['conformance']?.average || '',
          scores.summary?.byGroup?.['context']?.average || '',
          this.escapeCSV((descriptives.keywords || []).join('; '))
        ];
        
        rows.push(dataRow.join(','));
      });
      
      return rows.join('\n');
    },
    
    escapeCSV(value) {
      if (typeof value !== 'string') return value;
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    },
    
    getSpatialResolutionText(spatialData) {
      if (!spatialData) return '';
      if (spatialData.pixelSize) return `${spatialData.pixelSize}m (pixel)`;
      if (spatialData.gridSize) return `${spatialData.gridSize}m (grid)`;
      if (spatialData.aggregationLevel) return `${spatialData.aggregationLevel} (aggregation)`;
      return '';
    },
    
    // Dashboard data preparation
    prepareDashboardData(surveyData) {
      return {
        id: `survey_${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataset: {
          title: surveyData.dataset.basic?.datasetTitle || 'Unnamed Dataset',
          type: surveyData.dataset.basic?.dataType || 'Unknown',
          processingLevel: surveyData.dataset.basic?.dataprocessinglevel || 'Unknown'
        },
        evaluation: {
          type: surveyData.dataset.basic?.evaluationType || 'Unknown',
          evaluator: surveyData.dataset.basic?.evaluatorName || 'Anonymous',
          organization: surveyData.dataset.basic?.evaluatorOrg || 'Unknown'
        },
        scores: {
          overall: surveyData.qualityScores?.overall || 0,
          breakdown: surveyData.qualityScores?.summary?.byGroup || {},
          spiderChartData: surveyData.qualityScores?.spiderChartData || null
        },
        metrics: {
          aoiCoverage: surveyData.design?.spatialCoverage?.aoiCoverage || null,
          cloudCover: surveyData.design?.spatialCoverage?.cloudCover || null,
          temporalDeviation: surveyData.design?.timeliness?.temporalDeviation || null,
          spatialDeviation: surveyData.design?.spatialResolution?.spatialDeviation || null
        },
        keywords: surveyData.descriptives?.keywords || [],
        lastModified: surveyData.timestamps?.lastModified || new Date().toISOString()
      };
    }
  };
  
  // Enhanced download functionality with multiple options
  const downloadBtn = document.getElementById('downloadSummary');
  if (downloadBtn) {
    // Replace single button with comprehensive dropdown menu
    downloadBtn.outerHTML = `
      <div class="btn-group" role="group">
        <button id="downloadJSON" class="btn btn-primary">Download Full Survey (JSON)</button>
        <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
          <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
          <li><h6 class="dropdown-header">Full Survey Export</h6></li>
          <li><a class="dropdown-item" href="#" id="downloadCSV">Download Full Survey (CSV)</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><h6 class="dropdown-header">Cloud Storage</h6></li>
          <li><a class="dropdown-item" href="#" id="uploadGitHub">Save to GitHub</a></li>
          <li><a class="dropdown-item" href="#" id="saveDatabase">Save to Database</a></li>
        </ul>
      </div>
    `;
    
    // JSON Download
    document.getElementById('downloadJSON').addEventListener('click', () => {
      const comprehensiveData = generateComprehensiveExport();
      const blob = new Blob([JSON.stringify(comprehensiveData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const datasetTitle = comprehensiveData.dataset.basic.datasetTitle || 'DataQuality';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_evaluation_${timestamp}.json`;
      
      a.click();
      URL.revokeObjectURL(url);
    });
    
    // CSV Download
    document.getElementById('downloadCSV').addEventListener('click', () => {
      const comprehensiveData = generateComprehensiveExport();
      const csvContent = StorageManager.generateCSV(comprehensiveData);
      const blob = new Blob([csvContent], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const datasetTitle = comprehensiveData.dataset.basic.datasetTitle || 'DataQuality';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_evaluation_${timestamp}.csv`;
      
      a.click();
      URL.revokeObjectURL(url);
    });
    
    // GitHub Upload
    document.getElementById('uploadGitHub').addEventListener('click', async () => {
      try {
        const btn = document.getElementById('uploadGitHub');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
        btn.disabled = true;
        
        const comprehensiveData = generateComprehensiveExport();
        const result = await StorageManager.github.uploadSurveyData(comprehensiveData);
        
        alert(`Successfully uploaded to GitHub: ${result.content.name}`);
        btn.innerHTML = 'Save to GitHub';
        btn.disabled = false;
      } catch (error) {
        alert(`GitHub upload failed: ${error.message}`);
        document.getElementById('uploadGitHub').innerHTML = 'Save to GitHub';
        document.getElementById('uploadGitHub').disabled = false;
      }
    });
    
    // Database Save
    document.getElementById('saveDatabase').addEventListener('click', async () => {
      try {
        const btn = document.getElementById('saveDatabase');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
        btn.disabled = true;
        
        const comprehensiveData = generateComprehensiveExport();
        const result = await StorageManager.database.saveSurveyData(comprehensiveData);
        
        alert('Successfully saved to database!');
        btn.innerHTML = 'Save to Database';
        btn.disabled = false;
      } catch (error) {
        alert(`Database save failed: ${error.message}`);
        document.getElementById('saveDatabase').innerHTML = 'Save to Database';
        document.getElementById('saveDatabase').disabled = false;
      }
    });
    
    // Download Summary Only
    document.getElementById('downloadSummaryOnly').addEventListener('click', () => {
      const comprehensiveData = generateComprehensiveExport();
      const summaryData = {
        id: `summary_${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataset: {
          title: comprehensiveData.dataset.basic?.datasetTitle || 'Unnamed Dataset',
          type: comprehensiveData.dataset.basic?.dataType || 'Unknown',
          processingLevel: comprehensiveData.dataset.basic?.dataprocessinglevel || 'Unknown'
        },
        evaluation: {
          type: comprehensiveData.dataset.basic?.evaluationType || 'Unknown',
          evaluator: comprehensiveData.dataset.basic?.evaluatorName || 'Anonymous',
          organization: comprehensiveData.dataset.basic?.evaluatorOrg || 'Unknown'
        },
        scores: comprehensiveData.qualityScores || {},
        summary: comprehensiveData.qualityScores?.summary || {}
      };
      
      const blob = new Blob([JSON.stringify(summaryData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const datasetTitle = summaryData.dataset.title || 'DataQuality';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_summary_${timestamp}.json`;
      
      a.click();
      URL.revokeObjectURL(url);
    });
    
    // Download All Surveys JSON
    document.getElementById('downloadAllJSON').addEventListener('click', () => {
      const allSurveys = getAllStoredSurveys();
      if (allSurveys.length === 0) {
        alert('No survey data found in local storage.');
        return;
      }
      
      const allSurveysData = {
        exportDate: new Date().toISOString(),
        totalSurveys: allSurveys.length,
        surveys: allSurveys
      };
      
      const blob = new Blob([JSON.stringify(allSurveysData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `all_surveys_${timestamp}.json`;
      
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`Downloaded ${allSurveys.length} survey(s) to JSON file.`);
    });
    
    // Download All Surveys CSV
    document.getElementById('downloadAllCSV').addEventListener('click', () => {
      const allSurveys = getAllStoredSurveys();
      if (allSurveys.length === 0) {
        alert('No survey data found in local storage.');
        return;
      }
      
      const csvContent = StorageManager.generateMultipleSurveysCSV(allSurveys);
      const blob = new Blob([csvContent], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `all_surveys_${timestamp}.csv`;
      
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`Downloaded ${allSurveys.length} survey(s) to CSV file.`);
    });
    
    // Save Summary Only to Database
    document.getElementById('saveSummaryDB').addEventListener('click', async () => {
      try {
        const btn = document.getElementById('saveSummaryDB');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving Summary...';
        btn.disabled = true;
        
        const comprehensiveData = generateComprehensiveExport();
        const summaryData = {
          type: 'summary',
          timestamp: new Date().toISOString(),
          dataset: comprehensiveData.dataset,
          scores: comprehensiveData.qualityScores,
          evaluator: {
            name: comprehensiveData.dataset.basic?.evaluatorName,
            organization: comprehensiveData.dataset.basic?.evaluatorOrg
          }
        };
        
        const result = await StorageManager.database.saveSurveyData(summaryData);
        
        alert('Summary successfully saved to database!');
        btn.innerHTML = 'Save Summary Only to Database';
        btn.disabled = false;
      } catch (error) {
        alert(`Summary database save failed: ${error.message}`);
        document.getElementById('saveSummaryDB').innerHTML = 'Save Summary Only to Database';
        document.getElementById('saveSummaryDB').disabled = false;
      }
    });

    document.getElementById('downloadXLSX').addEventListener('click', () => {
        const data = generateComprehensiveExport();
        ExportManager.generateXLSX(data);
        });

    document.getElementById('downloadJSONZIP').addEventListener('click', () => {
        const data = generateComprehensiveExport();
        ExportManager.generateJSONZip(data);
        });
    
    // Update Dashboard Data
    document.getElementById('updateDashboard').addEventListener('click', async () => {
      try {
        const comprehensiveData = generateComprehensiveExport();
        const dashboardData = StorageManager.prepareDashboardData(comprehensiveData);
        
        // Update localStorage dashboard data
        const existingDashboardData = JSON.parse(localStorage.getItem('dashboardData') || '[]');
        
        // Find existing entry by dataset title or add new
        const existingIndex = existingDashboardData.findIndex(item => 
          item.dataset.title === dashboardData.dataset.title
        );
        
        if (existingIndex !== -1) {
          existingDashboardData[existingIndex] = dashboardData;
          alert('Dashboard data updated for existing dataset.');
        } else {
          existingDashboardData.push(dashboardData);
          alert('New dataset added to dashboard data.');
        }
        
        localStorage.setItem('dashboardData', JSON.stringify(existingDashboardData));
        
        // Also try to update database if available
        try {
          await StorageManager.database.saveSurveyData(dashboardData);
        } catch (dbError) {
          console.log('Database update failed, but localStorage updated successfully');
        }
        
      } catch (error) {
        alert(`Dashboard update failed: ${error.message}`);
      }
    });
    
    // Dashboard Export (original function)
    document.getElementById('exportDashboard').addEventListener('click', () => {
      const comprehensiveData = generateComprehensiveExport();
      const dashboardData = StorageManager.prepareDashboardData(comprehensiveData);
      
      // Save to localStorage for dashboard
      const existingDashboardData = JSON.parse(localStorage.getItem('dashboardData') || '[]');
      existingDashboardData.push(dashboardData);
      localStorage.setItem('dashboardData', JSON.stringify(existingDashboardData));
      
      // Also provide download
      const blob = new Blob([JSON.stringify(dashboardData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const datasetTitle = dashboardData.dataset.title || 'DataQuality';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_dashboard_${timestamp}.json`;
      
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Data exported for dashboard! You can now view it in the dashboard page.');
    });
  }
  
  // Add spider chart data export button if present
  const chartBtn = document.getElementById('exportChartData');
  if (chartBtn) {
    chartBtn.addEventListener('click', () => {
      const scoreInfo = gatherScores();
      const chartData = {
        spiderChart: scoreInfo.spiderChartData,
        chartConfig: {
          type: 'radar',
          options: {
            scales: {
              r: {
                beginAtZero: true,
                max: 4,
                ticks: {
                  stepSize: 1
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Data Quality Assessment - Spider Chart'
              }
            }
          }
        },
        metadata: {
          exportDate: new Date().toISOString(),
          totalScores: scoreInfo.totalScores,
          overallScore: scoreInfo.overall
        }
      };
      
      const blob = new Blob([JSON.stringify(chartData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const datasetTitle = DataManager.getData().section1?.basic?.datasetTitle || 'DataQuality';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_spider_chart_${timestamp}.json`;
      
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // ---- AUTOMATIC DATA SAVING SYSTEM ----
  
  // Function to determine section and subsection from field ID
  function getSectionMapping(fieldId) {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Section 1 mappings
    if (currentPage === 'section1.html') {
      if (['datasetTitle', 'evaluatorName', 'evaluatorOrg', 'dataprocessinglevel', 'dataType', 'evaluationType'].includes(fieldId)) {
        return { section: 'section1', subsection: 'basic' };
      }
      if (['useCaseDescription', 'optimumDataCollection', 'otherRequirements'].includes(fieldId)) {
        return { section: 'section1', subsection: 'useCase' };
      }
      if (['pixelSize', 'gridSize', 'aggregationLevel'].includes(fieldId)) {
        return { section: 'section1', subsection: 'spatial' };
      }
      if (['aoiType', 'aoiDropdown', 'minLat', 'maxLat', 'minLon', 'maxLon'].includes(fieldId)) {
        return { section: 'section1', subsection: 'aoi' };
      }
    }
    
    // Section 2 mappings
    if (currentPage === 'section2.html') {
      if (['identifier', 'datasetDescription', 'datasetDescriptionLink', 'metadataDoc', 'languageDropdown', 'languageOtherInput'].includes(fieldId)) {
        return { section: 'section2', subsection: 'descriptives' };
      }
      if (fieldId.includes('metadata') || fieldId.includes('standard')) {
        return { section: 'section2', subsection: 'metadata' };
      }
    }
    
    // Section 3 mappings
    if (currentPage === 'section3.html') {
      if (['pixelResolutionValue', 'gridResolutionValue', 'aggregationResolutionLevel', 'optimalResolution', 'spatialFit', 'spatialDeviation'].includes(fieldId)) {
        return { section: 'section3', subsection: 'spatialResolution' };
      }
      if (['generalExtent', 'generalExtentDetails', 'aoiCoverage', 'cloudCover', 'coverageDeviation'].includes(fieldId)) {
        return { section: 'section3', subsection: 'spatialCoverage' };
      }
      if (['collectionDate', 'temporalResolution', 'latestUpdate', 'temporalExtent', 'temporalValidity', 'optimumCollectionAuto', 'temporalDeviation'].includes(fieldId)) {
        return { section: 'section3', subsection: 'timeliness' };
      }
    }
    
    // Default section mapping
    const sectionMap = {
      'section1.html': 'section1',
      'section2.html': 'section2', 
      'section3.html': 'section3',
      'section4.html': 'section4',
      'section5.html': 'section5'
    };
    
    return { section: sectionMap[currentPage] || 'unknown', subsection: 'general' };
  }
  
  // Generate visual summary (table or chart)
  function generateVisualSummary(type = 'table') {
    const comprehensiveData = generateComprehensiveExport();
    const scores = comprehensiveData.qualityScores || {};
    const basic = comprehensiveData.dataset.basic || {};
    
    // Create modal or popup for displaying summary
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'modal fade';
    summaryContainer.id = 'summaryModal';
    
    if (type === 'table') {
      summaryContainer.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Data Quality Evaluation Summary</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <h6>Dataset Information</h6>
                <table class="table table-striped">
                  <tr><th>Dataset Title</th><td>${basic.datasetTitle || 'N/A'}</td></tr>
                  <tr><th>Data Type</th><td>${basic.dataType || 'N/A'}</td></tr>
                  <tr><th>Processing Level</th><td>${basic.dataprocessinglevel || 'N/A'}</td></tr>
                  <tr><th>Evaluator</th><td>${basic.evaluatorName || 'N/A'} (${basic.evaluatorOrg || 'N/A'})</td></tr>
                </table>
              </div>
              <div class="mb-3">
                <h6>Quality Scores</h6>
                <table class="table table-bordered">
                  <thead class="table-dark">
                    <tr><th>Category</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Overall Quality</td><td>${scores.overall || 'N/A'}</td><td>${getGrade(scores.overall)}</td></tr>
                    <tr><td>Design Resolution</td><td>${scores.summary?.byGroup?.['design-resolution']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-resolution']?.average)}</td></tr>
                    <tr><td>Design Coverage</td><td>${scores.summary?.byGroup?.['design-coverage']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-coverage']?.average)}</td></tr>
                    <tr><td>Design Timeliness</td><td>${scores.summary?.byGroup?.['design-timeliness']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-timeliness']?.average)}</td></tr>
                    <tr><td>Conformance</td><td>${scores.summary?.byGroup?.['conformance']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['conformance']?.average)}</td></tr>
                    <tr><td>Context</td><td>${scores.summary?.byGroup?.['context']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['context']?.average)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadSummaryTable()">Download Table</button>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'chart') {
      summaryContainer.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Data Quality Evaluation Chart</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <h6>${basic.datasetTitle || 'Dataset'} - Quality Scores</h6>
                <canvas id="qualityChart" width="400" height="200"></canvas>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadChart()">Download Chart</button>
            </div>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(summaryContainer);
    const modal = new bootstrap.Modal(summaryContainer);
    modal.show();
    
    if (type === 'chart') {
      // Create simple bar chart using canvas
      setTimeout(() => {
        createQualityChart(scores);
      }, 300);
    }
    
    // Clean up modal when closed
    summaryContainer.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(summaryContainer);
    });
  }
  
  // Helper function to get grade based on score
  function getGrade(score) {
    if (!score || isNaN(score)) return 'N/A';
    const num = parseFloat(score);
    if (num >= 4.5) return 'Excellent';
    if (num >= 3.5) return 'Good';
    if (num >= 2.5) return 'Fair';
    if (num >= 1.5) return 'Poor';
    return 'Very Poor';
  }
  
  // Create quality chart using canvas
  function createQualityChart(scores) {
    const canvas = document.getElementById('qualityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categories = ['Overall', 'Design Resolution', 'Design Coverage', 'Design Timeliness', 'Conformance', 'Context'];
    const values = [
      scores.overall || 0,
      scores.summary?.byGroup?.['design-resolution']?.average || 0,
      scores.summary?.byGroup?.['design-coverage']?.average || 0,
      scores.summary?.byGroup?.['design-timeliness']?.average || 0,
      scores.summary?.byGroup?.['conformance']?.average || 0,
      scores.summary?.byGroup?.['context']?.average || 0
    ];
    
    // Draw simple bar chart
    const barWidth = 50;
    const barSpacing = 60;
    const maxHeight = 150;
    const startX = 50;
    const startY = 170;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bars
    values.forEach((value, index) => {
      const height = (value / 5) * maxHeight;
      const x = startX + (index * barSpacing);
      const y = startY - height;
      
      // Bar
      ctx.fillStyle = `hsl(${120 * (value / 5)}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth, height);
      
      // Value label
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1), x + barWidth/2, y - 5);
      
      // Category label
      ctx.save();
      ctx.translate(x + barWidth/2, startY + 15);
      ctx.rotate(-Math.PI/4);
      ctx.font = '10px Arial';
      ctx.fillText(categories[index], 0, 0);
      ctx.restore();
    });
    
    // Y-axis labels
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = startY - (i/5) * maxHeight;
      ctx.fillText(i.toString(), 45, y + 3);
    }
  }

  // Generate visual summary (table or chart)
  function generateVisualSummary(type = 'table') {
    const comprehensiveData = generateComprehensiveExport();
    const scores = comprehensiveData.qualityScores || {};
    const basic = comprehensiveData.dataset.basic || {};
    
    // Create modal or popup for displaying summary
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'modal fade';
    summaryContainer.id = 'summaryModal';
    
    if (type === 'table') {
      summaryContainer.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Data Quality Evaluation Summary</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <h6>Dataset Information</h6>
                <table class="table table-striped">
                  <tr><th>Dataset Title</th><td>${basic.datasetTitle || 'N/A'}</td></tr>
                  <tr><th>Data Type</th><td>${basic.dataType || 'N/A'}</td></tr>
                  <tr><th>Processing Level</th><td>${basic.dataprocessinglevel || 'N/A'}</td></tr>
                  <tr><th>Evaluator</th><td>${basic.evaluatorName || 'N/A'} (${basic.evaluatorOrg || 'N/A'})</td></tr>
                </table>
              </div>
              <div class="mb-3">
                <h6>Quality Scores</h6>
                <table class="table table-bordered">
                  <thead class="table-dark">
                    <tr><th>Category</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Overall Quality</td><td>${scores.overall || 'N/A'}</td><td>${getGrade(scores.overall)}</td></tr>
                    <tr><td>Design Resolution</td><td>${scores.summary?.byGroup?.['design-resolution']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-resolution']?.average)}</td></tr>
                    <tr><td>Design Coverage</td><td>${scores.summary?.byGroup?.['design-coverage']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-coverage']?.average)}</td></tr>
                    <tr><td>Design Timeliness</td><td>${scores.summary?.byGroup?.['design-timeliness']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['design-timeliness']?.average)}</td></tr>
                    <tr><td>Conformance</td><td>${scores.summary?.byGroup?.['conformance']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['conformance']?.average)}</td></tr>
                    <tr><td>Context</td><td>${scores.summary?.byGroup?.['context']?.average || 'N/A'}</td><td>${getGrade(scores.summary?.byGroup?.['context']?.average)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadSummaryTable()">Download Table</button>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'chart') {
      summaryContainer.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Data Quality Evaluation Chart</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <h6>${basic.datasetTitle || 'Dataset'} - Quality Scores</h6>
                <canvas id="qualityChart" width="400" height="200"></canvas>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadChart()">Download Chart</button>
            </div>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(summaryContainer);
    const modal = new bootstrap.Modal(summaryContainer);
    modal.show();
    
    if (type === 'chart') {
      // Create simple bar chart using canvas
      setTimeout(() => {
        createQualityChart(scores);
      }, 300);
    }
    
    // Clean up modal when closed
    summaryContainer.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(summaryContainer);
    });
  }
  
  // Helper function to get grade based on score
  function getGrade(score) {
    if (!score || isNaN(score)) return 'N/A';
    const num = parseFloat(score);
    if (num >= 4.5) return 'Excellent';
    if (num >= 3.5) return 'Good';
    if (num >= 2.5) return 'Fair';
    if (num >= 1.5) return 'Poor';
    return 'Very Poor';
  }
  
  // Create quality chart using canvas
  function createQualityChart(scores) {
    const canvas = document.getElementById('qualityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categories = ['Overall', 'Design Resolution', 'Design Coverage', 'Design Timeliness', 'Conformance', 'Context'];
    const values = [
      scores.overall || 0,
      scores.summary?.byGroup?.['design-resolution']?.average || 0,
      scores.summary?.byGroup?.['design-coverage']?.average || 0,
      scores.summary?.byGroup?.['design-timeliness']?.average || 0,
      scores.summary?.byGroup?.['conformance']?.average || 0,
      scores.summary?.byGroup?.['context']?.average || 0
    ];
    
    // Draw simple bar chart
    const barWidth = 50;
    const barSpacing = 60;
    const maxHeight = 150;
    const startX = 50;
    const startY = 170;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bars
    values.forEach((value, index) => {
      const height = (value / 5) * maxHeight;
      const x = startX + (index * barSpacing);
      const y = startY - height;
      
      // Bar
      ctx.fillStyle = `hsl(${120 * (value / 5)}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth, height);
      
      // Value label
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1), x + barWidth/2, y - 5);
      
      // Category label
      ctx.save();
      ctx.translate(x + barWidth/2, startY + 15);
      ctx.rotate(-Math.PI/4);
      ctx.font = '10px Arial';
      ctx.fillText(categories[index], 0, 0);
      ctx.restore();
    });
    
    // Y-axis labels
    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = startY - (i/5) * maxHeight;
      ctx.fillText(i.toString(), 45, y + 3);
    }
  }

  // Auto-save function for form fields
  function autoSaveField(element) {
    if (!element.id) return;
    
    const mapping = getSectionMapping(element.id);
    let value = element.value;
    
    if (element.type === 'checkbox' || element.type === 'radio') {
      value = element.checked;
    }
    
    const data = { [element.id]: value };
    DataManager.saveSection(mapping.section, mapping.subsection, data);
    
    // Also save to individual localStorage keys for backward compatibility
    if (value && value !== '') {
      localStorage.setItem(element.id, value);
    }
  }
  
  // Auto-save function for scoring fields
  function autoSaveScore(element) {
    if (!element.dataset.scoregroup) return;
    
    const currentPage = window.location.pathname.split('/').pop();
    const sectionMap = {
      'section1.html': 'section1',
      'section2.html': 'section2',
      'section3.html': 'section3',
      'section4.html': 'section4',
      'section5.html': 'section5'
    };
    
    const section = sectionMap[currentPage] || 'unknown';
    DataManager.saveScore(element.id, element.value, element.dataset.scoregroup, section);
  }
  
  // Add event listeners to all form elements for auto-saving
  function initializeAutoSave() {
    // Save on input/change for all form elements
    document.querySelectorAll('input, select, textarea').forEach(element => {
      if (element.id) {
        const events = element.type === 'checkbox' || element.type === 'radio' ? ['change'] : ['input', 'change'];
        
        events.forEach(eventType => {
          element.addEventListener(eventType, () => {
            autoSaveField(element);
            
            // Handle scoring fields
            if (element.classList.contains('score-field')) {
              autoSaveScore(element);
            }
          });
        });
      }
    });
    
    // Special handling for keywords
    const kwInput = document.getElementById('keyword-input');
    if (kwInput) {
      kwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && kwInput.value.trim()) {
          setTimeout(() => {
            const keywords = Array.from(document.querySelectorAll('#keyword-tags .badge')).map(badge => badge.textContent);
            DataManager.saveSection('section2', 'descriptives', { keywords: keywords });
          }, 100);
        }
      });
    }
    
    // Save keywords when tags are clicked/removed
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('badge') && e.target.closest('#keyword-tags')) {
        setTimeout(() => {
          const keywords = Array.from(document.querySelectorAll('#keyword-tags .badge')).map(badge => badge.textContent);
          DataManager.saveSection('section2', 'descriptives', { keywords: keywords });
        }, 100);
      }
    });
  }
  
  // Restore data when page loads
  DataManager.restoreCurrentPageData();
  
  // Initialize auto-saving
  initializeAutoSave();
  
  // Handle accuracy type radio buttons in Section 4
  function handleAccuracyTypeChange() {
    // Hide all accuracy input sections first
    const accuracyInputs = document.querySelectorAll('#accuracy-inputs > div');
    accuracyInputs.forEach(input => {
      input.style.display = 'none';
    });
    
    // Get selected accuracy type
    const selectedType = document.querySelector('input[name="accuracyType"]:checked');
    if (selectedType) {
      const value = selectedType.value;
      
      // Map radio button values to correct div IDs
      const targetIdMap = {
        'thematic': 'thematic-accuracy',
        'attribute': 'attribute-accuracy',
        'model': 'model-performance',
        'plausibility': 'data-plausibility'
      };
      
      const targetId = targetIdMap[value];
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.style.display = 'block';
        console.log('Showing accuracy input for:', value, '-> div ID:', targetId);
      } else {
        console.error('Target element not found for accuracy type:', value, '-> expected ID:', targetId);
      }
      
      // Save the selected accuracy type
      DataManager.saveSection('section4', 'conformance', { accuracyType: value });
      console.log('Accuracy type changed to:', value);
    }
  }
  
  // Initialize accuracy type handlers on Section 4
  if (window.location.pathname.includes('section4.html')) {
    document.querySelectorAll('input[name="accuracyType"]').forEach(radio => {
      radio.addEventListener('change', handleAccuracyTypeChange);
    });
    
    // Restore selected accuracy type on page load
    setTimeout(() => {
      const savedData = DataManager.getSection('section4', 'conformance');
      if (savedData && savedData.accuracyType) {
        const radioToCheck = document.querySelector(`input[name="accuracyType"][value="${savedData.accuracyType}"]`);
        if (radioToCheck) {
          radioToCheck.checked = true;
          handleAccuracyTypeChange();
        }
      }
    }, 100);
  }

  // Save data before page unload
  window.addEventListener('beforeunload', () => {
    const formData = DataManager.collectCurrentPageData();
    const currentPage = window.location.pathname.split('/').pop();
    const sectionMap = {
      'section1.html': 'section1',
      'section2.html': 'section2',
      'section3.html': 'section3',
      'section4.html': 'section4',
      'section5.html': 'section5'
    };
    
    const section = sectionMap[currentPage];
    if (section) {
      DataManager.saveSection(section, 'general', formData);
    }
  });
  
});

// Helper function to get color for grades  
function getGradeColor(score) {
  if (!score || isNaN(score)) return 'secondary';
  const num = parseFloat(score);
  if (num >= 4.5) return 'success';
  if (num >= 3.5) return 'primary';
  if (num >= 2.5) return 'warning';
  if (num >= 1.5) return 'danger';
  return 'danger';
}

// Simple reliable summary function
function showSimpleSummary() {
  console.log('showSimpleSummary called');
  
  // Get data from localStorage - this is where form data is stored
  const datasetTitle = localStorage.getItem('datasetTitle') || 'Not specified';
  const dataType = localStorage.getItem('dataType') || 'Not specified';
  const processingLevel = localStorage.getItem('dataprocessinglevel') || 'Not specified';
  const evaluationType = localStorage.getItem('evaluationType') || 'Not specified';
  const evaluatorName = localStorage.getItem('evaluatorName') || 'Not specified';
  const evaluatorOrg = localStorage.getItem('evaluatorOrg') || 'Not specified';
  const language = localStorage.getItem('languageDropdown') || 'Not specified';
  const useCaseDesc = localStorage.getItem('useCaseDescription') || 'Not specified';
  
  console.log('Data collected:', {datasetTitle, dataType, processingLevel});
  
  // Create simple modal HTML
  const modalHTML = `
    <div class="modal fade" id="simpleSummaryModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Data Quality Evaluation Summary</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-12">
                <h6>Dataset Information</h6>
                <table class="table table-striped">
                  <tr><th>Dataset Title</th><td>${datasetTitle}</td></tr>
                  <tr><th>Data Type</th><td>${dataType}</td></tr>
                  <tr><th>Processing Level</th><td>${processingLevel}</td></tr>
                  <tr><th>Evaluation Type</th><td>${evaluationType}</td></tr>
                  <tr><th>Language</th><td>${language}</td></tr>
                  <tr><th>Evaluator</th><td>${evaluatorName}</td></tr>
                  <tr><th>Organization</th><td>${evaluatorOrg}</td></tr>
                  <tr><th>Use Case Description</th><td>${useCaseDesc}</td></tr>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="downloadSimpleSummary()">Download Report</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existing = document.getElementById('simpleSummaryModal');
  if (existing) {
    existing.remove();
  }
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modalElement = document.getElementById('simpleSummaryModal');
  if (modalElement) {
    // Try bootstrap first, fall back to manual
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      // Manual modal show
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.setAttribute('role', 'dialog');
      document.body.classList.add('modal-open');
    }
  }
}

// Simple download function
function downloadSimpleSummary() {
  const datasetTitle = localStorage.getItem('datasetTitle') || 'Dataset';
  const dataType = localStorage.getItem('dataType') || 'Not specified';
  const processingLevel = localStorage.getItem('dataprocessinglevel') || 'Not specified';
  const evaluationType = localStorage.getItem('evaluationType') || 'Not specified';
  const evaluatorName = localStorage.getItem('evaluatorName') || 'Not specified';
  const evaluatorOrg = localStorage.getItem('evaluatorOrg') || 'Not specified';
  const language = localStorage.getItem('languageDropdown') || 'Not specified';
  const useCaseDesc = localStorage.getItem('useCaseDescription') || 'Not specified';
  
  const summaryText = `DATA QUALITY EVALUATION SUMMARY
=====================================

DATASET INFORMATION:
- Title: ${datasetTitle}
- Data Type: ${dataType}  
- Processing Level: ${processingLevel}
- Evaluation Type: ${evaluationType}
- Language: ${language}
- Evaluator: ${evaluatorName}
- Organization: ${evaluatorOrg}

USE-CASE INFORMATION:
- Description: ${useCaseDesc}

=====================================
Generated on: ${new Date().toLocaleString()}`;
  
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Summary.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Improved visual summary function that actually shows form data
function showImprovedSummary() {
  console.log('showImprovedSummary called');
  try {
    const comprehensiveData = generateComprehensiveExport();
    console.log('Comprehensive data:', comprehensiveData);
    const scores = comprehensiveData.qualityScores || {};
    
    // Get all data with localStorage fallback
    const datasetTitle = localStorage.getItem('datasetTitle') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.datasetTitle) || 'Not specified';
    const dataType = localStorage.getItem('dataType') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.dataType) || 'Not specified';
    const processingLevel = localStorage.getItem('dataprocessinglevel') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.dataprocessinglevel) || 'Not specified';
    const evaluationType = localStorage.getItem('evaluationType') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.evaluationType) || 'Not specified';
    const evaluatorName = localStorage.getItem('evaluatorName') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.evaluatorName) || 'Not specified';
    const evaluatorOrg = localStorage.getItem('evaluatorOrg') || (comprehensiveData.dataset && comprehensiveData.dataset.basic && comprehensiveData.dataset.basic.evaluatorOrg) || 'Not specified';
    const language = localStorage.getItem('languageDropdown') || (comprehensiveData.descriptives && comprehensiveData.descriptives.languageDropdown) || 'Not specified';
    const useCaseDesc = localStorage.getItem('useCaseDescription') || (comprehensiveData.dataset && comprehensiveData.dataset.useCase && comprehensiveData.dataset.useCase.useCaseDescription) || 'Not specified';
    const optimumDate = localStorage.getItem('optimumDataCollection') || (comprehensiveData.dataset && comprehensiveData.dataset.useCase && comprehensiveData.dataset.useCase.optimumDataCollection) || 'Not specified';
    const aoiType = localStorage.getItem('aoiType') || 'Not specified';
  
  // Remove any existing modal first
  const existingModal = document.getElementById('improvedSummaryModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal
  const summaryContainer = document.createElement('div');
  summaryContainer.className = 'modal fade';
  summaryContainer.id = 'improvedSummaryModal';
  
  console.log('Creating summary with data:', {datasetTitle, dataType, processingLevel});
  
  summaryContainer.innerHTML = `
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Data Quality Evaluation Summary - ${datasetTitle}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <h6>Dataset Information</h6>
                <table class="table table-striped table-sm">
                  <tr><th>Dataset Title</th><td>${datasetTitle}</td></tr>
                  <tr><th>Data Type</th><td>${dataType}</td></tr>
                  <tr><th>Processing Level</th><td>${processingLevel}</td></tr>
                  <tr><th>Evaluation Type</th><td>${evaluationType}</td></tr>
                  <tr><th>Language</th><td>${language}</td></tr>
                  <tr><th>Evaluator</th><td>${evaluatorName}</td></tr>
                  <tr><th>Organization</th><td>${evaluatorOrg}</td></tr>
                </table>
              </div>
              <div class="mb-3">
                <h6>Use Case Information</h6>
                <table class="table table-striped table-sm">
                  <tr><th>Description</th><td>${useCaseDesc}</td></tr>
                  <tr><th>Optimum Collection Date</th><td>${optimumDate}</td></tr>
                  <tr><th>AOI Type</th><td>${aoiType}</td></tr>
                </table>
              </div>
              <div class="mb-3">
                <h6>Quality Scores</h6>
                <table class="table table-bordered table-sm">
                  <thead class="table-dark">
                    <tr><th>Category</th><th>Score</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Overall Quality</td><td>${scores.overall || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.overall)}">${getGrade(scores.overall)}</span></td></tr>
                    <tr><td>Design Resolution</td><td>${scores.summary?.byGroup?.['design-resolution']?.average || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.summary?.byGroup?.['design-resolution']?.average)}">${getGrade(scores.summary?.byGroup?.['design-resolution']?.average)}</span></td></tr>
                    <tr><td>Design Coverage</td><td>${scores.summary?.byGroup?.['design-coverage']?.average || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.summary?.byGroup?.['design-coverage']?.average)}">${getGrade(scores.summary?.byGroup?.['design-coverage']?.average)}</span></td></tr>
                    <tr><td>Design Timeliness</td><td>${scores.summary?.byGroup?.['design-timeliness']?.average || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.summary?.byGroup?.['design-timeliness']?.average)}">${getGrade(scores.summary?.byGroup?.['design-timeliness']?.average)}</span></td></tr>
                    <tr><td>Conformance</td><td>${scores.summary?.byGroup?.['conformance']?.average || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.summary?.byGroup?.['conformance']?.average)}">${getGrade(scores.summary?.byGroup?.['conformance']?.average)}</span></td></tr>
                    <tr><td>Context</td><td>${scores.summary?.byGroup?.['context']?.average || 'Not assessed'}</td><td><span class="badge bg-${getGradeColor(scores.summary?.byGroup?.['context']?.average)}">${getGrade(scores.summary?.byGroup?.['context']?.average)}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <h6>Quality Scores Chart - ${datasetTitle}</h6>
                <canvas id="improvedQualityChart" width="400" height="300" style="border: 1px solid #ddd; border-radius: 5px;"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="downloadImprovedSummaryReport('${datasetTitle}', '${dataType}', '${processingLevel}', '${evaluationType}', '${evaluatorName}', '${evaluatorOrg}', '${language}', '${useCaseDesc}', '${optimumDate}')">Download Report</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(summaryContainer);
  
  // Check if bootstrap is available
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modal = new bootstrap.Modal(summaryContainer);
    modal.show();
  } else {
    console.warn('Bootstrap not available, showing modal manually');
    summaryContainer.classList.add('show');
    summaryContainer.style.display = 'block';
  }
  
  // Create chart after modal is shown
  setTimeout(() => {
    const canvas = document.getElementById('improvedQualityChart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const categories = ['Overall', 'Design Resolution', 'Design Coverage', 'Design Timeliness', 'Conformance', 'Context'];
      const values = [
        scores.overall || 0,
        scores.summary?.byGroup?.['design-resolution']?.average || 0,
        scores.summary?.byGroup?.['design-coverage']?.average || 0,
        scores.summary?.byGroup?.['design-timeliness']?.average || 0,
        scores.summary?.byGroup?.['conformance']?.average || 0,
        scores.summary?.byGroup?.['context']?.average || 0
      ];
      
      // Draw simple bar chart
      const barWidth = 50;
      const barSpacing = 60;
      const maxHeight = 150;
      const startX = 50;
      const startY = 170;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw bars
      values.forEach((value, index) => {
        const height = (value / 5) * maxHeight;
        const x = startX + (index * barSpacing);
        const y = startY - height;
        
        // Bar
        ctx.fillStyle = `hsl(${120 * (value / 5)}, 70%, 50%)`;
        ctx.fillRect(x, y, barWidth, height);
        
        // Value label
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), x + barWidth/2, y - 5);
        
        // Category label
        ctx.save();
        ctx.translate(x + barWidth/2, startY + 15);
        ctx.rotate(-Math.PI/4);
        ctx.font = '10px Arial';
        ctx.fillText(categories[index], 0, 0);
        ctx.restore();
      });
      
      // Y-axis labels
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const y = startY - (i/5) * maxHeight;
        ctx.fillText(i.toString(), 45, y + 3);
      }
    }
  }, 300);
  
  // Clean up modal when closed
  summaryContainer.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(summaryContainer);
  });
  
  } catch (error) {
    console.error('Error showing summary:', error);
    alert('Error generating summary. Please check the browser console for details.');
  }
}

// Function to download improved summary report
function downloadImprovedSummaryReport(datasetTitle, dataType, processingLevel, evaluationType, evaluatorName, evaluatorOrg, language, useCaseDesc, optimumDate) {
  const comprehensiveData = generateComprehensiveExport();
  const scores = comprehensiveData.qualityScores || {};
  
  // Create comprehensive summary text
  const summaryText = `DATA QUALITY EVALUATION SUMMARY
=====================================

DATASET INFORMATION:
- Title: ${datasetTitle}
- Data Type: ${dataType}
- Processing Level: ${processingLevel}
- Evaluation Type: ${evaluationType}
- Language: ${language}
- Evaluator: ${evaluatorName}
- Organization: ${evaluatorOrg}

USE-CASE SPECIFIC REQUIREMENTS:
- Description: ${useCaseDesc}
- Optimum Collection Date: ${optimumDate}

QUALITY ASSESSMENT SCORES:
- Overall Quality: ${scores.overall || 'Not assessed yet'} (${getGrade(scores.overall)})
- Design Resolution: ${scores.summary?.byGroup?.['design-resolution']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-resolution']?.average)})
- Design Coverage: ${scores.summary?.byGroup?.['design-coverage']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-coverage']?.average)})
- Design Timeliness: ${scores.summary?.byGroup?.['design-timeliness']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-timeliness']?.average)})
- Conformance: ${scores.summary?.byGroup?.['conformance']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['conformance']?.average)})
- Context: ${scores.summary?.byGroup?.['context']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['context']?.average)})

EVALUATION METADATA:
- Created: ${comprehensiveData.timestamps?.created || 'Not available'}
- Last Modified: ${comprehensiveData.timestamps?.lastModified || 'Not available'}

=====================================
Generated on: ${new Date().toLocaleString()}`;
  
  // Download as text file
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Summary_${new Date().toISOString().slice(0, 10)}.txt`;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Summary report downloaded successfully!');
}

// Function to download summary report
function downloadSummaryReport() {
  const comprehensiveData = generateComprehensiveExport();
  const basic = comprehensiveData.dataset?.basic || {};
  const useCase = comprehensiveData.dataset?.useCase || {};
  const descriptives = comprehensiveData.descriptives || {};
  const design = comprehensiveData.design || {};
  const scores = comprehensiveData.qualityScores || {};
  
  // Get data with localStorage fallback
  const datasetTitle = basic.datasetTitle || localStorage.getItem('datasetTitle') || 'Dataset';
  const dataType = basic.dataType || localStorage.getItem('dataType') || 'Not specified';
  const processingLevel = basic.dataprocessinglevel || localStorage.getItem('dataprocessinglevel') || 'Not specified';
  const evaluationType = basic.evaluationType || localStorage.getItem('evaluationType') || 'Not specified';
  const evaluatorName = basic.evaluatorName || localStorage.getItem('evaluatorName') || 'Not specified';
  const evaluatorOrg = basic.evaluatorOrg || localStorage.getItem('evaluatorOrg') || 'Not specified';
  const language = descriptives.languageDropdown || localStorage.getItem('languageDropdown') || 'Not specified';
  const useCaseDesc = useCase.useCaseDescription || localStorage.getItem('useCaseDescription') || 'Not specified';
  const optimumDate = useCase.optimumDataCollection || localStorage.getItem('optimumDataCollection') || 'Not specified';
  
  // Create comprehensive summary text
  const summaryText = `DATA QUALITY EVALUATION SUMMARY
=====================================

DATASET INFORMATION:
- Title: ${datasetTitle}
- Data Type: ${dataType}
- Processing Level: ${processingLevel}
- Evaluation Type: ${evaluationType}
- Language: ${language}
- Evaluator: ${evaluatorName}
- Organization: ${evaluatorOrg}

USE-CASE SPECIFIC REQUIREMENTS:
- Description: ${useCaseDesc}
- Optimum Collection Date: ${optimumDate}
- AOI Coverage: ${design.spatialCoverage?.aoiCoverage || 'Not specified'}
- Cloud Cover: ${design.spatialCoverage?.cloudCover || 'Not specified'}

QUALITY ASSESSMENT SCORES:
- Overall Quality: ${scores.overall || 'Not assessed yet'} (${getGrade(scores.overall)})
- Design Resolution: ${scores.summary?.byGroup?.['design-resolution']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-resolution']?.average)})
- Design Coverage: ${scores.summary?.byGroup?.['design-coverage']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-coverage']?.average)})
- Design Timeliness: ${scores.summary?.byGroup?.['design-timeliness']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['design-timeliness']?.average)})
- Conformance: ${scores.summary?.byGroup?.['conformance']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['conformance']?.average)})
- Context: ${scores.summary?.byGroup?.['context']?.average || 'Not assessed yet'} (${getGrade(scores.summary?.byGroup?.['context']?.average)})

EVALUATION METADATA:
- Created: ${comprehensiveData.timestamps?.created || 'Not available'}
- Last Modified: ${comprehensiveData.timestamps?.lastModified || 'Not available'}

=====================================
Generated on: ${new Date().toLocaleString()}`;
  
  // Download as text file
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `${datasetTitle.replace(/[^a-z0-9]/gi, '_')}_Summary_${new Date().toISOString().slice(0, 10)}.txt`;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Summary report downloaded successfully!');
}

// Simple submit handler

document.addEventListener('DOMContentLoaded', function(){
  const submitBtn = document.getElementById('submitForm');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Form submitted successfully!');
      
      // Clear survey data
      localStorage.removeItem('surveyData');
      localStorage.removeItem('dataProcessingLevel');
      localStorage.removeItem('evaluationType');
      localStorage.removeItem('dataType');
      
      // Refresh the page take me to home
      window.location.href = '../index.html';
    });
  }
});

