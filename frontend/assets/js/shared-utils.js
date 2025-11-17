// ============================================
// SHARED UTILITIES & DATA MANAGEMENT
// ============================================

// Helper function to get all stored surveys from localStorage
export function getAllStoredSurveys() {
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

// ---- COMPREHENSIVE DATA MANAGEMENT SYSTEM ----
export const DataManager = {
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
  
  // Restore form data on page load
  restorePageData() {
    const currentPage = window.location.pathname.split('/').pop();
    const sectionMap = {
      'section1.html': 'section1',
      'section2.html': 'section2',
      'section3.html': 'section3',
      'section4.html': 'section4',
      'section5.html': 'section5',
      'section6.html': 'section6'
    };
    
    const section = sectionMap[currentPage];
    const data = this.getSection(section, 'general');
    
    // Restore keywords if present
    if (data.descriptives?.keywords) {
      const keywordTags = document.getElementById('keyword-tags');
      if (keywordTags) {
        data.descriptives.keywords.forEach(keyword => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-info me-1 mb-1';
          badge.textContent = keyword;
          keywordTags.appendChild(badge);
        });
      }
    }
    
    // Restore form values
    Object.keys(data).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = data[key];
        } else {
          element.value = data[key];
        }
      }
    });
  }
};

// ---- NAVBAR SECTION HIGHLIGHTING ----
export function highlightActiveSection(sectionName) {
  // Remove active class from all nav links
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to matching nav link
  const navLink = document.querySelector(`.navbar-nav .nav-link[data-section="${sectionName}"]`);
  if (navLink) {
    navLink.classList.add('active');
  }
}

// Get current section from page URL
export function getCurrentSection() {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage.includes('section1')) return 'section1';
  if (currentPage.includes('section2')) return 'section2';
  if (currentPage.includes('section3')) return 'section3';
  if (currentPage.includes('section4')) return 'section4';
  if (currentPage.includes('section5')) return 'section5';
  if (currentPage.includes('section6')) return 'section6';
  return null;
}

// Initialize highlighting on section pages
export function initializeHighlighting() {
  const currentPage = window.location.pathname.split('/').pop();
  const isHomePage = currentPage === '' || currentPage === 'index.html' || currentPage.endsWith('/');
  
  if (!isHomePage) {
    const currentSection = getCurrentSection();
    if (currentSection) {
      highlightActiveSection(currentSection);
    }
  }
}

// ---- CONFORMANCE VISIBILITY ----
export function applyConformanceVisibility(processingLevel) {
  const conf = document.getElementById('conformance');
  const toc = document.getElementById('conformance-toc');
  const navConf = document.getElementById('nav-conformance');
  
  console.log('applyConformanceVisibility called with:', processingLevel);
  
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

// Update navigation buttons to skip conformance when hidden
export function updateNavigationButtons() {
  const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  const isConformanceHidden = savedProcessingLevel === 'primary';
  
  console.log('updateNavigationButtons called, isConformanceHidden:', isConformanceHidden);
  
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'section3.html' && isConformanceHidden) {
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
  
  if (currentPage === 'section5.html' && isConformanceHidden) {
    const prevBtns = document.querySelectorAll('a[href="section4.html"]');
    prevBtns.forEach(btn => {
      if (btn.classList.contains('btn-previous') || btn.textContent.includes('Previous')) {
        btn.href = 'section3.html';
        if (btn.textContent.includes('Previous')) {
          btn.innerHTML = btn.innerHTML.replace('Previous', 'Skip to Design');
        }
        console.log('Updated previous button on section5 to skip to section3');
      }
    });
  }
}

// Helper function to get color for grades  
export function getGradeColor(score) {
  if (!score || isNaN(score)) return 'secondary';
  const num = parseFloat(score);
  if (num >= 4.5) return 'success';
  if (num >= 3.5) return 'primary';
  if (num >= 2.5) return 'warning';
  if (num >= 1.5) return 'danger';
  return 'danger';
}

// Get grade text from score
export function getGrade(score) {
  if (!score || isNaN(score)) return 'N/A';
  const num = parseFloat(score);
  if (num >= 4.5) return 'Excellent';
  if (num >= 3.5) return 'Good';
  if (num >= 2.5) return 'Satisfactory';
  if (num >= 1.5) return 'Poor';
  return 'Very Poor';
}

// ---- CLEAR ALL SURVEY DATA ----
export function clearAllSurveyData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Remove all survey-related keys
    if (key && (key.includes('dataset') || key.includes('data') || key.includes('evaluator') || 
                key.includes('evaluation') || key.includes('survey') || key.includes('section') ||
                key.includes('keyword') || key.includes('language') || key.includes('documentation') ||
                key.includes('accessibility') || key.includes('metadata') || key.includes('optimum') ||
                key.includes('spatial') || key.includes('aoi') || key.includes('creator') ||
                key.includes('conformance') || key.includes('accuracy') || key.includes('quality') ||
                key.includes('reputation') || key.includes('lineage') || key.includes('processing') ||
                key.includes('useCase') || key.includes('org') || key.includes('completed') ||
                key.includes('Submitted') || key === 'surveyData')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} survey-related localStorage items`);
}
