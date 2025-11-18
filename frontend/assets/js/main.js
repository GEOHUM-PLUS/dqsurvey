// ============================================
// MAIN.JS - HOME PAGE INITIALIZATION
// ============================================
// Main entry point for the Data Quality Evaluation Form
// Section-specific functionality can be found in their respective JS files:
// - shared-utils.js: Shared utilities and DataManager
// - section1.js: Initial Information section
// - section2.js: Descriptives section
// - section3.js: Design section
// - section4.js: Conformance section
// - section5.js: Context section
// - summary.js: Summary & Credits section

import { DataManager, initializeHighlighting } from './shared-utils.js';

// ============================================
// HOME PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  const isHomePage = currentPage === '' || currentPage === 'index.html' || currentPage.endsWith('/');
  
  if (isHomePage) {
    console.log('Data Quality Evaluation Form - Home Page Loaded');
    initializeHomePage();
  }
});


function initializeHomePage() {
  // Initialize shared utilities
  initializeHighlighting();
  initializeTooltips();
  DataManager.init();
  
  console.log('Home page initialized with DataManager');
}
