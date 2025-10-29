// core/init.js
import { DataManager } from './datamanager.js';

export function initializePage(sectionName) {
  DataManager.init();

  // Auto-save
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', () => {
      const val = el.type === 'checkbox' ? el.checked : el.value;
      DataManager.save(sectionName, 'general', { [el.id]: val });
    });
  });

  // Before leaving page
  window.addEventListener('beforeunload', () => {
    const formData = {};
    document.querySelectorAll('input, select, textarea').forEach(el => {
      formData[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    DataManager.save(sectionName, 'general', formData);
  });
}
