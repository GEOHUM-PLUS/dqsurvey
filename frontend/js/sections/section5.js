// sections/section5.js
import { DataManager } from '../core/dataManager.js';
import { initializePage } from '../core/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage('section5');

  // Auto-save context inputs
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', () => {
      const val = el.type === 'checkbox' ? el.checked : el.value;
      DataManager.save('section5', 'context', { [el.id]: val });
    });
  });

  // On submit, finalize data + go to summary
  const submitBtn = document.getElementById('submitForm');
  if (submitBtn) {
    submitBtn.addEventListener('click', e => {
      e.preventDefault();
      alert('Context section submitted!');
      // optional: perform last save
      const formData = {};
      document.querySelectorAll('input, select, textarea').forEach(el => {
        formData[el.id] = el.type === 'checkbox' ? el.checked : el.value;
      });
      DataManager.save('section5', 'context', formData);
      // Go to summary dashboard
      window.location.href = 'summary.html';
    });
  }
});
