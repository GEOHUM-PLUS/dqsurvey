// ===============================================
// GLOBAL STATE MANAGEMENT (Central Store)
// ===============================================
// Used by ALL sections to share: dataType, evaluationType,
// processingLevel, AOI, datasetTitle, etc.

// Internal store
const STATE = {
  dataType: null,
  evaluationType: null,
  processingLevel: null
};

// Observer lists
const OBS = {};

// ------------------------------
// Register observer
// ------------------------------
export function subscribe(key, callback) {
  if (!OBS[key]) OBS[key] = [];
  OBS[key].push(callback);

  return () => {
    OBS[key] = OBS[key].filter(cb => cb !== callback);
  };
}

// ------------------------------
// Notify observers
// ------------------------------
function notify(key, value, oldValue) {
  if (OBS[key]) {
    OBS[key].forEach(cb => cb(value, oldValue));
  }

  // Global DOM event for any section
  window.dispatchEvent(
    new CustomEvent(key, { detail: { value, oldValue } })
  );
}

// ------------------------------
// Generic setter
// ------------------------------
export function setState(key, value) {
  const oldValue = STATE[key];
  if (oldValue === value) return;

  STATE[key] = value;
  sessionStorage.setItem(key, value);
  notify(key, value, oldValue);
}

// ------------------------------
// Generic getter
// ------------------------------
export function getState(key) {
  return STATE[key];
}

// ------------------------------
// Load from sessionStorage
// ------------------------------
export function initializeState() {
  Object.keys(STATE).forEach(key => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) STATE[key] = saved;
  });

  console.log("Global state initialized:", STATE);
}

// Export shortcut setters
export const setDataType = v => setState("dataType", v);
export const setEvaluationType = v => setState("evaluationType", v);
export const setProcessingLevel = v => setState("processingLevel", v);

// Export shortcuts getters
export const getDataType = () => getState("dataType");
export const getEvaluationType = () => getState("evaluationType");
export const getProcessingLevel = () => getState("processingLevel");
