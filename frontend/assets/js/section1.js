function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ============================================
// SECTION 1: INITIAL INFORMATION 
// ============================================
// Saves critical data to backend database for persistence
// Uses sessionStorage for inter-section communication only
// No localStorage operations

import { initializeHighlighting, applyConformanceVisibility, updateNavigationButtons } from './shared-utils.js';

// Database API configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Update with your backend URL

// Save data to backend database
async function saveToDatabase(key, value) {
  try {
    await fetch(`${API_BASE_URL}/survey/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, timestamp: new Date().toISOString() })
    });
  } catch (error) {
    console.warn(`Database save error: ${error.message}`);
  }
}

// Save key values for inter-section communication
function saveFormValue(key, value) {
  sessionStorage.setItem(key, value);
  saveToDatabase(key, value);
  console.log(`Saved: ${key} = ${value}`);
}

document.addEventListener('DOMContentLoaded', function () {
  initializeHighlighting();

  // ---- SETUP HTML TOOLTIPS ----
  document.querySelectorAll('.info-icon[data-tooltip]').forEach(el => {
    const html = el.getAttribute('data-tooltip');
    if (html.includes('<')) {
      el.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'html-tooltip';
        tooltip.innerHTML = html;
        el.appendChild(tooltip);
      });
      el.addEventListener('mouseleave', () => {
        el.querySelector('.html-tooltip')?.remove();
      });
    }
  });

  // ---- DATA PROCESSING LEVEL (Primary vs Products) - CRITICAL ----
  const dataProcessingLevel = document.getElementById('dataprocessinglevel');
  if (dataProcessingLevel) {
    dataProcessingLevel.addEventListener('change', function() {
      saveFormValue('dataProcessingLevel', this.value);
      applyConformanceVisibility(this.value);
      updateNavigationButtons();
      // Broadcast processing level change to all sections via custom event
      window.dispatchEvent(new CustomEvent('processingLevelChanged', { detail: { processingLevel: this.value } }));
    });
    dataProcessingLevel.dispatchEvent(new Event('change'));
  }

  // ---- EVALUATION TYPE (Use-case vs General) - CRITICAL ----
  const evaluationType = document.getElementById('evaluationType');
  const useCaseSection = document.getElementById('use-case-section');
  
  if (evaluationType) {
    evaluationType.addEventListener('change', function() {
      saveFormValue('evaluationType', this.value);
      
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
      
      // Broadcast evaluation type change to all sections via custom event
      window.dispatchEvent(new CustomEvent('evaluationTypeChanged', { detail: { evaluationType: this.value } }));
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
      saveFormValue('dataType', this.value);
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
        saveFormValue(key, this.value);
        // Also save a unified aggregation level if applicable
        if (key === 'optimumSurveyAggregation' || key === 'optimumPredictionSpatialResolution') {
          saveToDatabase('optimumAggregationLevel', this.value);
        }
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
        saveFormValue(key, this.value);
      });
    }
  });

  // ==========================================================
  // AREA OF INTEREST (AOI) - TYPE SWITCH (dropdown/coords/upload)
  // ==========================================================
  const aoiType = document.getElementById('aoiType');
  const aoiDropdownContainer = document.getElementById('aoi-dropdown');
  const aoiCoordinates = document.getElementById('aoi-coordinates');
  const aoiUpload = document.getElementById('aoi-upload');
  
  if (aoiType) {
    aoiType.addEventListener('change', function() {
      saveToDatabase('aoiType', this.value);
      
      [aoiDropdownContainer, aoiCoordinates, aoiUpload].forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      if (this.value === 'dropdown' && aoiDropdownContainer) aoiDropdownContainer.style.display = 'block';
      else if (this.value === 'coordinates' && aoiCoordinates) aoiCoordinates.style.display = 'block';
      else if (this.value === 'upload' && aoiUpload) aoiUpload.style.display = 'block';
    });
    aoiType.dispatchEvent(new Event('change'));
  }

  // ==========================================================
  // AOI SELECT2-STYLE DROPDOWN
  // ==========================================================

// =========================
// Full ISO-3166 Dataset
// =========================

const ISO_LOCATIONS = [
  // --- CONTINENTS ---
  { value: "global", label: "Global" },
  { value: "africa", label: "Africa" },
  { value: "asia", label: "Asia" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "oceania", label: "Oceania" },
  { value: "antarctica", label: "Antarctica" },

  // --- COUNTRIES (ISO 3166-1 alpha-2) ---
  { value: "AF", label: "Afghanistan (AF)" },
  { value: "AX", label: "Aland Islands (AX)" },
  { value: "AL", label: "Albania (AL)" },
  { value: "DZ", label: "Algeria (DZ)" },
  { value: "AS", label: "American Samoa (AS)" },
  { value: "AD", label: "Andorra (AD)" },
  { value: "AO", label: "Angola (AO)" },
  { value: "AI", label: "Anguilla (AI)" },
  { value: "AQ", label: "Antarctica (AQ)" },
  { value: "AG", label: "Antigua and Barbuda (AG)" },
  { value: "AR", label: "Argentina (AR)" },
  { value: "AM", label: "Armenia (AM)" },
  { value: "AW", label: "Aruba (AW)" },
  { value: "AU", label: "Australia (AU)" },
  { value: "AT", label: "Austria (AT)" },
  { value: "AZ", label: "Azerbaijan (AZ)" },
  { value: "BS", label: "Bahamas (BS)" },
  { value: "BH", label: "Bahrain (BH)" },
  { value: "BD", label: "Bangladesh (BD)" },
  { value: "BB", label: "Barbados (BB)" },
  { value: "BY", label: "Belarus (BY)" },
  { value: "BE", label: "Belgium (BE)" },
  { value: "BZ", label: "Belize (BZ)" },
  { value: "BJ", label: "Benin (BJ)" },
  { value: "BM", label: "Bermuda (BM)" },
  { value: "BT", label: "Bhutan (BT)" },
  { value: "BO", label: "Bolivia (BO)" },
  { value: "BQ", label: "Bonaire, Sint Eustatius and Saba (BQ)" },
  { value: "BA", label: "Bosnia and Herzegovina (BA)" },
  { value: "BW", label: "Botswana (BW)" },
  { value: "BV", label: "Bouvet Island (BV)" },
  { value: "BR", label: "Brazil (BR)" },
  { value: "IO", label: "British Indian Ocean Territory (IO)" },
  { value: "BN", label: "Brunei Darussalam (BN)" },
  { value: "BG", label: "Bulgaria (BG)" },
  { value: "BF", label: "Burkina Faso (BF)" },
  { value: "BI", label: "Burundi (BI)" },
  { value: "KH", label: "Cambodia (KH)" },
  { value: "CM", label: "Cameroon (CM)" },
  { value: "CA", label: "Canada (CA)" },
  { value: "CV", label: "Cape Verde (CV)" },
  { value: "KY", label: "Cayman Islands (KY)" },
  { value: "CF", label: "Central African Republic (CF)" },
  { value: "TD", label: "Chad (TD)" },
  { value: "CL", label: "Chile (CL)" },
  { value: "CN", label: "China (CN)" },
  { value: "CX", label: "Christmas Island (CX)" },
  { value: "CC", label: "Cocos Islands (CC)" },
  { value: "CO", label: "Colombia (CO)" },
  { value: "KM", label: "Comoros (KM)" },
  { value: "CG", label: "Congo (CG)" },
  { value: "CD", label: "Congo, Democratic Republic (CD)" },
  { value: "CK", label: "Cook Islands (CK)" },
  { value: "CR", label: "Costa Rica (CR)" },
  { value: "CI", label: "Côte d’Ivoire (CI)" },
  { value: "HR", label: "Croatia (HR)" },
  { value: "CU", label: "Cuba (CU)" },
  { value: "CW", label: "Curaçao (CW)" },
  { value: "CY", label: "Cyprus (CY)" },
  { value: "CZ", label: "Czech Republic (CZ)" },
  { value: "DK", label: "Denmark (DK)" },
  { value: "DJ", label: "Djibouti (DJ)" },
  { value: "DM", label: "Dominica (DM)" },
  { value: "DO", label: "Dominican Republic (DO)" },
  { value: "EC", label: "Ecuador (EC)" },
  { value: "EG", label: "Egypt (EG)" },
  { value: "SV", label: "El Salvador (SV)" },
  { value: "GQ", label: "Equatorial Guinea (GQ)" },
  { value: "ER", label: "Eritrea (ER)" },
  { value: "EE", label: "Estonia (EE)" },
  { value: "SZ", label: "Eswatini (SZ)" },
  { value: "ET", label: "Ethiopia (ET)" },
  { value: "FK", label: "Falkland Islands (FK)" },
  { value: "FO", label: "Faroe Islands (FO)" },
  { value: "FJ", label: "Fiji (FJ)" },
  { value: "FI", label: "Finland (FI)" },
  { value: "FR", label: "France (FR)" },
  { value: "GF", label: "French Guiana (GF)" },
  { value: "PF", label: "French Polynesia (PF)" },
  { value: "TF", label: "French Southern Territories (TF)" },
  { value: "GA", label: "Gabon (GA)" },
  { value: "GM", label: "Gambia (GM)" },
  { value: "GE", label: "Georgia (GE)" },
  { value: "DE", label: "Germany (DE)" },
  { value: "GH", label: "Ghana (GH)" },
  { value: "GI", label: "Gibraltar (GI)" },
  { value: "GR", label: "Greece (GR)" },
  { value: "GL", label: "Greenland (GL)" },
  { value: "GD", label: "Grenada (GD)" },
  { value: "GP", label: "Guadeloupe (GP)" },
  { value: "GU", label: "Guam (GU)" },
  { value: "GT", label: "Guatemala (GT)" },
  { value: "GG", label: "Guernsey (GG)" },
  { value: "GN", label: "Guinea (GN)" },
  { value: "GW", label: "Guinea-Bissau (GW)" },
  { value: "GY", label: "Guyana (GY)" },
  { value: "HT", label: "Haiti (HT)" },
  { value: "HM", label: "Heard Island and McDonald Islands (HM)" },
  { value: "VA", label: "Vatican City (VA)" },
  { value: "HN", label: "Honduras (HN)" },
  { value: "HK", label: "Hong Kong (HK)" },
  { value: "HU", label: "Hungary (HU)" },
  { value: "IS", label: "Iceland (IS)" },
  { value: "IN", label: "India (IN)" },
  { value: "ID", label: "Indonesia (ID)" },
  { value: "IR", label: "Iran (IR)" },
  { value: "IQ", label: "Iraq (IQ)" },
  { value: "IE", label: "Ireland (IE)" },
  { value: "IM", label: "Isle of Man (IM)" },
  { value: "IL", label: "Israel (IL)" },
  { value: "IT", label: "Italy (IT)" },
  { value: "JM", label: "Jamaica (JM)" },
  { value: "JP", label: "Japan (JP)" },
  { value: "JE", label: "Jersey (JE)" },
  { value: "JO", label: "Jordan (JO)" },
  { value: "KZ", label: "Kazakhstan (KZ)" },
  { value: "KE", label: "Kenya (KE)" },
  { value: "KI", label: "Kiribati (KI)" },
  { value: "KP", label: "North Korea (KP)" },
  { value: "KR", label: "South Korea (KR)" },
  { value: "KW", label: "Kuwait (KW)" },
  { value: "KG", label: "Kyrgyzstan (KG)" },
  { value: "LA", label: "Laos (LA)" },
  { value: "LV", label: "Latvia (LV)" },
  { value: "LB", label: "Lebanon (LB)" },
  { value: "LS", label: "Lesotho (LS)" },
  { value: "LR", label: "Liberia (LR)" },
  { value: "LY", label: "Libya (LY)" },
  { value: "LI", label: "Liechtenstein (LI)" },
  { value: "LT", label: "Lithuania (LT)" },
  { value: "LU", label: "Luxembourg (LU)" },
  { value: "MO", label: "Macao (MO)" },
  { value: "MG", label: "Madagascar (MG)" },
  { value: "MW", label: "Malawi (MW)" },
  { value: "MY", label: "Malaysia (MY)" },
  { value: "MV", label: "Maldives (MV)" },
  { value: "ML", label: "Mali (ML)" },
  { value: "MT", label: "Malta (MT)" },
  { value: "MH", label: "Marshall Islands (MH)" },
  { value: "MQ", label: "Martinique (MQ)" },
  { value: "MR", label: "Mauritania (MR)" },
  { value: "MU", label: "Mauritius (MU)" },
  { value: "YT", label: "Mayotte (YT)" },
  { value: "MX", label: "Mexico (MX)" },
  { value: "FM", label: "Micronesia (FM)" },
  { value: "MD", label: "Moldova (MD)" },
  { value: "MC", label: "Monaco (MC)" },
  { value: "MN", label: "Mongolia (MN)" },
  { value: "ME", label: "Montenegro (ME)" },
  { value: "MS", label: "Montserrat (MS)" },
  { value: "MA", label: "Morocco (MA)" },
  { value: "MZ", label: "Mozambique (MZ)" },
  { value: "MM", label: "Myanmar (MM)" },
  { value: "NA", label: "Namibia (NA)" },
  { value: "NR", label: "Nauru (NR)" },
  { value: "NP", label: "Nepal (NP)" },
  { value: "NL", label: "Netherlands (NL)" },
  { value: "NC", label: "New Caledonia (NC)" },
  { value: "NZ", label: "New Zealand (NZ)" },
  { value: "NI", label: "Nicaragua (NI)" },
  { value: "NE", label: "Niger (NE)" },
  { value: "NG", label: "Nigeria (NG)" },
  { value: "NU", label: "Niue (NU)" },
  { value: "NF", label: "Norfolk Island (NF)" },
  { value: "MK", label: "North Macedonia (MK)" },
  { value: "MP", label: "Northern Mariana Islands (MP)" },
  { value: "NO", label: "Norway (NO)" },
  { value: "OM", label: "Oman (OM)" },
  { value: "PK", label: "Pakistan (PK)" },
  { value: "PW", label: "Palau (PW)" },
  { value: "PS", label: "Palestine (PS)" },
  { value: "PA", label: "Panama (PA)" },
  { value: "PG", label: "Papua New Guinea (PG)" },
  { value: "PY", label: "Paraguay (PY)" },
  { value: "PE", label: "Peru (PE)" },
  { value: "PH", label: "Philippines (PH)" },
  { value: "PN", label: "Pitcairn (PN)" },
  { value: "PL", label: "Poland (PL)" },
  { value: "PT", label: "Portugal (PT)" },
  { value: "PR", label: "Puerto Rico (PR)" },
  { value: "QA", label: "Qatar (QA)" },
  { value: "RE", label: "Reunion (RE)" },
  { value: "RO", label: "Romania (RO)" },
  { value: "RU", label: "Russia (RU)" },
  { value: "RW", label: "Rwanda (RW)" },
  { value: "BL", label: "Saint Barthélemy (BL)" },
  { value: "SH", label: "Saint Helena (SH)" },
  { value: "KN", label: "Saint Kitts and Nevis (KN)" },
  { value: "LC", label: "Saint Lucia (LC)" },
  { value: "MF", label: "Saint Martin (MF)" },
  { value: "PM", label: "Saint Pierre and Miquelon (PM)" },
  { value: "VC", label: "Saint Vincent and the Grenadines (VC)" },
  { value: "WS", label: "Samoa (WS)" },
  { value: "SM", label: "San Marino (SM)" },
  { value: "ST", label: "Sao Tome and Principe (ST)" },
  { value: "SA", label: "Saudi Arabia (SA)" },
  { value: "SN", label: "Senegal (SN)" },
  { value: "RS", label: "Serbia (RS)" },
  { value: "SC", label: "Seychelles (SC)" },
  { value: "SL", label: "Sierra Leone (SL)" },
  { value: "SG", label: "Singapore (SG)" },
  { value: "SX", label: "Sint Maarten (SX)" },
  { value: "SK", label: "Slovakia (SK)" },
  { value: "SI", label: "Slovenia (SI)" },
  { value: "SB", label: "Solomon Islands (SB)" },
  { value: "SO", label: "Somalia (SO)" },
  { value: "ZA", label: "South Africa (ZA)" },
  { value: "GS", label: "South Georgia and the South Sandwich Islands (GS)" },
  { value: "SS", label: "South Sudan (SS)" },
  { value: "ES", label: "Spain (ES)" },
  { value: "LK", label: "Sri Lanka (LK)" },
  { value: "SD", label: "Sudan (SD)" },
  { value: "SR", label: "Suriname (SR)" },
  { value: "SJ", label: "Svalbard and Jan Mayen (SJ)" },
  { value: "SE", label: "Sweden (SE)" },
  { value: "CH", label: "Switzerland (CH)" },
  { value: "SY", label: "Syria (SY)" },
  { value: "TW", label: "Taiwan (TW)" },
  { value: "TJ", label: "Tajikistan (TJ)" },
  { value: "TZ", label: "Tanzania (TZ)" },
  { value: "TH", label: "Thailand (TH)" },
  { value: "TL", label: "Timor-Leste (TL)" },
  { value: "TG", label: "Togo (TG)" },
  { value: "TK", label: "Tokelau (TK)" },
  { value: "TO", label: "Tonga (TO)" },
  { value: "TT", label: "Trinidad and Tobago (TT)" },
  { value: "TN", label: "Tunisia (TN)" },
  { value: "TR", label: "Turkey (TR)" },
  { value: "TM", label: "Turkmenistan (TM)" },
  { value: "TC", label: "Turks and Caicos Islands (TC)" },
  { value: "TV", label: "Tuvalu (TV)" },
  { value: "UG", label: "Uganda (UG)" },
  { value: "UA", label: "Ukraine (UA)" },
  { value: "AE", label: "United Arab Emirates (AE)" },
  { value: "GB", label: "United Kingdom (GB)" },
  { value: "UM", label: "U.S. Minor Outlying Islands (UM)" },
  { value: "US", label: "United States (US)" },
  { value: "UY", label: "Uruguay (UY)" },
  { value: "UZ", label: "Uzbekistan (UZ)" },
  { value: "VU", label: "Vanuatu (VU)" },
  { value: "VE", label: "Venezuela (VE)" },
  { value: "VN", label: "Vietnam (VN)" },
  { value: "VG", label: "Virgin Islands, British (VG)" },
  { value: "VI", label: "Virgin Islands, U.S. (VI)" },
  { value: "WF", label: "Wallis and Futuna (WF)" },
  { value: "EH", label: "Western Sahara (EH)" },
  { value: "YE", label: "Yemen (YE)" },
  { value: "ZM", label: "Zambia (ZM)" },
  { value: "ZW", label: "Zimbabwe (ZW)" }
];


  (function setupAoiSelect2() {
    const nativeSelect = document.getElementById('aoiDropdown'); // your big ISO select
    if (!nativeSelect) return;

    // Optional: hide any old search input if it exists
    const oldSearchInput = document.getElementById('aoiSearchInput');
    const aoiOptions = ISO_LOCATIONS;


    // Hide the native select; we'll keep it for storing the real value
    nativeSelect.style.display = 'none';

    // Create Select2-style structure:
    // <div class="custom-select2">
    //   <div class="select2-display">...</div>
    //   <div class="select2-dropdown">
    //     <input class="select2-search" />
    //     <ul class="select2-results"></ul>
    //   </div>
    // </div>

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select2';

    const display = document.createElement('div');
    display.className = 'select2-display';
    display.id = 'aoiSelect2Display';
    display.textContent = 'Select location…';

    const dropdown = document.createElement('div');
    dropdown.className = 'select2-dropdown';
    dropdown.id = 'aoiSelect2Dropdown';

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'select2-search';
    search.id = 'aoiSelect2Search';
    search.placeholder = 'Search…';

    const results = document.createElement('ul');
    results.className = 'select2-results';
    results.id = 'aoiSelect2Results';

    dropdown.appendChild(search);
    dropdown.appendChild(results);
    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);

    // Insert wrapper right after the native select
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect.nextSibling);

    // If you have a hidden input to store final value, wire it
    const hiddenValueInput = document.getElementById('aoiLocationValue');

    function renderResults(filterText = '') {
      const f = filterText.toLowerCase();
      const filtered = aoiOptions.filter(opt =>
        opt.label.toLowerCase().includes(f) || opt.value.toLowerCase().includes(f)
      );

      results.innerHTML = filtered
        .map(opt => `<li data-value="${opt.value}">${opt.label}</li>`)
        .join('');

      results.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          const val = li.getAttribute('data-value');
          const label = li.textContent;

          // Update UI
          display.textContent = label;

          // Update underlying <select>
          nativeSelect.value = val;

          // Update hidden input (if exists)
          if (hiddenValueInput) hiddenValueInput.value = val;

          // Persist
          saveFormValue('aoiLocation', val);

          // Close dropdown
          dropdown.style.display = 'none';
        });
      });
    }

    // Toggle dropdown on display click
    display.addEventListener('click', () => {
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';

      search.value = '';
      renderResults('');
      search.focus();
    });

    // Search with debounce
    search.addEventListener('input', debounce(() => {
      renderResults(search.value);
    }, 150));

    // Close when clicking outside
    document.addEventListener('click', evt => {
      if (!wrapper.contains(evt.target)) {
        dropdown.style.display = 'none';
      }
    });
  })();

  // ---- AOI COORDINATES ----
  ['minLat', 'maxLat', 'minLon', 'maxLon'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('change', function() {
        saveToDatabase(id, this.value);
      });
    }
  });

  // ---- AOI FILE UPLOAD ----
  const aoiFile = document.getElementById('aoiFile');
  if (aoiFile) {
    aoiFile.addEventListener('change', function() {
      if (this.files.length > 0) {
        saveToDatabase('aoiFileName', this.files[0].name);
      }
    });
  }
});
